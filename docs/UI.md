# SAMSON UI — Uto Mobility customer theme

Mobile screens follow the **customer** website in PROJECT B (Symfony + Twig), not the admin panel.

## Design source (read-only reference)

| Asset | Path on reference project |
|-------|---------------------------|
| Colors, buttons, page canvas | `public/styles/landing.css` |
| Vehicle cards, catalog layout | `public/styles/car-catalog.css` |
| Customer booking pages | `public/styles/customer-booking.css` |
| Page hero pattern | `templates/customer/_customer_page_hero.html.twig` |
| Catalog grid | `templates/car_catalog/index.html.twig` |
| Vehicle detail | `templates/car_catalog/show.html.twig` |

Reference project folder (do not edit from SAMSON):

`c:\Users\User\Downloads\Webdevfinals-main\Webdevfinals-main copy main ver`

## Theme tokens

Defined in `src/theme/uto.ts`:

| Token | Value | Web CSS variable |
|-------|-------|------------------|
| Primary text | `#0a0a0a` | `--uto-text` / `--uto-navy` |
| Body text | `#374151` | `--uto-text-body` |
| Muted | `#6b7280` | `--uto-muted` |
| Border | `#e5e7eb` | `--uto-border` |
| Page background | `#f5f5f5` | `landing-body` gradient base |
| Card | white + soft shadow | `.lp-car-card` |
| Primary button | black, uppercase | `.lp-btn-primary` |
| Ghost button | white + border | `.lp-btn-ghost` |
| Radius | 12px / 20px | `--uto-radius` / `--uto-radius-lg` |

Prices use **₱/day** like the website (`formatPricePerDay`).

## Shared components

| Component | File | Web equivalent |
|-----------|------|----------------|
| `ScreenBackground` | `src/components/uto/ScreenBackground.tsx` | `.landing-body` light gray canvas |
| `UtoLogo` | `src/components/uto/UtoLogo.tsx` | `.lp-logo-img` |
| `UtoButton` | `src/components/uto/UtoButton.tsx` | `.lp-btn-primary` / `.lp-btn-ghost` |
| `UtoCard` | `src/components/uto/UtoCard.tsx` | `.lp-car-card` surface |
| `PageHeader` | `src/components/uto/PageHeader.tsx` | `.lp-customer-hero` kicker + title + lead |
| `UtoTextInput` | `src/components/uto/UtoTextInput.tsx` | `.lp-catalog-search__input` style |
| `CarMedia` | `src/components/uto/CarMedia.tsx` | `.lp-car-card__media` + badge |
| `StatusBanner` | `src/components/uto/StatusBanner.tsx` | Connection / alert strip |

## Static assets

Logo (copied from website):

- `assets/images/uto-car-rentals-logo.png`
- Loaded via `src/utils/images.ts` and `require()`

Vehicle photos: from API `imageUrl` when the backend provides it; otherwise a gray placeholder block (same as empty media on web).

## Customer shell (all main screens)

- **Header:** Uto logo (left) + menu button (right) — like `_header_customer.html.twig`
- **Menu overlay:** Vehicles, Saved, Compare, My bookings, Help, Account, Sign out

## Screens

| Screen | Matches web page |
|--------|------------------|
| Login | Customer sign-in |
| Register | Account creation |
| Car list | `/cars` catalog + hero + filters + featured strip |
| Car detail | Vehicle show page |
| Book | `/submit/booking` form |
| My bookings | `/my/bookings` list |
| Saved / Compare | `/my/favorites`, `/cars/compare` (device-local IDs) |
| Help | `/help` (placeholder copy) |
| Profile | Account |

## What we intentionally skip

- Admin dark sidebar and staff inventory UI
- Session cookies (JWT only)
- Local SQLite/AsyncStorage as source of truth for fleet or bookings

## API styling note

All data styling is separate from API integration — see `docs/API.md`. UI changes do not alter `src/app/api/*` or sagas except optional `imageUrl` on `Car` type.
