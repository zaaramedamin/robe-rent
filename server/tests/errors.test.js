const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} = require('../utils/errors');

describe('typed errors', () => {
  test('AppError is an Error and carries a status', () => {
    const e = new AppError('boom', 500);
    expect(e).toBeInstanceOf(Error);
    expect(e.status).toBe(500);
  });

  test('BadRequestError defaults to 400 and carries field details', () => {
    const e = new BadRequestError('bad', [{ field: 'x', message: 'nope' }]);
    expect(e.status).toBe(400);
    expect(e.errors).toEqual([{ field: 'x', message: 'nope' }]);
  });

  test('other subclasses map to the right status codes', () => {
    expect(new UnauthorizedError().status).toBe(401);
    expect(new NotFoundError().status).toBe(404);
    expect(new ConflictError().status).toBe(409);
  });
});
