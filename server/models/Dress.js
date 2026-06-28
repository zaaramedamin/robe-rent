const mongoose = require('mongoose');

/**
 * Dress schema
 * Represents a single rentable wedding dress in the catalogue.
 */
const dressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    // Used for filtering in the gallery. Free-form but seeded with
    // "classic", "modern", and "oriental".
    category: {
      type: String,
      enum: ['classic', 'modern', 'oriental'],
      default: 'classic',
      index: true,
    },
    pricePerDay: { type: Number, required: true, min: 0 },
    // Refundable security deposit taken at pickup (reimbursed on safe
    // return). 0 means no deposit required.
    deposit: { type: Number, default: 0, min: 0 },
    // Sizes this gown is available in, e.g. ["S", "M", "L"] or ["38", "40"].
    sizes: { type: [String], default: [] },
    // Array of image URLs. Uploaded images are stored in the database
    // and referenced as "/api/images/<id>".
    images: { type: [String], default: [] },
    // Global "is this dress rentable at all" flag, independent of
    // any per-date reservations.
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dress', dressSchema);
