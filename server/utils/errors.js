/**
 * Lightweight typed HTTP errors. Throw these from routes/services and the
 * central error handler translates them into a consistent JSON response:
 *
 *   { message, errors? }
 *
 * `errors` (optional) is an array of { field, message } for field-level
 * validation feedback.
 */
class AppError extends Error {
  constructor(message, status = 500, details) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    if (details) this.errors = details;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request.', details) {
    super(message, 400, details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized.') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden.') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found.') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict.') {
    super(message, 409);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
