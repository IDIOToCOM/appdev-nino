# SAMSON — Uto Mobility API integration

SAMSON is a **customer-only** React Native app. All fleet, user, and booking data lives in the **Symfony + MySQL** backend. This app does not use SQLite or local storage as source of truth for cars or bookings.

## Base URL

| Environment | Base URL |
|-------------|----------|
| **Forge (production)** | `https://uto.on-forge.com` — set in `src/config/api.ts` (`USE_FORGE_IN_DEV = true`) |
| Android emulator (local Symfony) | `http://10.0.2.2:8000` |
| Physical device on same LAN | `http://<YOUR_PC_LAN_IP>:8000` (update `src/config/api.ts`) |

Start the backend before testing:

```bash
symfony serve
# listens on http://127.0.0.1:8000
```

### Physical device networking

1. Set `API_BASE_URL` in `src/config/api.ts` to your PC’s LAN IP (e.g. `http://192.168.1.10:8000`).
2. Optional USB debugging: `adb reverse tcp:8000 tcp:8000` then keep `http://127.0.0.1:8000` or `http://10.0.2.2:8000` depending on setup.
3. Ensure Windows firewall allows inbound port 8000 on your LAN.

## Authentication (JWT)

Login does **not** use the mobile envelope. Store only the JWT in Redux Persist (`auth.data.token`).

### `POST /api/login`

**Request**

```json
{
  "username": "customer1",
  "password": "your_password"
}
```

**Response (200)**

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Headers for protected routes (when backend adds them)**

```
Authorization: Bearer <token>
```

### `POST /api/register`

**Request**

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "secret"
}
```

Response shape may vary; the app handles plain JSON errors and mobile envelope errors.

## Mobile API envelope

Prefix: `/api/mobile/v1`

**Success**

```json
{
  "success": true,
  "data": { },
  "error": null,
  "meta": { "apiVersion": "1.0", "timestamp": "2026-05-21T12:00:00+00:00", "count": 1 }
}
```

**Error**

```json
{
  "success": false,
  "data": null,
  "error": { "code": "NOT_FOUND", "message": "Human-readable message", "details": null },
  "meta": { "apiVersion": "1.0", "timestamp": "..." }
}
```

Client: `src/app/api/client.ts` → `apiFetch()` throws `Error` with `error.message`.

## Endpoints used by SAMSON

| Method | Path | Auth | Feature |
|--------|------|------|---------|
| GET | `/api/mobile/v1/health` | No | Home — backend connection |
| POST | `/api/login` | No | Login |
| POST | `/api/register` | No | Register |
| GET | `/api/mobile/v1/cars` | No | Vehicle list (`imageUrl` per car) |
| GET | `/api/mobile/v1/cars/{id}` | No | Vehicle detail |
| GET | `/api/mobile/v1/cars/{id}/reviews` | Optional JWT | Review summary + list; submit eligibility when logged in |
| POST | `/api/mobile/v1/cars/{id}/reviews` | JWT | Submit or update review `{ rating, comment? }` |
| GET | `/api/mobile/v1/bookings` | JWT | My bookings |
| POST | `/api/mobile/v1/bookings` | JWT | Create booking |
| POST | `/api/mobile/v1/bookings/check-conflict` | JWT | Overlap check before submit |
| POST | `/api/mobile/v1/bookings/{id}/pay` | JWT | Record demo payment (body optional `{ "amount": 1234 }`, defaults to amount due) |
| POST | `/api/mobile/v1/bookings/{id}/cancel` | JWT | Cancel booking (same rules as website My bookings) |
| GET | `/api/mobile/v1/notifications` | JWT | List notifications + `unreadCount` |
| POST | `/api/mobile/v1/notifications/{id}/read` | JWT | Mark one read |
| POST | `/api/mobile/v1/notifications/read-all` | JWT | Mark all read |

### Health — `GET /api/mobile/v1/health`

**Response `data` (example)**

```json
{
  "status": "ok",
  "message": "Uto Mobility mobile API"
}
```

### Cars list — `GET /api/mobile/v1/cars`

**Response `data` (example)**

```json
{
  "cars": [
    {
      "id": 1,
      "brand": "Toyota",
      "model": "Corolla",
      "type": "sedan",
      "pricePerDay": 45.0,
      "status": "available",
      "imageUrl": "/images/cars/1.jpg"
    }
  ]
}
```

### Car detail — `GET /api/mobile/v1/cars/{id}`

**Response `data` (example)**

```json
{
  "car": {
    "id": 1,
    "brand": "Toyota",
    "model": "Corolla",
    "type": "sedan",
    "pricePerDay": 45.0,
    "status": "available"
  }
}
```

## Test user

Create a **ROLE_USER** customer in the Symfony project (not admin/staff). Example:

- **Username:** value from your backend seed or admin-created user  
- **Password:** as set in Symfony  

If login fails, check `security.yaml` allows `POST /api/login` and credentials exist in MySQL.

## Bookings

See **[SYMFONY_MOBILE_BOOKING.md](SYMFONY_MOBILE_BOOKING.md)** for request/response samples. SAMSON runs **check-conflict** then **POST bookings** before showing success.

## Push notifications (FCM)

SAMSON registers device tokens after login. Backend implementation is documented in **[BACKEND_FCM_PUSH.md](BACKEND_FCM_PUSH.md)** (paste into Symfony agent).

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/api/mobile/v1/device-tokens` | JWT | `{ fcmToken, platform: "android"\|"ios" }` |
| DELETE | `/api/mobile/v1/device-tokens` | JWT | `{ fcmToken }` |

Until backend ships these routes, in-app notifications (`GET /notifications`) still work.

## Code map

| File | Role |
|------|------|
| `src/config/api.ts` | `API_BASE_URL`, `MOBILE_API` |
| `src/app/api/client.ts` | Envelope fetch, 401 → logout |
| `src/app/api/auth.ts` | Login, register |
| `src/app/api/cars.ts` | Fleet list/detail |
| `src/app/api/health.ts` | Health check |
| `src/app/api/bookings.ts` | List / create / conflict |
