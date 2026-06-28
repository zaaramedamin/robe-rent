const express = require('express');
const mongoose = require('mongoose');
const Dress = require('../models/Dress');
const Reservation = require('../models/Reservation');
const { startOfDayUTC, addDaysUTC, daysInclusive } = require('../utils/date');

const router = express.Router();

// Cleaning/maintenance buffer (days) enforced between two rentals.
const BUFFER_DAYS = Number(process.env.BOOKING_BUFFER_DAYS || 1);

// Statuses that actively hold a dress's dates (block new bookings).
// "cancelled" and "returned" release the dates.
const BLOCKING_STATUSES = ['pending', 'confirmed', 'out', 'late'];

/**
 * Find a reservation that conflicts with the requested [start, end]
 * range for a dress. Two rentals must be separated by BUFFER_DAYS, so
 * each existing reservation effectively blocks [start - buffer,
 * end + buffer]. A conflict exists when the requested range overlaps
 * that expanded window.
 */
function findConflict(dressId, reqStart, reqEnd) {
  return Reservation.findOne({
    dressId,
    status: { $in: BLOCKING_STATUSES },
    // existing.startDate <= reqEnd + buffer
    startDate: { $lte: addDaysUTC(reqEnd, BUFFER_DAYS) },
    // existing.endDate >= reqStart - buffer
    endDate: { $gte: addDaysUTC(reqStart, -BUFFER_DAYS) },
  });
}

/**
 * POST /api/reservations
 * Creates a customer pre-reservation for a date range.
 *
 * Availability is validated server-side here (the frontend also checks
 * for UX, but the backend is the source of truth): the requested range
 * must not overlap any active reservation's range plus the cleaning
 * buffer on either side.
 */
router.post('/', async (req, res, next) => {
  try {
    const { dressId, customerName, phone, email, startDate, endDate, notes, size } =
      req.body;

    // --- Basic field validation -------------------------------------
    if (!dressId || !customerName || !phone || !email || !startDate) {
      return res.status(400).json({
        message:
          'Missing required fields: dressId, customerName, phone, email and startDate are required.',
      });
    }
    if (!mongoose.isValidObjectId(dressId)) {
      return res.status(400).json({ message: 'Invalid dress id.' });
    }

    const start = startOfDayUTC(startDate);
    // endDate is optional; a missing end means a single-day rental.
    const end = endDate ? startOfDayUTC(endDate) : start;
    if (!start || !end) {
      return res.status(400).json({ message: 'Invalid reservation date(s).' });
    }
    if (end < start) {
      return res
        .status(400)
        .json({ message: 'The return date must be on or after the start date.' });
    }

    // --- The dress must exist and be globally rentable --------------
    const dress = await Dress.findById(dressId);
    if (!dress) return res.status(404).json({ message: 'Dress not found.' });
    if (!dress.available) {
      return res
        .status(409)
        .json({ message: 'This dress is currently not available for rental.' });
    }

    // --- Real-time availability check (source of truth) -------------
    const clash = await findConflict(dressId, start, end);
    if (clash) {
      return res.status(409).json({
        message:
          'Sorry, this dress is already reserved for those dates (a cleaning buffer is required between rentals). Please choose another period.',
      });
    }

    // --- Pricing snapshots ------------------------------------------
    const rentalDays = daysInclusive(start, end);
    const pricePerDay = dress.pricePerDay;
    const totalPrice = pricePerDay * rentalDays;

    // --- Persist ----------------------------------------------------
    const reservation = await Reservation.create({
      dressId,
      customerName,
      phone,
      email,
      startDate: start,
      endDate: end,
      size: size || '',
      pricePerDay,
      rentalDays,
      totalPrice,
      deposit: dress.deposit || 0,
      notes: notes || '',
      status: 'pending',
    });

    res.status(201).json({
      message: 'Your reservation request has been received!',
      reservation,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
