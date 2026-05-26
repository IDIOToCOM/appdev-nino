# SAMSON — Parity prompt (match Uto Mobility website / Symfony backend)

**Copy everything below the line into your SAMSON (React Native) agent chat.**  
Edit **only** `C:\Users\User\Documents\AppDev\SAMSON`. Backend lives at `C:\Users\User\Downloads\Webdevfinals-main\Webdevfinals-main copy main ver` (Symfony + MySQL). Do **not** rebuild admin/staff UI in the app.

---

## Project roles

| Project | Role |
|---------|------|
| Symfony **Webdevfinals** | Backend + shared DB + customer website + admin panel |
| **SAMSON** | Customer-only React Native app (JWT, no session cookies) |

- API base (Forge / emulator): `https://uto.on-forge.com` or `http://10.0.2.2:8000` → `src/config/api.ts`
- Mobile JSON prefix: `/api/mobile/v1` with envelope `{ success, data, error, meta }` — use `apiFetch()` in `src/app/api/client.ts`
- JWT: `POST /api/login`, `POST /api/register` (not envelope)
- Timezone for all rental logic: **Asia/Manila**

---

## Branding & UI (customer site only)

Match the **light** customer theme (not admin dark UI).

**Design sources (read from Symfony repo):**

- `public/styles/landing.css` — CSS variables
- `public/styles/car-catalog.css` — catalog cards, filters
- `templates/landing/*.twig`, `templates/car_catalog/*.twig`, `templates/customer/*.twig`
- Logo file: `public/images/uto-car-rentals-logo.png` → copy to `SAMSON/assets/images/` and `require()` in `src/utils/images.ts`

**Theme already started in SAMSON:** `src/theme/uto.ts` (`UTO` colors: navy `#0a0a0a`, muted `#6b7280`, borders, 12px/20px radius). Extend `src/components/uto/*` (UtoButton, UtoCard, VehicleCard, CustomerShell, PageHeader, etc.).

**Typography / layout:** Minimal black-and-white “Uto Mobility” look; soft gray page background gradient; rounded cards with light shadow; primary CTA = near-black button.

---

## Auth & account

| Website | Mobile today | Target |
|---------|--------------|--------|
| `/login`, `/register` | Login, Register screens | JWT + **username or email** login |
| Email + password register | `/api/register` | **No verification email** — account active immediately, auto sign-in |
| Google OAuth (website) | `Continue with Google` on Login/Register | `@react-native-google-signin` → `POST /api/auth/google` with `idToken` |
| Google client ID | Symfony `GOOGLE_CLIENT_ID` | Copy into `src/config/google.ts` as `GOOGLE_WEB_CLIENT_ID` |
| Customer account `/account` | Profile screen | Show username, display name, phone; align copy with web |

**Rules:** App is **ROLE_USER customer only** — reject or hide features if JWT user is admin/staff (website blocks reviews for staff).

---

## Vehicle catalog

| Website feature | Symfony implementation | Mobile parity |
|-----------------|------------------------|---------------|
| Browse fleet `/cars` | `CarCatalogController`, `findForCustomerCatalog()` | `GET /api/mobile/v1/cars` — list screen |
| Vehicle detail `/cars/{id}` | Catalog show + reviews block | `GET /api/mobile/v1/cars/{id}` — detail screen |
| Car photo | `CarPhotoUploadService::resolvePublicUrl()` → `imageUrl` on mobile API | `src/utils/carImage.ts` prepends `API_BASE_URL` to relative paths |
| Types | SUV, Sedan, Hatchback, Sports Car, Truck | Filter chips on list (local filter OK) |
| Search / sort | Query params on catalog | Optional: same search/sort client-side |
| **Rental window filter** | `CatalogAvailabilityQuery` + `CatalogAvailabilityFilter` hides unavailable cars | Add date/time pickers on catalog; filter list client-side OR ask backend for query params later |
| **Estimated total on cards** | `CatalogRentalEstimateBuilder` + `RentalPriceCalculator` when pickup/return set | When user sets rental window, show **estimated days + ₱ total** on each card (mirror web copy: “estimated total for that window”) |
| Status | Only customer-visible cars (`isVisibleToCustomers()`) | Respect `status` from API; don’t book “out of service” cars |

**Car JSON fields (mobile):** `id`, `brand`, `model`, `type`, `pricePerDay`, `status`, `imageUrl`.

---

## Reviews (important — website has this; app needs it)

**Website behavior** (`CarReviewService`, `CarReviewController`):

