const request = require('supertest');
const app = require('../server');

// These exercise middleware that runs *before* any database access
// (validation, auth guards, 404/health), so no MongoDB connection is needed.
describe('API surface (no DB)', () => {
  test('GET /api/health → 200 ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('unknown route → 404 with message', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });

  test('POST /api/reservations with empty body → 400 + field errors', async () => {
    const res = await request(app).post('/api/reservations').send({});
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('POST /api/reservations with bad email → 400 referencing email', async () => {
    const res = await request(app).post('/api/reservations').send({
      dressId: '64b8f0c2f1a2b3c4d5e6f7a8',
      customerName: 'Amira',
      phone: '+216 22 345 678',
      email: 'nope',
      startDate: '2026-07-04',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'email')).toBe(true);
  });

  test('POST /api/admin/login with empty body → 400', async () => {
    const res = await request(app).post('/api/admin/login').send({});
    expect(res.status).toBe(400);
  });

  test('GET /api/admin/reservations without token → 401', async () => {
    const res = await request(app).get('/api/admin/reservations');
    expect(res.status).toBe(401);
  });
});
