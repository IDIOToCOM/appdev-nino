# Mobile booking API (Symfony + SAMSON)

**Status:** Implemented on the Symfony backend. SAMSON uses these routes with JWT (`Authorization: Bearer <token>`).

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/mobile/v1/bookings` | JWT + ROLE_USER | Current user's bookings |
| POST | `/api/mobile/v1/bookings` | JWT + ROLE_USER | Create booking |
| POST | `/api/mobile/v1/bookings/check-conflict` | JWT + ROLE_USER | Date overlap check |

Public (no JWT): `/api/mobile/v1/health`, `/api/mobile/v1/cars`, `/api/mobile/v1/cars/{id}`

Cars include `imageUrl` (e.g. `/images/cars/1.jpg`).

## Create booking — request body

```json
{
  "carId": 1,
  "name": "Customer Name",
  "phone": "09171234567",
  "pickupLocation": "Manila Airport",
  "dropoffLocation": "Manila Airport",
  "pickupDate": "2026-06-01",
  "returnDate": "2026-06-05",
  "pickupTime": "9:00 AM",
  "returnTime": "5:00 PM"
}
```

- Dates: `YYYY-MM-DD`, in the future
- Times: 30-minute slots like the website (`9:00 AM`, `9:30 AM`, `5:00 PM`)

## Success response

Envelope `data`:

```json
{
  "booking": {
    "id": 42,
    "status": "Pending",
    "name": "Customer Name",
    "phone": "09171234567",
    "pickupDate": "2026-06-01",
    "returnDate": "2026-06-05",
    "pickupTime": "09:00:00",
    "returnTime": "17:00:00",
    "pickupLocation": "...",
    "dropoffLocation": "...",
    "car": { "id": 1, "brand": "Toyota", "model": "Corolla" }
  }
}
```

## Error envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please fix the highlighted fields.",
    "details": { "fields": ["Phone must be at least 10 digits."] }
  }
}
```

SAMSON shows `error.message` and lists `details.fields` when present (see Metro log in `__DEV__` for `code` + status).

Common codes: `VALIDATION_ERROR`, `BOOKING_CONFLICT`, `CAR_NOT_FOUND`, `CAR_UNAVAILABLE`

## Verify sync with web admin

1. `symfony serve` running
2. Log in on the app (customer `ROLE_USER`)
3. Submit a booking from **Book now**
4. Open **Admin → Bookings** on the website — new row should be **Pending** (same MySQL DB)

## SAMSON code

| File | Role |
|------|------|
| `src/app/api/bookings.ts` | create, list, check-conflict |
| `src/app/sagas/bookings.ts` | conflict check → create → refresh list |
| `src/screens/BookScreen.tsx` | booking form |
