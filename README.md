# RobeRent 👰

A full-stack prototype that helps wedding dress rental businesses in Tunisia
manage online pre-reservations and lets store managers see which dates are
available. It features a public dress gallery, real-time availability
calendars, a customer pre-reservation flow, and a protected admin dashboard.

## Tech stack

| Layer    | Tech                                            |
| -------- | ----------------------------------------------- |
| Frontend | React + Vite, Tailwind CSS, React Router        |
| State    | Zustand                                         |
| HTTP     | Axios                                           |
| Calendar | react-calendar                                  |
| Backend  | Node.js + Express                               |
| Database | MongoDB + Mongoose                              |
| Auth     | JWT (hardcoded admin credentials for the demo)  |

## Project structure

```
Robe-Rent/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── api/            # axios instance + service functions
│       ├── components/     # Navbar, DressCard, CalendarView, ReservationForm, AdminTable…
│       ├── pages/          # Home, Gallery, DressDetail, CalendarPage, AdminLogin, AdminDashboard
│       ├── store/          # Zustand auth store
│       └── utils/          # date helpers
└── server/                 # Express API
    ├── models/             # Dress.js, Reservation.js
    ├── routes/             # dresses.js, reservations.js, admin.js
    ├── middleware/         # auth.js (admin JWT protection)
    ├── utils/              # date helpers
    ├── seed.js             # sample data seeder
    └── server.js           # app entry
```

## Prerequisites

- Node.js 18+
- A running **MongoDB** instance (local `mongodb://127.0.0.1:27017` or a MongoDB
  Atlas connection string)

## Setup

1. **Install dependencies** (from the repo root):

   ```bash
   npm run install:all
   ```

   or individually: `npm install` inside both `server/` and `client/`.

2. **Configure the backend.** A `server/.env` file is already included for local
   development:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/robe-rent
   JWT_SECRET=change-this-secret-in-production
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   CLIENT_ORIGIN=http://localhost:5173
   ```

   Point `MONGODB_URI` at your Atlas cluster if you aren't running Mongo locally.

3. **Seed sample data** (8 dresses + a few reservations):

   ```bash
   npm run seed
   ```

4. **Run both apps** in two terminals:

   ```bash
   npm run server   # Express API on http://localhost:5000
   npm run client   # Vite dev server on http://localhost:5173
   ```

   The Vite dev server proxies `/api` to the backend, so no CORS juggling is
   needed in development (CORS is also configured server-side for safety).

## Admin access

Open <http://localhost:5173/admin/login> and sign in with the prototype
credentials:

- **Username:** `admin`
- **Password:** `admin123`

## API reference

| Method | Endpoint                               | Auth  | Description                              |
| ------ | -------------------------------------- | ----- | ---------------------------------------- |
| GET    | `/api/dresses`                         | —     | All dresses (supports category/price q)  |
| GET    | `/api/dresses/:id`                     | —     | Single dress                             |
| GET    | `/api/dresses/:id/reserved-dates`      | —     | Reserved days (YYYY-MM-DD[]) for a dress |
| POST   | `/api/reservations`                    | —     | Create a reservation (checks availability) |
| POST   | `/api/admin/login`                     | —     | Admin login → JWT                        |
| GET    | `/api/admin/reservations`              | admin | All reservations                         |
| PATCH  | `/api/admin/reservations/:id/status`   | admin | Update reservation status                |
| GET    | `/api/admin/calendar`                  | admin | Reservations grouped by day              |
| GET    | `/api/admin/stats`                     | admin | Dashboard statistics                     |

## How availability works

Reservation dates are normalised to **midnight UTC** so a booking is identified
by its calendar day, not a timestamp. A dress is considered unavailable on a day
if any **non-cancelled** reservation already exists for it that day.

Availability is enforced **twice**:

- **Frontend** (`ReservationForm` / `CalendarView`) — reserved days are painted
  red and disabled for instant UX, and the submit button is blocked.
- **Backend** (`POST /api/reservations`) — the source of truth re-checks for a
  clash and returns `409` with a clear message, preventing double bookings even
  if two customers race.
```

