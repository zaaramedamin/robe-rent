# RobeRent API

Base URL (dev): `http://localhost:5000/api` (the Vite client proxies `/api`).

All responses are JSON. Admin endpoints require an `Authorization: Bearer <token>`
header obtained from `POST /api/admin/login`.

## Conventions

### Error shape

Errors use a consistent shape:

```json
{ "message": "Human-readable summary." }
```

Validation failures (HTTP `400`) additionally include field-level details:

```json
{
  "message": "Validation failed.",
  "errors": [
    { "field": "email", "message": "Please enter a valid email address." },
    { "field": "phone", "message": "Please enter a valid phone number." }
  ]
}
```

### Status codes

| Code | Meaning                                              |
| ---- | ---------------------------------------------------- |
| 200  | OK                                                   |
| 201  | Created                                              |
| 400  | Validation / bad input (`errors[]` when applicable)  |
| 401  | Missing/invalid/expired admin token                  |
| 404  | Resource not found                                   |
| 409  | Conflict (dates unavailable, dress not rentable)     |
| 429  | Rate limited                                         |
| 500  | Server error                                         |

### Rate limits

- Global: 600 requests / 15 min per IP.
- `POST /api/admin/login`: 10 / 15 min.
- `POST /api/reservations`: 20 / hour.

---

## Public endpoints

### `GET /api/health`

```json
{ "status": "ok" }
```

### `GET /api/dresses`

Query params (all optional): `category`, `minPrice`, `maxPrice`.

```
GET /api/dresses?category=classic&maxPrice=300
```

```json
[
  {
    "_id": "64b8f0c2f1a2b3c4d5e6f7a8",
    "name": "Ivory Mermaid",
    "description": "…",
    "category": "classic",
    "pricePerDay": 250,
    "deposit": 200,
    "sizes": ["S", "M", "L"],
    "images": ["/api/images/64b8…"],
    "available": true,
    "blockoutDates": ["2026-08-01"]
  }
]
```

### `GET /api/dresses/:id`

Returns a single dress, or `404` if not found / `400` for a malformed id.

### `GET /api/dresses/:id/reserved-dates`

Array of `YYYY-MM-DD` strings the dress cannot be booked on (active
reservations expanded by the cleaning buffer, plus block-out dates).

```json
["2026-07-03", "2026-07-04", "2026-07-05"]
```

### `POST /api/reservations`

Create a customer pre-reservation.

**Request**

```json
{
  "dressId": "64b8f0c2f1a2b3c4d5e6f7a8",
  "customerName": "Amira Ben Salah",
  "phone": "+216 22 345 678",
  "email": "amira@example.com",
  "startDate": "2026-07-04",
  "endDate": "2026-07-06",
  "size": "M",
  "notes": "Henna night."
}
```

- `endDate` is optional (single-day rental when omitted).
- `email`/`phone` are validated; `dressId` must be a valid ObjectId.
- Rental length must be within `MIN_RENTAL_DAYS`..`MAX_RENTAL_DAYS`.

**201 Created**

```json
{
  "message": "Your reservation request has been received!",
  "reservation": {
    "_id": "…",
    "status": "pending",
    "rentalDays": 3,
    "totalPrice": 750,
    "deposit": 200,
    "statusHistory": [{ "status": "pending", "by": "", "at": "…" }]
  }
}
```

**Failure examples** — `400` (validation), `404` (dress not found),
`409` (dates unavailable, block-out hit, or dress not rentable).

### `GET /api/images/:id`

Streams the stored image with its content type. `404` if missing.

---

## Admin endpoints

### `POST /api/admin/login`

**Request**

```json
{ "username": "admin", "password": "secret" }
```

**200 OK**

```json
{
  "token": "eyJhbGciOi…",
  "admin": { "username": "admin", "role": "admin" }
}
```

`401` for invalid credentials. The token carries `sub`, `role`, and `username`
and expires after `JWT_EXPIRES_IN` (default 8h).

### `GET /api/admin/reservations`

All reservations (dress populated), newest first. Requires admin auth.

### `PATCH /api/admin/reservations/:id/status`

**Request**

```json
{ "status": "confirmed" }
```

`status` ∈ `pending | confirmed | out | returned | late | cancelled`. The change
is appended to the reservation's `statusHistory` with the acting admin's
username. Returns the updated reservation.

### `GET /api/admin/calendar`

Non-cancelled reservations grouped by day:

```json
{ "2026-07-04": [{ "_id": "…", "customerName": "…" }] }
```

### `GET /api/admin/stats`

Revenue (realized vs. pending), counts by status and category, totals, deposits
held, and the most-reserved dresses.

### `GET /api/admin/stats/history`

Monthly history rows (reservations + revenue), chronologically sorted.

### `GET /api/admin/clients`

Reservations grouped by customer email, with totals, realized spend, and
first/last booking dates.

### `POST /api/admin/dresses` · `PUT /api/admin/dresses/:id`

`multipart/form-data`. Text fields: `name`, `description`, `category`,
`pricePerDay`, `deposit`, `available`, `sizes` (JSON array or comma list),
`blockoutDates` (JSON array or comma list of `YYYY-MM-DD`). Files: `images`
(up to 6, ≤5 MB each, images only). `PUT` also accepts `existingImages` (JSON
array of image URLs to keep). Returns the saved dress.

### `DELETE /api/admin/dresses/:id`

Deletes the dress, its stored images, and any reservations for it.
