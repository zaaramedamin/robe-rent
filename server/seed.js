require('dotenv').config();
const mongoose = require('mongoose');
const Dress = require('./models/Dress');
const Reservation = require('./models/Reservation');
const { startOfDayUTC } = require('./utils/date');

/**
 * Seed script (reservations only).
 *
 * Dresses now live permanently in the database and are managed through
 * the admin dashboard, so this script no longer creates them. It seeds
 * a few demo reservations against the dresses that already exist.
 *
 * Run with: npm run seed
 */

// Build reservation dates relative to "today" so the calendar always
// has upcoming bookings to display.
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return startOfDayUTC(d);
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const dresses = await Dress.find().sort({ createdAt: 1 });
    if (dresses.length === 0) {
      console.log(
        '⚠ No dresses found. Add dresses from the admin dashboard first, then re-run.'
      );
      await mongoose.disconnect();
      process.exit(0);
    }

    // Backfill sizes + a sensible deposit on any dress missing them
    // (so older seeded dresses get the new rental fields).
    const defaultSizes = ['XS', 'S', 'M', 'L', 'XL'];
    let backfilled = 0;
    for (const d of dresses) {
      let changed = false;
      if (!d.sizes || d.sizes.length === 0) {
        d.sizes = defaultSizes;
        changed = true;
      }
      if (!d.deposit || d.deposit === 0) {
        // Deposit ≈ one day's rental, rounded to nearest 50 TND.
        d.deposit = Math.max(100, Math.round(d.pricePerDay / 50) * 50);
        changed = true;
      }
      if (changed) {
        await d.save();
        backfilled++;
      }
    }
    if (backfilled) console.log(`✓ Backfilled sizes/deposit on ${backfilled} dresses`);

    // Pick a dress safely by index (wraps around if there are few).
    const pick = (i) => dresses[i % dresses.length];

    await Reservation.deleteMany({});
    console.log('✓ Cleared existing reservations');

    // Build a reservation with pricing snapshots from its dress.
    const make = ({ dress, customerName, phone, email, start, days, notes, status }) => {
      const startDate = daysFromNow(start);
      const endDate = daysFromNow(start + days - 1);
      return {
        dressId: dress._id,
        customerName,
        phone,
        email,
        startDate,
        endDate,
        size: dress.sizes[Math.floor(dress.sizes.length / 2)] || '',
        pricePerDay: dress.pricePerDay,
        rentalDays: days,
        totalPrice: dress.pricePerDay * days,
        deposit: dress.deposit,
        notes: notes || '',
        status,
      };
    };

    const reservations = [
      make({ dress: pick(0), customerName: 'Amira Ben Salah', phone: '+216 22 345 678', email: 'amira.bensalah@example.com', start: 5, days: 3, notes: 'Needs minor alterations on the sleeves.', status: 'confirmed' }),
      make({ dress: pick(4), customerName: 'Yasmine Trabelsi', phone: '+216 98 112 233', email: 'yasmine.t@example.com', start: 12, days: 4, notes: 'Henna night reservation.', status: 'pending' }),
      make({ dress: pick(2), customerName: 'Nour Gharbi', phone: '+216 55 778 899', email: 'nour.gharbi@example.com', start: 3, days: 2, notes: '', status: 'pending' }),
      make({ dress: pick(0), customerName: 'Sarra Khelifi', phone: '+216 27 654 321', email: 'sarra.k@example.com', start: 20, days: 5, notes: 'Second fitting requested.', status: 'returned' }),
    ];

    await Reservation.insertMany(reservations);
    console.log(`✓ Inserted ${reservations.length} reservations`);

    await mongoose.disconnect();
    console.log('✓ Seeding complete. Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('✗ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
