const express = require('express');
const mongoose = require('mongoose');
const Image = require('../models/Image');

const router = express.Router();

/**
 * GET /api/images/:id
 * Public endpoint that streams an image stored in the database back to
 * the browser with the correct content type. Dress documents store
 * URLs like "/api/images/<id>" which resolve here.
 */
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('Invalid image id.');
    }
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).send('Image not found.');

    res.set('Content-Type', image.contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // cache for a day
    return res.send(image.data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
