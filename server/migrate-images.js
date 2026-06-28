require('dotenv').config();
const mongoose = require('mongoose');
const Dress = require('./models/Dress');
const Image = require('./models/Image');

/**
 * One-off migration: download every external dress image (http/https
 * link) and store the actual bytes in the database (Image collection),
 * then replace the dress's link with a "/api/images/<id>" reference.
 *
 * After this runs, no dress depends on an external web link — every
 * image is served from your own database. Already-migrated images
 * (refs that start with /api/images/) are left untouched, so it is safe
 * to re-run.
 *
 * Run with: npm run migrate:images
 */

const IMG_PREFIX = '/api/images/';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  const dresses = await Dress.find();
  // Cache so identical URLs reused across dresses are stored only once.
  const cache = new Map();
  let stored = 0;
  let reused = 0;
  let alreadyInDb = 0;
  let failed = 0;

  for (const dress of dresses) {
    const updated = [];
    for (const url of dress.images) {
      // Already a DB reference -> keep as is.
      if (!url || url.startsWith(IMG_PREFIX)) {
        updated.push(url);
        alreadyInDb++;
        continue;
      }
      // Not an http(s) link (e.g. data URI) -> leave untouched.
      if (!/^https?:\/\//i.test(url)) {
        updated.push(url);
        continue;
      }
      // Same external URL already downloaded in this run.
      if (cache.has(url)) {
        updated.push(cache.get(url));
        reused++;
        continue;
      }
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const buffer = Buffer.from(await res.arrayBuffer());
        const doc = await Image.create({ data: buffer, contentType, filename: '' });
        const ref = `${IMG_PREFIX}${doc._id}`;
        cache.set(url, ref);
        updated.push(ref);
        stored++;
        console.log(`  ↓ ${dress.name}: stored ${(buffer.length / 1024).toFixed(0)} KB (${contentType})`);
      } catch (err) {
        console.log(`  ✗ ${dress.name}: could not fetch ${url} — ${err.message} (kept link)`);
        updated.push(url);
        failed++;
      }
    }
    dress.images = updated;
    await dress.save();
  }

  console.log(
    `✓ Done. stored=${stored}, reused=${reused}, alreadyInDb=${alreadyInDb}, failed=${failed}`
  );
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('✗ Migration failed:', err);
  process.exit(1);
});
