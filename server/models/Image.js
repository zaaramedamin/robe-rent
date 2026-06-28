const mongoose = require('mongoose');

/**
 * Image schema
 * Stores an uploaded image's binary data directly in MongoDB so dress
 * photos live in the database (not the filesystem or an external host).
 * Each image is served back to clients via GET /api/images/:id.
 *
 * Note: MongoDB documents are capped at 16MB, which is plenty for the
 * compressed dress photos this app handles (upload limit is 5MB).
 */
const imageSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    filename: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Image', imageSchema);
