const {
  reservationCreateSchema,
  adminLoginSchema,
  statusUpdateSchema,
  idParamSchema,
} = require('../validators');

const validReservation = {
  dressId: '64b8f0c2f1a2b3c4d5e6f7a8',
  customerName: 'Amira Ben Salah',
  phone: '+216 22 345 678',
  email: 'amira@example.com',
  startDate: '2026-07-04',
  endDate: '2026-07-06',
};

describe('reservationCreateSchema', () => {
  test('accepts a valid payload', () => {
    expect(() => reservationCreateSchema.parse(validReservation)).not.toThrow();
  });

  test('rejects an invalid email', () => {
    expect(() =>
      reservationCreateSchema.parse({ ...validReservation, email: 'nope' })
    ).toThrow();
  });

  test('rejects an invalid phone number', () => {
    expect(() =>
      reservationCreateSchema.parse({ ...validReservation, phone: '123' })
    ).toThrow();
  });

  test('rejects a malformed dressId', () => {
    expect(() =>
      reservationCreateSchema.parse({ ...validReservation, dressId: 'xyz' })
    ).toThrow();
  });

  test('allows a missing endDate (single-day rental)', () => {
    const { endDate: _omit, ...single } = validReservation;
    expect(() => reservationCreateSchema.parse(single)).not.toThrow();
  });
});

describe('adminLoginSchema', () => {
  test('accepts username + password', () => {
    expect(() =>
      adminLoginSchema.parse({ username: 'admin', password: 'x' })
    ).not.toThrow();
  });

  test('rejects empty credentials', () => {
    expect(() => adminLoginSchema.parse({ username: '', password: '' })).toThrow();
  });
});

describe('statusUpdateSchema', () => {
  test('accepts a known status', () => {
    expect(() => statusUpdateSchema.parse({ status: 'confirmed' })).not.toThrow();
  });

  test('rejects an unknown status', () => {
    expect(() => statusUpdateSchema.parse({ status: 'banana' })).toThrow();
  });
});

describe('idParamSchema', () => {
  test('rejects a malformed id', () => {
    expect(() => idParamSchema.parse({ id: 'nope' })).toThrow();
  });
});
