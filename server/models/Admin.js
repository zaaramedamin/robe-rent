const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Admin / staff account. Passwords are never stored in plaintext — only
 * a bcrypt hash is persisted. Supports multiple accounts and a coarse
 * role field for future role-based access control.
 */
const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff'], default: 'admin' },
  },
  { timestamps: true }
);

/** Hash and set the password on this document (does not save). */
adminSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, SALT_ROUNDS);
};

/** Compare a plaintext password against the stored hash. */
adminSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

/** Create and save an admin from a plaintext password. */
adminSchema.statics.createWithPassword = async function createWithPassword({
  username,
  password,
  role = 'admin',
}) {
  const admin = new this({ username, role });
  await admin.setPassword(password);
  return admin.save();
};

// Never expose the password hash in API responses.
adminSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model('Admin', adminSchema);
