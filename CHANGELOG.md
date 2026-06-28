# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Validation** — centralized Zod validation middleware and schemas for
  reservation creation, admin login, and status updates, including email format,
  phone (libphonenumber-js), and ObjectId checks.
- **Admin auth** — database-backed admin accounts (`Admin` model) with
  bcrypt-hashed passwords, multi-admin support, and a `seed:admin` bootstrap
  script. JWTs now carry the admin id and role.
- **Security** — `helmet` secure headers and `express-rate-limit` (global plus
  stricter limits on the login and reservation endpoints).
- **Logging** — structured `winston` logger, `morgan` request logging, and
  process-level `unhandledRejection` / `uncaughtException` handlers.
- **Errors** — typed error classes and a consistent error response shape
  (`{ message, errors? }`).
- **Business rules** — server-side min/max rental length, per-dress block-out
  dates, and an append-only status-change audit trail on reservations.
- **Frontend** — client-side form validation with real-time inline errors and a
  review-and-confirm step; JWT-expiry handling with auto-logout on 401; skeleton
  loaders; accessibility (ARIA) improvements.
- **Tooling** — Jest + Supertest test suite (25 tests), ESLint (flat config) +
  Prettier, a backend `Dockerfile`, and a `docker-compose.yml` (MongoDB + API).
- **Docs** — expanded `README`, full API reference (`docs/API.md`),
  `CONTRIBUTING.md`, this changelog, and a complete `server/.env.example`.

### Changed

- Admin login authenticates against MongoDB instead of hardcoded env credentials.
- The reservations and admin routes now validate input via middleware before any
  database access.

### Fixed

- `client/src/api/services.js` reservation call (`api.post` typo) that prevented
  reservation submission.

### Security

- Removed reliance on plaintext, hardcoded admin credentials in the running app.
