const express = require('express');
const mongoose = require('mongoose');
const Dress = require('../models/Dress');
const Reservation = require('../models/Reservation');
const { addDaysUTC, eachDayISO } = require('../utils/date');

const router = express.Router();

// Cleaning/maintenance buffer (days) — mirrors the reservations route.
const BUFFER_DAYS = Number(process.env.BOOKING_BUFFER_DAYS || 1);
const BLOCKING_STATUSES = ['pending', 'confirmed', 'out', 'late'];

/**
 * GET /api/dresses
 * Returns all dresses. Supports optional query filters used by the
 * gallery: ?category=, ?minPrice=, ?maxPrice=.
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    const dresses = await Dress.find(filter).sort({ createdAt: -1 });
    res.json(dresses);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dresses/:id
 * Returns a single dress by id.
 */
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid dress id.' });
    }
    const dress = await Dress.findById(req.params.id);
    if (!dress) return res.status(404).json({ message: 'Dress not found.' });
    res.json(dress);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dresses/:id/reserved-dates
 * Returns an array of YYYY-MM-DD strings the dress is unavailable on.
 * Each active reservation blocks its rental range plus the cleaning
 * buffer on both sides, so the client paints exactly the days that
 * cannot be part of a new booking.
 */
router.get('/:id/reserved-dates', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid dress id.' });
    }

    const reservations = await Reservation.find({
      dressId: req.params.id,
      status: { $in: BLOCKING_STATUSES },
    }).select('startDate endDate');

    // Expand each reservation to its blocked days (range ± buffer) and
    // dedupe into a sorted set of date strings.
    const days = new Set();
    for (const r of reservations) {
      const from = addDaysUTC(r.startDate, -BUFFER_DAYS);
      const to = addDaysUTC(r.endDate, BUFFER_DAYS);
      for (const d of eachDayISO(from, to)) days.add(d);
    }

    res.json([...days].sort());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
