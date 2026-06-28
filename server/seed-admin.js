require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

/**
 * Bootstrap / manage admin accounts.
 *
 *   npm run seed:admin
 *       Creates (or updates) the default admin from the ADMIN_USERNAME /
 *       ADMIN_PASSWORD environment variables.
 *
 *   node seed-admin.js <username> <password> [role]
 *       Creates or updates a specific admin. role defaults to "admin"
 *       (the other allowed value is "staff").
 */
async function run() {
  const [, , argUser, argPass, argRole] = process.argv;
  const username = (argUser || process.env.ADMIN_USERNAME || '').toLowerCase().trim();
  const password = argPass || process.env.ADMIN_PASSWORD || '';
  const role = argRole || 'admin';

  if (!username || !password) {
    console.error(
      '✗ Provide a username and password (CLI args, or ADMIN_USERNAME / ADMIN_PASSWORD env vars).'
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    let admin = await Admin.findOne({ username });
    if (admin) {
      await admin.setPassword(password);
      admin.role = role;
      await admin.save();
      console.log(`✓ Updated existing admin "${username}" (role: ${role}).`);
    } else {
      admin = await Admin.createWithPassword({ username, password, role });
      console.log(`✓ Created admin "${username}" (role: ${role}).`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('✗ Failed to seed admin:', err.message);
    process.exit(1);
  }
}

run();
