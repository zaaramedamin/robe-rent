# RobeRent 👰

A full-stack app that helps wedding dress rental businesses in Tunisia manage
online pre-reservations and lets store managers see which dates are available.
It features a public dress gallery, real-time availability calendars, a customer
pre-reservation flow with client- and server-side validation, and a protected
admin dashboard.

## Tech stack

| Layer      | Tech                                                        |
| ---------- | ----------------------------------------------------------- |
| Frontend   | React + Vite, Tailwind CSS, React Router, Zustand, Axios    |
| Backend    | Node.js + Express                                           |
| Database   | MongoDB + Mongoose                                          |
| Validation | Zod + libphonenumber-js (server), inline validators (client)|
| Auth       | JWT + bcrypt-hashed admin accounts in MongoDB               |
| Security   | helmet, express-rate-limit                                  |
| Logging    | winston + morgan                                            |
| Tests      | Jest + Supertest                                            |
| Tooling    | ESLint (flat config) + Prettier, Docker                     |

## Features

- Public gallery with search, category, price, and date-availability filters.
- Per-dress availability calendar with a configurable cleaning buffer between
  rentals and boutique block-out dates.
- Customer pre-reservation flow with real-time field validation and a
  review-and-confirm step.
- Protected admin dashboard: reservations, status lifecycle with an audit
  trail, calendar, statistics/history, client history, and dress management
  (with image upload).

## Project structure

```
Robe-Rent/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── api/            # axios instance + service functions
│       ├── components/     # Navbar, DressCard, ReservationForm, AdminTable, …
│       ├── pages/          # Home, Gallery, DressDetail, Admin* …
│       ├── store/          # Zustand auth store
│       └── utils/          # date, image, validation, auth (JWT) helpers
├── server/                 # Express API
│   ├── models/             # Dress.js, Reservation.js, Admin.js, Image.js
│   ├── routes/             # dresses, reservations, admin, adminDresses, images
│   ├── middleware/         # auth.js (JWT), validate.js (Zod)
│   ├── validators/         # Zod schemas
│   ├── utils/              # date, logger, errors
│   ├── tests/              # Jest + Supertest suites
│   ├── seed.js             # sample reservations seeder
│   ├── seed-admin.js       # admin account bootstrap
│   ├── Dockerfile
│   └── server.js           # app entry
├── docker-compose.yml      # MongoDB + API for local dev
├── eslint.config.js        # flat ESLint config (server + client)
└── docs/API.md             # full API contract with examples
```

## Prerequisites

- Node.js 18+
- A running **MongoDB** instance (local or MongoDB Atlas), _or_ Docker.

## Quick start (local)

1. **Install dependencies** (from the repo root):

   ```bash
   npm run install:all
   ```

2. **Configure the backend.** Copy the example env and adjust as needed:

   ```bash
   cp server/.env.example server/.env
   ```

3. **Create the first admin account** (reads `ADMIN_USERNAME` / `ADMIN_PASSWORD`
   from `server/.env`):

   ```bash
   npm run seed:admin --prefix server
   ```

   You can also create a specific admin: `node server/seed-admin.js <user> <pass> [admin|staff]`.

4. _(Optional)_ **Seed sample reservations** (requires dresses to exist; add
   them from the admin dashboard first):

   ```bash
   npm run seed
   ```

5. **Run both apps** in two terminals:

   ```bash
   npm run server   # Express API on http://localhost:5000
   npm run client   # Vite dev server on http://localhost:5173
   ```

   The Vite dev server proxies `/api` to the backend, so no CORS juggling is
   needed in development.

## Quick start (Docker)

```bash
docker compose up --build          # starts MongoDB + the API
docker compose exec server npm run seed:admin
```

The API is then available on `http://localhost:5000` (health: `/api/health`).
Run the client separately with `npm run client`.

## Managing admin accounts

Admin accounts live in MongoDB with bcrypt-hashed passwords. Use the
`seed-admin` script, run from the `server/` directory so it loads `server/.env`:

