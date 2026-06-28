# Robe-Rent Improvement Plan

This document lists the key improvements needed to make the Wedding Robe Rent project production-ready, maintainable, and scalable.

## 1. Backend Improvements

### 1.1 Input Validation and Security

- Add centralized request validation using a library such as `Joi` or `Zod`.
  - Validate customer reservation fields: `dressId`, `customerName`, `phone`, `email`, `startDate`, `endDate`, `size`, `notes`.
  - Validate admin login payload: `username` and `password`.
  - Validate status update payloads in `PATCH /api/admin/reservations/:id/status`.
- Add email format validation and reject invalid addresses.
- Add phone number validation using a library like `libphonenumber-js`.
- Harden route validation in all backend routes, not just reservation creation.
- Protect against NoSQL injection and malformed object IDs by using `mongoose.isValidObjectId` consistently.

### 1.2 Authentication and Authorization

- Remove hardcoded admin credentials from production usage.
- Support multi-admin user accounts stored in MongoDB with hashed passwords.
- Add password hashing using `bcrypt` or `argon2`.
- Add role-based access control for admin routes and future staff roles.
- Add token revocation support (blacklist or shorter JWT expiration plus refresh tokens).

### 1.3 Rate Limiting and Request Throttling

- Add request throttling with `express-rate-limit` or similar.
  - Apply stricter limits to public routes such as `/api/reservations` and `/api/admin/login`.
- Optionally add Redis-backed rate limiting for scaling.

### 1.4 Email Notifications

- Add email notification support for reservation events.
  - Reservation created (pending).
  - Reservation confirmed.
  - Reservation cancelled.
  - Rental returned or marked late.
- Use an SMTP provider or transactional email API (e.g. SendGrid, Mailgun, Postmark).
- Store email delivery status and optionally retry failed deliveries.

### 1.5 Logging and Error Monitoring

- Replace `console.error()` with a structured logger such as `winston` or `pino`.
- Log request context, errors, and stack traces to a file or external service.
- Add error monitoring integration (Sentry, LogRocket, etc.).
- Capture unhandled promise rejections and uncaught exceptions.

### 1.6 Data Model and Storage

- Avoid storing large images directly in MongoDB documents long-term.
  - Use cloud object storage or file CDN for images (e.g. AWS S3, Cloudinary, Firebase Storage).
  - Store image URLs and metadata in MongoDB.
- Add explicit reserve date history/audit fields to `Reservation` for status changes.
- Review and normalize `Reservation` schema fields if needed.

### 1.7 Business Logic

- Add server-side validation for minimum and maximum rental lengths.
- Add deposit payment workflow if deposit is part of the business.
  - Track deposit status separately from reservation status.
- Add cancellation rules and refund policies.
- Add support for partial availability or block-out dates per dress.

### 1.8 Error Handling

- Normalize error responses.
  - Use consistent JSON response shape for success and failure.
  - Include `errorCode` or `field` when input validation fails.
- Add a dedicated `error` utility module and typed error classes.

### 1.9 Tests and Quality

- Add backend tests using Jest or Mocha + Supertest.
  - Route tests for `/api/reservations`, `/api/admin/*`, `/api/dresses`, image upload.
  - Model tests for validation and reservation conflict logic.
  - Integration tests for reservation lifecycle and availability.
- Add linting and formatting rules.
  - Use ESLint and Prettier across `server/` and `client/`.

## 2. Frontend Improvements

### 2.1 Input Validation and UX

- Add form validation for reservation inputs.
  - Required fields: name, phone, email, start date.
  - Validate email format.
  - Validate phone number format.
  - Validate rental end date is not before start date.
- Add friendly real-time UI error messages.
- Confirm user input before sending reservation requests.

### 2.2 Authentication and Route Protection

- Protect admin pages using token checks in React routes.
- Redirect unauthorized users to login.
- Store JWT securely and avoid sensitive exposure.
- Add logout support and token expiration handling.

### 2.3 Accessibility and Internationalization

