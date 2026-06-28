# Robe-Rent TODO

Actionable checklist derived from [IMPROVEMENTS.md](IMPROVEMENTS.md). Items are grouped by priority — work top-down. Check off as you go.

---

## 🔴 High Priority (do first)

### Validation (backend)
- [ ] Add a validation library (`zod` or `joi`) and a centralized request-validation layer
- [ ] Validate reservation fields: `dressId`, `customerName`, `phone`, `email`, `startDate`, `endDate`, `size`, `notes`
- [ ] Validate admin login payload: `username`, `password`
- [ ] Validate status-update payload on `PATCH /api/admin/reservations/:id/status`
- [ ] Add email format validation
- [ ] Add phone validation (`libphonenumber-js`)
- [ ] Validate object IDs everywhere with `mongoose.isValidObjectId` (guard against NoSQL injection)

### Admin auth
- [ ] Move admin users into MongoDB (remove reliance on hardcoded env credentials)
- [ ] Hash passwords with `bcrypt` or `argon2`
- [ ] Support multiple admin accounts
- [ ] Add token handling: shorter JWT expiry + refresh tokens (or a revocation/blacklist)

### Security hardening / rate limiting
- [ ] Add `helmet`
- [ ] Add `express-rate-limit` with stricter limits on `/api/reservations` and `/api/admin/login`

### Email notifications
- [ ] Wire up a mailer (`nodemailer` / SendGrid / Mailgun / Postmark)
- [ ] Send emails on: reservation created (pending), confirmed, cancelled, returned/late
- [ ] Track delivery status and retry failures

### Backend tests + linting
- [ ] Set up `jest` + `supertest`
- [ ] Route tests: `/api/reservations`, `/api/admin/*`, `/api/dresses`, image upload
- [ ] Model tests: validation + reservation conflict logic
- [ ] Integration tests: reservation lifecycle and availability
- [ ] Add ESLint + Prettier across `server/` and `client/`

---

## 🟡 Medium Priority

### Logging & monitoring
- [ ] Replace `console.error()` with `winston` or `pino`
- [ ] Add `morgan` for dev request logging
- [ ] Log request context, errors, and stack traces
- [ ] Add error monitoring (Sentry / LogRocket)
- [ ] Capture unhandled rejections + uncaught exceptions

### Image storage migration
- [ ] Move images off MongoDB documents to object storage / CDN (S3, Cloudinary, Firebase)
- [ ] Store image URLs + metadata in MongoDB

### Reservation state & business rules
- [ ] Add role-based access control (admin + future staff roles)
- [ ] Server-side min/max rental length validation
- [ ] Add status-change history/audit fields to `Reservation`
- [ ] Review/normalize `Reservation` schema
- [ ] Add per-dress block-out dates / partial availability
- [ ] Validate `endDate` presence and date semantics beyond the buffer

### Error handling
- [ ] Normalize success/failure JSON response shape
- [ ] Include `errorCode` / `field` on validation errors
- [ ] Add an error utility module + typed error classes

### Frontend form UX & route protection
- [ ] Form validation: required name/phone/email/start date
- [ ] Validate email + phone format on client
- [ ] Validate end date is not before start date
- [ ] Real-time inline error messages + confirm before submit
- [ ] Protect admin routes with token checks; redirect unauthorized to login
- [ ] Store JWT securely; add logout + token-expiration handling
- [ ] (Optional) adopt `react-hook-form` + `yup`/`zod`

### Docker / DevOps
- [ ] Backend `Dockerfile` (optionally frontend too)
- [ ] `docker-compose.yml` with MongoDB for local dev
- [ ] Startup scripts + health checks
- [ ] Deployment notes for chosen host (Render / Railway / Vercel / Netlify)

---

## 🟢 Low Priority

### Accessibility & i18n
- [ ] Screen-reader-friendly labels/buttons/forms + `aria-*` attributes
- [ ] Keyboard navigation for core components
- [ ] Color contrast validation
- [ ] Localization for Arabic / French / Tunisian audiences

### Performance & UI polish
- [ ] Lazy-load images + responsive sizes
- [ ] Cache API calls where appropriate
- [ ] Skeleton loaders / improved spinners
- [ ] Clearer reservation confirmation + next steps for customers
- [ ] Admin dashboard clarity for statuses and date ranges
- [ ] Filtering/sorting for dresses and reservations
- [ ] Search by customer name, phone, or dress

### More tests
- [ ] Frontend component tests (React Testing Library + Vitest)
- [ ] Protected-route tests
- [ ] E2E tests (Cypress / Playwright) for critical flows

### Advanced features
- [ ] Deposit payment workflow (track deposit status separately)
- [ ] Cancellation rules + refund policies
- [ ] Advanced analytics / reporting

---

## 📄 Documentation & Infra (cross-cutting)

- [ ] Add `.env.example`: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `CLIENT_ORIGIN`, `BOOKING_BUFFER_DAYS`, email provider vars
- [ ] Separate dev/prod config; keep secrets out of source control
- [ ] Expand `README.md`: setup, env vars, running server/client, seeding, API summary, deploy notes
- [ ] Add `CONTRIBUTING.md` and `CHANGELOG.md`
- [ ] Document API contracts (request/response examples) for:
  - [ ] `POST /api/reservations`
  - [ ] `POST /api/admin/login`
  - [ ] `PATCH /api/admin/reservations/:id/status`
  - [ ] `GET /api/admin/calendar`
  - [ ] `GET /api/admin/stats`
- [ ] Add CI/CD (GitHub Actions): lint, test, build client + server
- [ ] DB backup/restore strategy + document index usage for calendar/stats/reservation queries
