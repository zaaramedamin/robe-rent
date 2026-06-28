require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

const dressesRouter = require('./routes/dresses');
const reservationsRouter = require('./routes/reservations');
const adminRouter = require('./routes/admin');
const adminDressesRouter = require('./routes/adminDresses');
const imagesRouter = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 5000;

// Behind a hosting proxy (e.g. Render), trust the first proxy hop so the
// real client IP is used for rate limiting (and to satisfy express-rate-limit).
app.set('trust proxy', 1);

// --- Middleware ----------------------------------------------------
// Secure HTTP headers. Allow images to be embedded cross-origin since the
// client may be served from a different origin than this API.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Allow the Vite dev client (port 5173 by default) to call the API.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  })
);
app.use(express.json());

// Request logging (development): pipe morgan through the winston stream.
if (!['production', 'test'].includes(process.env.NODE_ENV)) {
  app.use(morgan('dev', { stream: logger.stream }));
}

// --- Rate limiting -------------------------------------------------
// Generous global cap, with stricter limits on abuse-prone public
// endpoints (login brute-forcing, reservation spam).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
});
const reservationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many reservation requests. Please try again later.' },
});

app.use('/api', apiLimiter);
app.use('/api/admin/login', loginLimiter);
app.use('/api/reservations', reservationLimiter);

// --- Health check --------------------------------------------------
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// --- Routes --------------------------------------------------------
app.use('/api/dresses', dressesRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/images', imagesRouter);
// Admin dress management is mounted before the generic admin router.
app.use('/api/admin/dresses', adminDressesRouter);
app.use('/api/admin', adminRouter);

// --- 404 + error handlers -----------------------------------------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Centralised error handler so every route can simply call next(err).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Treat file-upload (multer) problems as bad requests.
  let status = err.status || 500;
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    err.message = 'Each image must be 5MB or smaller.';
  } else if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    status = 400;
    err.message = 'Too many images (max 6).';
  }

  // 5xx are real server faults (log with stack); 4xx are client issues.
  const meta = { method: req.method, url: req.originalUrl, status };
  if (status >= 500) logger.error(err.stack || err.message, meta);
  else logger.warn(err.message, meta);

  const body = { message: err.message || 'Something went wrong on the server.' };
  if (err.errors) body.errors = err.errors;
  res.status(status).json(body);
});

// --- Start ---------------------------------------------------------
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    reason: reason && reason.stack ? reason.stack : String(reason),
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.stack || err.message });
  process.exit(1);
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✓ Connected to MongoDB');
    app.listen(PORT, () => logger.info(`✓ Server running on port ${PORT}`));
  } catch (err) {
    logger.error(`✗ Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
}

// Only start listening when run directly (not when imported by tests).
if (require.main === module) {
  start();
}

module.exports = app;
