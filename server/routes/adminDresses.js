const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Dress = require('../models/Dress');
const Image = require('../models/Image');
const Reservation = require('../models/Reservation');
const requireAdmin = require('../middleware/auth');

const router = express.Router();

// Every route here is admin-only.
router.use(requireAdmin);

// Multer keeps uploads in memory so we can write the buffer straight to
// MongoDB. Limit to 5MB per file, 6 files, images only.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    const err = new Error('Only image files are allowed.');
    err.status = 400;
    cb(err);
  },
});

const IMG_PREFIX = '/api/images/';

/** Persist uploaded files as Image docs and return their served URLs. */
async function saveUploadedImages(files = []) {
  const urls = [];
  for (const f of files) {
    const doc = await Image.create({
      data: f.buffer,
      contentType: f.mimetype,
      filename: f.originalname,
    });
    urls.push(`${IMG_PREFIX}${doc._id}`);
  }
  return urls;
}

/** Delete DB-stored images for the given URLs (ignores external URLs). */
async function deleteDbImages(urls = []) {
  const ids = urls
    .filter((u) => typeof u === 'string' && u.startsWith(IMG_PREFIX))
    .map((u) => u.slice(IMG_PREFIX.length))
    .filter((id) => mongoose.isValidObjectId(id));
  if (ids.length) await Image.deleteMany({ _id: { $in: ids } });
}

/** Parse the multipart `available` field (arrives as a string). */
function parseAvailable(value, fallback = true) {
  if (value === undefined) return fallback;
  return value === 'true' || value === true;
}

/**
 * Parse the `sizes` field, which may arrive as a JSON array string
 * (e.g. '["S","M"]') or a comma-separated string (e.g. "S, M, L").
 */
function parseSizes(value) {
  if (value === undefined || value === null || value === '') return [];
  try {
    const arr = JSON.parse(value);
    if (Array.isArray(arr)) return arr.map((s) => String(s).trim()).filter(Boolean);
  } catch {
    /* not JSON — fall through to comma split */
  }
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * POST /api/admin/dresses
 * Create a dress. Accepts multipart/form-data:
 *   text fields: name, description, category, pricePerDay, available
 *   files:       images (up to 6)
 *   optional:    imageUrls (JSON array of existing/external URLs to include)
 */
router.post('/', upload.array('images', 6), async (req, res, next) => {
  try {
    const { name, description, category, pricePerDay } = req.body;

    if (!name || pricePerDay === undefined || pricePerDay === '') {
      return res
        .status(400)
        .json({ message: 'Name and price per day are required.' });
    }

    const uploaded = await saveUploadedImages(req.files);
    let externalUrls = [];
    if (req.body.imageUrls) {
      try {
        externalUrls = JSON.parse(req.body.imageUrls);
      } catch {
        /* ignore malformed input */
      }
    }

    const dress = await Dress.create({
      name: name.trim(),
      description: description || '',
      category: category || 'classic',
      pricePerDay: Number(pricePerDay),
      deposit: req.body.deposit ? Number(req.body.deposit) : 0,
      sizes: parseSizes(req.body.sizes),
      available: parseAvailable(req.body.available, true),
      images: [...externalUrls, ...uploaded],
    });

    res.status(201).json(dress);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/dresses/:id
 * Update a dress. Same multipart shape as create, plus:
 *   existingImages: JSON array of currently-saved image URLs to KEEP.
 * Any previously-stored DB image not in that list is deleted. Newly
 * uploaded files are appended.
 */
router.put('/:id', upload.array('images', 6), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid dress id.' });
    }
    const dress = await Dress.findById(req.params.id);
    if (!dress) return res.status(404).json({ message: 'Dress not found.' });

    // Determine which existing images to keep (defaults to all current).
    let keep = dress.images;
    if (req.body.existingImages !== undefined) {
      try {
        keep = JSON.parse(req.body.existingImages);
      } catch {
        keep = dress.images;
      }
    }

    // Clean up DB images that were removed.
    const removed = dress.images.filter((u) => !keep.includes(u));
    await deleteDbImages(removed);

    const uploaded = await saveUploadedImages(req.files);
    dress.images = [...keep, ...uploaded];

    // Update scalar fields when provided.
    const { name, description, category, pricePerDay } = req.body;
    if (name !== undefined) dress.name = name.trim();
    if (description !== undefined) dress.description = description;
    if (category !== undefined) dress.category = category;
    if (pricePerDay !== undefined && pricePerDay !== '') {
      dress.pricePerDay = Number(pricePerDay);
    }
    if (req.body.deposit !== undefined && req.body.deposit !== '') {
      dress.deposit = Number(req.body.deposit);
    }
    if (req.body.sizes !== undefined) {
      dress.sizes = parseSizes(req.body.sizes);
    }
    if (req.body.available !== undefined) {
      dress.available = parseAvailable(req.body.available);
    }

    await dress.save();
    res.json(dress);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/dresses/:id
 * Delete a dress, its stored images, and any reservations for it.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid dress id.' });
    }
    const dress = await Dress.findById(req.params.id);
    if (!dress) return res.status(404).json({ message: 'Dress not found.' });

    await deleteDbImages(dress.images);
    await Reservation.deleteMany({ dressId: dress._id });
    await dress.deleteOne();

    res.json({ message: 'Dress deleted.', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
