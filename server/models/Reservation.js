const mongoose = require('mongoose');

// A single status transition, recorded for audit purposes.
const statusEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    by: { type: String, default: '' }, // admin username, or "" for customer/system
  },
  { _id: false }
);

/**
 * Reservation schema
 * A pre-reservation made by a customer for a specific dress on a
 * specific calendar day.
 */
const reservationSchema = new mongoose.Schema(
  {
    dressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dress',
      required: true,
      index: true,
    },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    // The rental period [startDate, endDate], inclusive. Both are stored
    // normalised to midnight UTC so availability checks compare days,
    // not timestamps. A single-day rental has startDate === endDate.
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // Optional selected size.
    size: { type: String, default: '' },
    // Pricing snapshots captured at booking time (so later price/deposit
    // changes don't rewrite history).
    pricePerDay: { type: Number, default: 0 },
    rentalDays: { type: Number, default: 1 },
    totalPrice: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    // Lifecycle: pending -> confirmed -> out (picked up) -> returned.
    // "late" flags an overdue return; "cancelled" releases the dates.
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'out', 'returned', 'late', 'cancelled'],
      default: 'pending',
    },
    // Append-only audit trail of status changes (most recent last).
    statusHistory: { type: [statusEventSchema], default: [] },
  },
  { timestamps: true }
);

// Speeds up availability lookups by dress + date range.
reservationSchema.index({ dressId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
