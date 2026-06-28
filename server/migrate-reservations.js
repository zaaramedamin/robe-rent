require('dotenv').config();
const mongoose = require('mongoose');
const Dress = require('./models/Dress');
const Reservation = require('./models/Reservation');
const { startOfDayUTC } = require('./utils/date');

/**
 * One-off migration to the date-range rental model.
 *
 *  1. Backfills dresses missing `sizes` / `deposit` with sensible defaults.
 *  2. Converts legacy single-day reservations (which had `reservationDate`)
 *     into the new shape: startDate = endDate = reservationDate, plus
 *     pricing snapshots (pricePerDay, rentalDays=1, totalPrice, deposit).
 *
 * Safe to re-run: reservations that already have startDate are skipped.
 *
 * Run with: npm run migrate:reservations
 */

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  // --- 1. Backfill dresses ----------------------------------------
  const dresses = await Dress.find();
  let dressUpdates = 0;
  const priceById = new Map();
  const depositById = new Map();
  for (const d of dresses) {
    let changed = false;
    if (!d.sizes || d.sizes.length === 0) {
      d.sizes = DEFAULT_SIZES;
      changed = true;
    }
    if (!d.deposit || d.deposit === 0) {
      d.deposit = Math.max(100, Math.round(d.pricePerDay / 50) * 50);
      changed = true;
    }
    if (changed) {
      await d.save();
      dressUpdates++;
    }
    priceById.set(String(d._id), d.pricePerDay);
    depositById.set(String(d._id), d.deposit);
  }
  console.log(`✓ Dresses backfilled: ${dressUpdates}`);

  // --- 2. Convert legacy reservations -----------------------------
  // Read raw docs so we can see the old `reservationDate` field even
  // though it's no longer in the schema.
  const raw = await mongoose.connection
    .collection('reservations')
    .find({ startDate: { $exists: false } })
    .toArray();

  let migrated = 0;
  for (const r of raw) {
    const day = startOfDayUTC(r.reservationDate || new Date());
    const price = priceById.get(String(r.dressId)) || 0;
    const deposit = depositById.get(String(r.dressId)) || 0;
    await mongoose.connection.collection('reservations').updateOne(
      { _id: r._id },
      {
        $set: {
          startDate: day,
          endDate: day,
          size: r.size || '',
          pricePerDay: price,
          rentalDays: 1,
          totalPrice: price,
          deposit,
        },
        $unset: { reservationDate: '' },
      }
    );
    migrated++;
  }
  console.log(`✓ Reservations migrated: ${migrated}`);

  await mongoose.disconnect();
  console.log('✓ Migration complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('✗ Migration failed:', err);
  process.exit(1);
});