- Improve accessibility by ensuring labels, buttons, and forms are screen-reader friendly.
- Add keyboard navigation support to core UI components.
- Consider localization for Arabic/French/Tunisian audiences.
- Add `aria-*` attributes and color contrast validation.

### 2.4 Performance

- Optimize image loading with lazy loading and responsive sizes.
- Use caching for API calls where appropriate.
- Add skeleton loaders or improved spinners during data fetches.

### 2.5 UI Improvements

- Add clearer reservation confirmation and next steps for customers.
- Improve admin dashboard visual clarity for statuses and date ranges.
- Add filtering/sorting for dresses and reservations.
- Add search by customer name, phone, or dress.

### 2.6 Tests

- Add frontend tests using React Testing Library + Vitest or Jest.
  - Component tests for form validation and admin flows.
  - Route tests for protected admin routes.
- Add E2E tests with Cypress or Playwright for critical flows.

## 3. Architecture and Deployment

### 3.1 Environment and Configuration

- Add `.env.example` with required variables:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
  - `CLIENT_ORIGIN`
  - `BOOKING_BUFFER_DAYS`
  - email provider config variables
- Separate development and production configuration.
- Do not commit secrets to source control.

### 3.2 Docker and Deployment

- Create a `Dockerfile` for the backend and optionally one for the frontend.
- Create a `docker-compose.yml` for local development with MongoDB.
- Add deployment notes for a hosting provider (Render, Heroku, Railway, Vercel, Netlify).
- Add startup scripts and health checks.

### 3.3 CI/CD

- Add GitHub Actions or equivalent pipeline.
  - Run linting, tests, and build for client and server.
  - Optionally run static code analysis.

### 3.4 Database Maintenance

- Add database backup strategy and restore instructions.
- Document index usage for performance on queries used by calendar, stats, and reservations.

## 4. Documentation

### 4.1 Project Docs

- Improve `README.md` with:
  - local setup and install steps
  - environment variables
  - running server and client
  - database seeding
  - API route summary
  - deployment notes
- Add `CONTRIBUTING.md` if you plan to collaborate.
- Add `CHANGELOG.md` for tracking major improvements.

### 4.2 API Docs

- Document the API contract for key endpoints.
  - `POST /api/reservations`
  - `POST /api/admin/login`
  - `PATCH /api/admin/reservations/:id/status`
  - `GET /api/admin/calendar`
  - `GET /api/admin/stats`
- Include request/response examples.

## 5. Priority Roadmap

### High Priority (must do first)

1. Add proper validation for reservations and admin routes.
2. Add admin auth with hashed passwords and multi-user support.
3. Add rate limiting and security hardening.
4. Add email confirmation / reservation notifications.
5. Add backend tests and linting.

### Medium Priority

1. Add structured logging and monitoring.
2. Move image storage to an external CDN/cloud storage.
3. Add access control and richer reservation state rules.
4. Improve frontend form UX and protected admin routing.
5. Add Docker/devops support.

### Low Priority

1. Add internationalization and accessibility polish.
2. Add E2E tests.
3. Add advanced analytics / reporting features.
4. Add cancellation/refund workflow.

## 6. Suggested Dependency Additions

### Backend

- `joi` or `zod`
- `express-rate-limit`
- `helmet`
- `bcrypt` or `argon2`
- `winston` or `pino`
- `nodemailer` or a transactional email client
- `morgan` for request logging (dev)
- `jest` + `supertest` for tests

### Frontend

- `yup` or `zod` for client-side validation
- `react-hook-form` (optional) for better form handling
- `vitest` + `@testing-library/react`
- `cypress` or `playwright` for E2E

## 7. Notes Specific to This Codebase

- The backend currently uses `console.error()` and no logging library.
- Admin login credentials are validated via env vars but there is no user persistence.
- Images are handled through `multer` and stored as MongoDB references; this should transition to an object storage pattern.
- Reservation availability logic is correct but lacks validation around `endDate` missing or date semantics beyond the buffer.
- The frontend already uses React + Vite + Tailwind, which is a solid base for polish.

---

This plan is designed to turn the current prototype into a stable, secure, and production-ready rental application.
