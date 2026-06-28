const { z } = require('zod');
const mongoose = require('mongoose');
const { isValidPhoneNumber } = require('libphonenumber-js');

// Default country used when validating phone numbers written without an
// international prefix. Tunisia by default; override per deployment.
const DEFAULT_PHONE_COUNTRY = process.env.DEFAULT_PHONE_COUNTRY || 'TN';

const RESERVATION_STATUSES = [
  'pending',
  'confirmed',
  'out',
  'returned',
  'late',
  'cancelled',
];

/** Reusable Mongo ObjectId field (guards against NoSQL injection). */
const objectId = z
  .string()
  .refine((v) => mongoose.isValidObjectId(v), { message: 'Invalid id.' });

/** A date string that parses to a real calendar day (e.g. "2026-07-04"). */
const dateString = z
  .string()
  .refine((v) => !Number.isNaN(new Date(v).getTime()), { message: 'Invalid date.' });

/** Phone validated against libphonenumber (defaults to Tunisia). */
const phone = z
  .string()
  .trim()
  .min(1, 'Phone number is required.')
  .refine((v) => isValidPhoneNumber(v, DEFAULT_PHONE_COUNTRY), {
    message: 'Please enter a valid phone number.',
  });

const reservationCreateSchema = z.object({
  dressId: objectId,
  customerName: z.string().trim().min(2, 'Please enter your full name.').max(120),
  phone,
  email: z.string().trim().email('Please enter a valid email address.'),
  startDate: dateString,
  endDate: dateString.optional(),
  size: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(1000).optional(),
});

const adminLoginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

// Use a string + refine (rather than z.enum) so the friendly message is
// version-independent across Zod releases.
const statusUpdateSchema = z.object({
  status: z.string().refine((v) => RESERVATION_STATUSES.includes(v), {
    message: `Status must be one of: ${RESERVATION_STATUSES.join(', ')}.`,
  }),
});

const idParamSchema = z.object({ id: objectId });

module.exports = {
  reservationCreateSchema,
  adminLoginSchema,
  statusUpdateSchema,
  idParamSchema,
  RESERVATION_STATUSES,
};
