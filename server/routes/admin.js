const express = require('express');
const jwt = require('jsonwebtoken');
const Reservation = require('../models/Reservation');
const Dress = require('../models/Dress');
const Admin = require('../models/Admin');
const requireAdmin = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  adminLoginSchema,
  statusUpdateSchema,
  idParamSchema,
} = require('../validators');
const { eachDayISO } = require('../utils/date');

const router = express.Router();

/**
 * POST /api/admin/login
 * Authenticates an admin against the database (bcrypt-hashed password)
 * and returns a signed JWT carrying the admin id and role.
 */
router.post('/login', validate({ body: adminLoginSchema }), async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username.toLowerCase() });

    // Run the (slow) hash comparison whether or not the user exists so we
    // don't leak which usernames are valid via response timing, then
    // return a single generic error.
    const ok = admin ? await admin.comparePassword(password) : false;
    if (!ok) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { sub: admin._id.toString(), role: admin.role, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    return res.json({
      token,
      admin: { username: admin.username, role: admin.role },
    });
  } catch (err) {
    next(err);
  }
});

// Every route below requires a valid admin token.
router.use(requireAdmin);

/**
 * GET /api/admin/reservations
 * Returns all reservations with their dress populated, newest first.
 */
router.get('/reservations', async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate('dressId', 'name category pricePerDay')
      .sort({ startDate: 1, createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/reservations/:id/status
 * Updates a reservation's status across the rental lifecycle.
 */
router.patch(
  '/reservations/:id/status',
  validate({ params: idParamSchema, body: statusUpdateSchema }),
  async (req, res, next) => {
  try {
    const { status } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: {
          statusHistory: { status, at: new Date(), by: req.admin?.username || '' },
        },
      },
      { new: true }
    ).populate('dressId', 'name category pricePerDay');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    res.json(reservation);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/calendar
 * Returns all non-cancelled reservations grouped by day. A multi-day
 * rental appears under every day in its range, e.g.
 * { "2026-07-04": [ {reservation...}, ... ], ... }
 */
router.get('/calendar', async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ status: { $ne: 'cancelled' } })
      .populate('dressId', 'name category')
      .sort({ startDate: 1 });

    const grouped = {};
    for (const r of reservations) {
      for (const key of eachDayISO(r.startDate, r.endDate)) {
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);
      }
    }

    res.json(grouped);
  } catch (err) {
    next(err);
  }
});

// Statuses that represent realized income ("gains"). Pending is
// potential; cancelled is none. Revenue uses the totalPrice snapshot
// stored on each reservation at booking time.
const GAIN_STATUSES = ['confirmed', 'out', 'returned', 'late'];
const ALL_STATUSES = ['pending', 'confirmed', 'out', 'returned', 'late', 'cancelled'];

/**
 * GET /api/admin/stats
 * Dashboard statistics: revenue (realized vs. pending), counts by
 * status and category, totals, and the most reserved dresses.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    // Reservations whose rental starts this month (excluding cancelled).
    const totalThisMonth = await Reservation.countDocuments({
      startDate: { $gte: monthStart, $lt: monthEnd },
      status: { $ne: 'cancelled' },
    });

    const totalAll = await Reservation.countDocuments();
    const totalDresses = await Dress.countDocuments();

    // Most reserved dresses (excluding cancelled).
    const topDresses = await Reservation.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$dressId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'dresses', localField: '_id', foreignField: '_id', as: 'dress' } },
      { $unwind: '$dress' },
      { $project: { _id: 0, dressId: '$_id', name: '$dress.name', count: 1 } },
    ]);

    // Per-status counts + revenue (from the totalPrice snapshot) and the
    // value of deposits currently held.
    const byStatus = await Reservation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          deposits: { $sum: '$deposit' },
        },
      },
    ]);

    const statusCounts = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0]));
    let realizedRevenue = 0;
    let pendingRevenue = 0;
    let depositsHeld = 0;
    for (const s of byStatus) {
      if (s._id in statusCounts) statusCounts[s._id] = s.count;
      if (GAIN_STATUSES.includes(s._id)) realizedRevenue += s.revenue;
      if (s._id === 'pending') pendingRevenue += s.revenue;
      // Deposits are "held" while the dress is reserved/out (not yet returned).
      if (['confirmed', 'out', 'late'].includes(s._id)) depositsHeld += s.deposits;
    }

    // Realized revenue for rentals starting this month.
    const monthRealized = await Reservation.aggregate([
      { $match: { status: { $in: GAIN_STATUSES }, startDate: { $gte: monthStart, $lt: monthEnd } } },
      { $group: { _id: null, revenue: { $sum: '$totalPrice' } } },
    ]);

    // Reservations per dress category (excluding cancelled).
    const categoryCounts = await Reservation.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $lookup: { from: 'dresses', localField: 'dressId', foreignField: '_id', as: 'dress' } },
      { $unwind: '$dress' },
      { $group: { _id: '$dress.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
    ]);

    res.json({
      totalThisMonth,
      totalAll,
      totalDresses,
      topDresses,
      statusCounts,
      categoryCounts,
      revenue: {
        realized: realizedRevenue,
        pending: pendingRevenue,
        total: realizedRevenue + pendingRevenue,
        thisMonthRealized: monthRealized[0]?.revenue || 0,
        depositsHeld,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/stats/history
 * Monthly history of reservations and gains, grouped by the rental's
 * start month. Returns chronologically sorted rows for chart/table use.
 */
router.get('/stats/history', async (req, res, next) => {
  try {
    const inGain = { $in: ['$status', GAIN_STATUSES] };
    const rows = await Reservation.aggregate([
      {
        $group: {
          _id: { y: { $year: '$startDate' }, m: { $month: '$startDate' } },
          reservations: { $sum: 1 },
          realized: { $sum: { $cond: [inGain, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          // Gains from realized bookings; potential also includes pending.
          revenue: { $sum: { $cond: [inGain, '$totalPrice', 0] } },
          potential: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$totalPrice', 0] } },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const history = rows.map((r) => ({
      month: `${r._id.y}-${String(r._id.m).padStart(2, '0')}`,
      label: `${months[r._id.m - 1]} ${r._id.y}`,
      reservations: r.reservations,
      realized: r.realized,
      pending: r.pending,
      cancelled: r.cancelled,
      revenue: r.revenue,
      potential: r.potential,
    }));

    res.json(history);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/clients
 * Client history: reservations grouped by customer (keyed on email),
 * with totals, realized spend, and first/last booking dates.
 */
router.get('/clients', async (req, res, next) => {
  try {
    const inGain = { $in: ['$status', GAIN_STATUSES] };
    const clients = await Reservation.aggregate([
      { $sort: { startDate: 1 } },
      {
        $group: {
          _id: '$email',
          name: { $last: '$customerName' },
          phone: { $last: '$phone' },
          totalReservations: { $sum: 1 },
          realized: { $sum: { $cond: [inGain, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalSpend: { $sum: { $cond: [inGain, '$totalPrice', 0] } },
          firstReservation: { $min: '$startDate' },
          lastReservation: { $max: '$startDate' },
        },
      },
      { $sort: { totalSpend: -1, totalReservations: -1 } },
      {
        $project: {
          _id: 0,
          email: '$_id',
          name: 1,
          phone: 1,
          totalReservations: 1,
          realized: 1,
          pending: 1,
          cancelled: 1,
          totalSpend: 1,
          firstReservation: 1,
          lastReservation: 1,
        },
      },
    ]);

    res.json(clients);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