- On car detail: show **average rating + review count** and list of reviews.
- Logged-in customer may **submit or edit** one review per car: **1–5 stars** + optional comment.
- **Eligibility:** customer must have at least one **Confirmed** booking for that car (or already has a review → can edit).
- POST `/cars/{id}/review` (session + CSRF) — **no mobile route yet**.

**Mobile tasks:**

1. On **CarDetailScreen**: show star summary + review list (read-only until API exists).
2. If user can review: star picker + comment + Submit (call new API when added).
3. **Backend ask (Symfony):** add e.g.  
   - `GET /api/mobile/v1/cars/{id}/reviews` → `{ summary: { reviewCount, averageRating }, reviews: [...], userReview?, canSubmitReview }`  
   - `POST /api/mobile/v1/cars/{id}/reviews` JWT body `{ rating, comment? }`

**Review display:** round average to half-star for display (`getStarRatingDisplay()` logic on web).

---

## Favorites (Saved) & Compare

| Website | Mobile today | Gap |
|---------|--------------|-----|
| **Favorites** persisted per user in DB (`CarFavoriteService`, `/cars/favorites`) | Redux `customerPrefs.favoriteIds` **device-only** | **Sync with backend:** toggle favorite API or mirror web POST toggle; list = user’s saved cars from server |
| **Compare** up to **4** cars (`CarCompareSession::MAX_CARS`) | Redux `compareIds` device-only | OK as local session **or** match max 4 + compare table UI like `templates/car_catalog/compare.html.twig` |
| Toolbar badges | Saved (n), Compare (n) | Already in CustomerMenu — keep in sync |

**Compare screen:** Side-by-side specs: brand/model, type, price/day, status, rating, Book CTA — see web compare table.

---

## Booking flow

| Step | Website | Mobile API (implemented) |
|------|---------|---------------------------|
| Pick vehicle | Catalog → Book this vehicle | Car detail → Book |
| Form fields | name, phone, pickup/dropoff location, dates, times | Same on `BookScreen` |
| Validation | `BookingScheduleValidator` | Mirror rules in app + show server `VALIDATION_ERROR` `details.fields` |
| Times | 12h or 24h; **30-minute slots only** | Use UtoTimePicker; examples `9:00 AM`, `9:30 AM` |
| Dates | Not in past; return ≥ pickup; min 30 min rental | Client hints + server errors |
| Conflict check | POST `/submit/booking/check-conflict` | `POST /api/mobile/v1/bookings/check-conflict` JWT |
| Submit | POST `/submit/booking` session | `POST /api/mobile/v1/bookings` JWT |
| Success copy | Pending — pay after confirm within 24h | Alert: same messaging as web flash |
| Admin sync | Booking appears in admin **Bookings** | Same DB — demo for rubric |

**Create booking body:**

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

**Booking statuses:** `Pending`, `Confirmed`, `Cancelled`, `Refunded` — show **Booking** chip separately from **Payment** chip on web.

---

## My bookings

| Website (`MyBookingController`, templates under `templates/my_bookings/`, `templates/customer/`) | Mobile |
|--------------------------------------------------------------------------------------------------|--------|
| List owned bookings `findForCustomer()` | `GET /api/mobile/v1/bookings` |
| Booking status badge | Show `status` on each row |
| Payment panel: amount due, Pay when allowed | **Not in mobile API yet** — add UI when `GET bookings` includes payment summary or separate endpoint |
| Pay single / pay bulk | Customer can pay when booking editable + payment `Pending` | Future: mobile payment flow or deep link to web |
| **Cancel booking** | `BookingCustomerRules`: only **Pending/Confirmed**; not within **24 hours** of pickup; custom confirm modal (not `window.confirm`) | Add cancel button + confirm modal; needs `POST /api/mobile/v1/bookings/{id}/cancel` JWT (mirror `MyBookingController` cancel) |
| Edit booking | Web allows edit with same 24h rule | Optional phase 2 |
| Cancel policy copy | `_booking_cancel_policy.html.twig`, FAQ `#faq-cancel` on `rental_help.html.twig` | **HelpScreen** section: 24h rule, statuses, refund note for confirmed+paid |

**Payment labels (web):** Payment status `Pending` → display **Unpaid**; `Completed` → **Paid** (avoid two “Pending” labels).

---

## Notifications

**Website:** In-app notifications for customers (`NotificationController`, bell in header, `/notifications`, mark read). Created when booking submitted, status changes, etc. (`BookingNotificationService`).

