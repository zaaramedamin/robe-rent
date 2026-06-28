require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const dressesRouter = require('./routes/dresses');
const reservationsRouter = require('./routes/reservations');
const adminRouter = require('./routes/admin');
const adminDressesRouter = require('./routes/adminDresses');
const imagesRouter = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ----------------------------------------------------
// Allow the Vite dev client (port 5173 by default) to call the API.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  })
);
app.use(express.json());

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
  console.error(err);
  // Treat file-upload (multer) problems as bad requests.
  let status = err.status || 500;
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    err.message = 'Each image must be 5MB or smaller.';
  } else if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    status = 400;
    err.message = 'Too many images (max 6).';
  }
  res.status(status).json({
    message: err.message || 'Something went wrong on the server.',
  });
});

// --- Start ---------------------------------------------------------
async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
  } catch (err) {
    console.error('✗ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

start();