```bash
cd server

# Create or update an admin (role defaults to "admin"):
node seed-admin.js <username> <password> [admin|staff]

# Examples
node seed-admin.js sara s3cret          # new admin "sara"
node seed-admin.js admin newpassword    # change the existing "admin" password
node seed-admin.js karim pass123 staff  # new staff account

# Or bootstrap from ADMIN_USERNAME / ADMIN_PASSWORD in .env:
npm run seed:admin
```

If the username already exists, its password and role are updated; otherwise a
new account is created. Usernames are case-insensitive. To rename an admin,
create the new account and remove the old one (no delete script yet).

## Environment variables

| Variable                | Default                  | Description                                  |
| ----------------------- | ------------------------ | -------------------------------------------- |
| `PORT`                  | `5000`                   | API port                                     |
| `NODE_ENV`              | —                        | `development` / `production` / `test`        |
| `MONGODB_URI`           | —                        | MongoDB connection string (required)         |
| `JWT_SECRET`            | —                        | Secret for signing admin JWTs (required)     |
| `JWT_EXPIRES_IN`        | `8h`                     | Admin token lifetime                         |
| `ADMIN_USERNAME`        | —                        | Bootstrap admin username (`seed:admin`)      |
| `ADMIN_PASSWORD`        | —                        | Bootstrap admin password (`seed:admin`)      |
| `CLIENT_ORIGIN`         | `http://localhost:5173`  | Allowed CORS origin                          |
| `BOOKING_BUFFER_DAYS`   | `1`                      | Cleaning buffer enforced between rentals     |
| `MIN_RENTAL_DAYS`       | `1`                      | Minimum rental length                        |
| `MAX_RENTAL_DAYS`       | `30`                     | Maximum rental length                        |
| `DEFAULT_PHONE_COUNTRY` | `TN`                     | Default country for phone validation         |
| `LOG_LEVEL`             | `debug` (dev)            | winston log level                            |

Secrets are **not** committed — `server/.env` is gitignored; only
`server/.env.example` is tracked.

## Scripts

**Root**

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run install:all` | Install server + client deps             |
| `npm run server`      | Start the API in watch mode              |
| `npm run client`      | Start the Vite dev server                |
| `npm test`            | Run the backend test suite               |
| `npm run lint`        | Lint server + client                     |
| `npm run format`      | Format the codebase with Prettier        |

**Server** (`--prefix server`)

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm start`          | Start the API                        |
| `npm run dev`        | Start the API in watch mode          |
| `npm run seed`       | Seed sample reservations             |
| `npm run seed:admin` | Create/update an admin account       |
| `npm test`           | Run Jest                             |

## Testing & linting

```bash
npm test          # 25 Jest tests (validators, date utils, errors, API)
npm run lint      # ESLint (server + client)
npm run format    # Prettier
```

## Deployment (Render + Vercel)

Three pieces: **MongoDB Atlas** (database), the **API on Render**, and the
**client on Vercel**. Vercel proxies `/api/*` to Render (see
[`client/vercel.json`](client/vercel.json)) so API calls **and** DB-stored
images stay same-origin — no CORS juggling, and `<img src="/api/images/…">`
keeps working.

### 1. Database — MongoDB Atlas (free)