**Mobile:** CustomerMenu has bell icon **without wiring**.

**Tasks:**

- Add Notifications screen (list unread/read).
- **Backend needed:** e.g. `GET /api/mobile/v1/notifications`, `POST .../read`, `POST .../read-all` JWT.
- Poll or refresh on focus; badge count on menu.

---

## Help & static content

| Website route | Content to mirror in app |
|---------------|----------------------------|
| `/help` → `rental_help.html.twig` | Pickup/return, ID, fuel, **cancellation FAQ** (`#faq-cancel`) |
| `/contact` | Phone/email from web (read template or config) |
| `/about` | Short company blurb optional |

`HelpScreen` should include cancel policy consistent with `BookingCustomerRules::HOURS_BEFORE_PICKUP_TO_MODIFY` (24).

---

## Features that are **admin/staff only** — do NOT port to SAMSON

- Admin dashboard, dark theme, sidebar (Inventory, Bookings, Payments, Users, Activity Log, Analytics)
- Admin booking quick actions (confirm / decline / cancel / refund) — `BookingController::updateStatus`
- Admin notification center styling (customer notifications are separate UX)
- Car inventory CRUD, photo upload admin UI
- User management, analytics charts, activity log

---

## API reference (customer mobile)

### Implemented on backend (use these)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/mobile/v1/health` | No |
| GET | `/api/mobile/v1/cars` | No |
| GET | `/api/mobile/v1/cars/{id}` | No |
| GET | `/api/mobile/v1/bookings` | JWT |
| POST | `/api/mobile/v1/bookings` | JWT |
| POST | `/api/mobile/v1/bookings/check-conflict` | JWT |
| POST | `/api/login` | No |
| POST | `/api/register` | No |

Docs: Symfony `docs/SYMFONY_MOBILE_BOOKING.md`, SAMSON `docs/API.md`, `docs/SYMFONY_MOBILE_BOOKING.md`.

### Legacy fallback (avoid for new work)

- `GET /api/booking` — all bookings JSON; SAMSON filters by `createdBy === username` — replace with mobile list when possible.

### Backend still needed for full parity (implement in Symfony `MobileApiController` or ask backend agent)

| Feature | Suggested routes |
|---------|------------------|
| Reviews | `GET/POST /api/mobile/v1/cars/{id}/reviews` |
| Favorites | `GET /api/mobile/v1/favorites`, `POST /api/mobile/v1/favorites/{carId}/toggle` |
| Cancel booking | `POST /api/mobile/v1/bookings/{id}/cancel` |
| Payments on booking | `GET /api/mobile/v1/bookings/{id}` or embed `payment` on list |
| Notifications | `GET /api/mobile/v1/notifications`, mark read endpoints |
| Catalog filter | Optional query on `GET /cars?pickupDate&returnDate&pickupTime&returnTime` |

---

## SAMSON codebase map (what exists)

| Area | Path |
|------|------|
| Theme | `src/theme/uto.ts` |
| API | `src/app/api/{client,auth,cars,bookings,health}.ts` |
| Redux + sagas | `src/app/reducers`, `src/app/sagas` |
| Screens | Login, Register, CarList, CarDetail, Book, MyBookings, Profile, Help, Saved, Compare |
| Local prefs | `src/app/reducers/customerPrefs.ts` (favorites/compare) |
| Nav | `src/navigation/MainNav.tsx`, `src/utils/routes.ts` |

---

## Acceptance checklist (rubric-friendly)

1. Login/register → JWT → browse cars with images and prices.
2. Optional: set rental dates on catalog → show estimated total.
3. Book vehicle → conflict check → create → success message (Pending).
4. **My bookings** lists same rows as website for that user (shared DB).
5. Car detail shows ratings/reviews; submit review after confirmed rental (when API exists).
6. Saved/Compare usable (prefer server favorites).
7. Help explains cancel rules; cancel booking when API exists.
8. UI matches Uto light theme and logo.
9. Notifications when API exists.

---

## Implementation order (suggested)

1. Verify booking E2E (POST bookings) + My bookings list.
2. Car detail: review summary UI (mock or API).
3. Catalog rental window + price estimate (client-side calculator using `pricePerDay` + days).
4. Cancel booking + Help FAQ copy.
5. Server-sync favorites + notifications APIs (coordinate Symfony).
6. Payment status display on My bookings (when API returns payment).

**When unsure, read the Symfony template or controller named above — behavior and copy should match the website, not invent new business rules.**