1. Create a free M0 cluster at <https://www.mongodb.com/atlas>.
2. Add a database user (username + password).
3. Network Access → allow `0.0.0.0/0` (or Render's egress IPs).
4. Copy the connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/robe-rent`.

### 2. API — Render

Using the included [`render.yaml`](render.yaml): Render → **New → Blueprint** →
select this repo, then fill the `sync: false` variables in the dashboard:

| Variable         | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| `MONGODB_URI`    | your Atlas connection string                           |
| `CLIENT_ORIGIN`  | your Vercel URL (e.g. `https://robe-rent.vercel.app`)  |
| `ADMIN_USERNAME` | initial admin username                                 |
| `ADMIN_PASSWORD` | initial admin password                                 |

`JWT_SECRET` is auto-generated; `NODE_ENV=production` and `PORT` are handled for
you (`server.js` reads `process.env.PORT`). Manual alternative: a Web Service
with Root Directory `server`, build `npm install`, start `node server.js`,
health check path `/api/health`.

> Free Render services sleep after inactivity, so the first request after idle
> can take ~30–50s (cold start).

### 3. Preseed the admin account

Login reads admins from MongoDB, so create one against the **Atlas** database
(from your machine, pointing at the Atlas URI):

```bash
# macOS/Linux
cd server
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/robe-rent" node seed-admin.js admin "YourStrongPassword"
```

```powershell
# Windows PowerShell
cd server
$env:MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/robe-rent"; node seed-admin.js admin "YourStrongPassword"
```

(Or use Render's **Shell** tab and run `npm run seed:admin`.) Dresses are added
afterwards from the admin dashboard — there is no dress seeder.

### 4. Client — Vercel

1. In [`client/vercel.json`](client/vercel.json), replace
   `YOUR-RENDER-SERVICE.onrender.com` with your actual Render URL.
2. Vercel → **New Project** → import this repo.
3. Set **Root Directory** to `client` (framework auto-detects as Vite; build
   `npm run build`, output `dist`).
4. Deploy.

### 5. Wire them together

- Set Render's `CLIENT_ORIGIN` to the final Vercel URL and redeploy.
- Open the Vercel URL → the gallery loads, `/admin/login` works with the seeded
  admin, and reservations/images work through the `/api` proxy.

## API reference

| Method | Endpoint                             | Auth  | Description                                |
| ------ | ------------------------------------ | ----- | ------------------------------------------ |
| GET    | `/api/health`                        | —     | Liveness check                             |
| GET    | `/api/dresses`                       | —     | All dresses (filters: category/min/maxPrice)|
| GET    | `/api/dresses/:id`                   | —     | Single dress                               |
| GET    | `/api/dresses/:id/reserved-dates`    | —     | Unavailable days (incl. buffer + block-outs)|
| POST   | `/api/reservations`                  | —     | Create a reservation (validated + checked) |
| GET    | `/api/images/:id`                    | —     | Stream a stored image                      |
| POST   | `/api/admin/login`                   | —     | Admin login → JWT                          |
| GET    | `/api/admin/reservations`            | admin | All reservations                           |
| PATCH  | `/api/admin/reservations/:id/status` | admin | Update status (records audit history)      |
| GET    | `/api/admin/calendar`                | admin | Reservations grouped by day                |
| GET    | `/api/admin/stats`                   | admin | Dashboard statistics                       |
| GET    | `/api/admin/stats/history`           | admin | Monthly history                            |
| GET    | `/api/admin/clients`                 | admin | Client history (grouped by email)          |
| POST   | `/api/admin/dresses`                 | admin | Create a dress (multipart)                 |
| PUT    | `/api/admin/dresses/:id`             | admin | Update a dress (multipart)                 |
| DELETE | `/api/admin/dresses/:id`             | admin | Delete a dress + its reservations          |

See [docs/API.md](docs/API.md) for request/response examples and error shapes.

## How availability works

Reservation dates are normalised to **midnight UTC**, so a booking is identified
by its calendar day, not a timestamp. A dress is unavailable on a day if:

- an active (non-cancelled/returned) reservation covers it, **plus** a
  configurable `BOOKING_BUFFER_DAYS` cleaning buffer on either side, or
- the day is in the dress's `blockoutDates`.

Availability is enforced **twice** — in the UI for instant feedback, and again
on `POST /api/reservations` (the source of truth) which returns `409` on a
clash to prevent double bookings even under a race.

## Security notes

- Admin accounts live in MongoDB with bcrypt-hashed passwords; there are no
  hardcoded credentials in the running app.
- `helmet` sets secure headers; `express-rate-limit` throttles the public
  reservation and login endpoints.
- All request bodies/params are validated with Zod before any DB access.

## License

ISC
