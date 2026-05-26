# Backend task: Firebase push notifications (FCM) for SAMSON mobile app

Paste this into the **Symfony / Webdev** Cursor agent. Do **not** edit the SAMSON React Native repo from that agent.

---

## Context

**SAMSON** (React Native customer app) already has:

- **In-app notifications** — `GET /api/mobile/v1/notifications` (JWT, envelope JSON)
- **Firebase** — Google Sign-In only (`@react-native-firebase/auth`)
- **FCM client (added in SAMSON)** — `@react-native-firebase/messaging`

After login, the app:

1. Requests notification permission (Android 13+: `POST_NOTIFICATIONS`)
2. Gets an **FCM device token** from Firebase
3. Calls **`POST /api/mobile/v1/device-tokens`** with JWT + `{ fcmToken, platform: "android"|"ios" }`
4. On logout, calls **`DELETE /api/mobile/v1/device-tokens`** with `{ fcmToken }`

If `/device-tokens` returns **404**, the app still works — in-app notifications only, no push.

**Your job:** implement backend storage + FCM send when `AppNotification` rows are created (booking confirmed, cancelled, payment reminder, etc.) — same events as `BookingNotificationService` today.

---

## Existing Symfony code (read first)

| File | Purpose |
|------|---------|
| `src/Service/BookingNotificationService.php` | Creates `AppNotification` rows |
| `src/Entity/AppNotification.php` | In-app notification entity |
| `src/Controller/MobileApiController.php` | `GET/POST /api/mobile/v1/notifications*` |
| `config/packages/security.yaml` | `/api/mobile/v1/notifications` requires `ROLE_USER` |

Firebase project (mobile): **appdev-2ea68** (same as Google Sign-In).

---

## 1. Database — `device_token` table

Migration example:

```sql
CREATE TABLE device_token (
  id INT AUTO_INCREMENT PRIMARY KEY,
  login_id INT NOT NULL,
  fcm_token VARCHAR(512) NOT NULL,
  platform VARCHAR(16) NOT NULL DEFAULT 'android',
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uniq_fcm_token (fcm_token),
  INDEX idx_login (login_id),
  CONSTRAINT FK_device_token_login FOREIGN KEY (login_id) REFERENCES login (id) ON DELETE CASCADE
);
```

One user may have multiple tokens (phone + tablet). Upsert on register (same `fcm_token` → update `login_id` + `updated_at` if user re-login on same device).

---

## 2. Mobile API routes (JWT + envelope)

Add to `MobileApiController` (or dedicated controller). Match existing envelope: `{ success, data, error, meta }`.

### `POST /api/mobile/v1/device-tokens`

**Auth:** JWT (`ROLE_USER`)

**Body:**

```json
{
  "fcmToken": "eXaMpLe...",
  "platform": "android"
}
```

**Response `data`:**

```json
{ "registered": true }
```

**Logic:** Validate non-empty `fcmToken`, `platform` in `android|ios`, upsert for current user.

### `DELETE /api/mobile/v1/device-tokens`

**Auth:** JWT

**Body:**

```json
{ "fcmToken": "eXaMpLe..." }
```

**Response `data`:**

```json
{ "removed": true }
```

**Logic:** Delete row only if `login_id` matches current user.

Add to `security.yaml`:

```yaml
- { path: ^/api/mobile/v1/device-tokens, roles: ROLE_USER }
```

---

## 3. Send FCM when in-app notification is created

In `BookingNotificationService` (or a new `PushNotificationService` called from there), after persisting `AppNotification`:

1. Load all `device_token` rows for `$recipient->getId()`
2. For each token, POST to **FCM HTTP v1**:
   `https://fcm.googleapis.com/v1/projects/{project-id}/messages:send`

**Recommended payload** (works with SAMSON foreground handler + OS tray when backgrounded):

```json
{
  "message": {
    "token": "<fcmToken>",
    "notification": {
      "title": "<AppNotification.title>",
      "body": "<AppNotification.body>"
    },
    "data": {
      "type": "<AppNotification.type>",
      "notificationId": "123",
      "bookingId": "456"
    },
    "android": {
      "priority": "HIGH",
      "notification": {
        "channel_id": "uto_mobility_alerts",
        "sound": "default",
        "default_vibrate_timings": true
      }
    }
  }
}
```

On FCM error `NOT_FOUND` / invalid token → delete stale `device_token` row.

**Do not block** the HTTP request on FCM failure — log and continue (same as email).

---

## 4. Forge / Environment

### Firebase Console (one-time)

1. Project **appdev-2ea68** → Project settings → **Service accounts**
2. **Generate new private key** → save JSON securely (not in git)
3. Ensure **Firebase Cloud Messaging API** is enabled in Google Cloud Console

### Forge Environment

```env
FCM_PROJECT_ID=appdev-2ea68
FCM_SERVICE_ACCOUNT_JSON=/home/forge/utocarrentals.on-forge.com/storage/firebase-service-account.json
```

Upload the JSON to that path (or use Forge **Secrets** / shared `storage/`). Restrict file permissions: `chmod 600`.

---

## 5. PHP implementation sketch

- `composer require google/auth` (or `kreait/firebase-php` if preferred)
- `App\Service\FcmPushService::sendToUser(Login $user, string $title, string $body, array $data): void`
- OAuth2 access token from service account JSON, cache token until expiry
- Wire into `BookingNotificationService` after `$em->persist($notification)`

---

## 6. Deploy checklist

```bash
cd /home/forge/utocarrentals.on-forge.com
php bin/console doctrine:migrations:migrate --no-interaction --env=prod
php bin/console cache:clear --env=prod
```

Upload FCM service account JSON to server.

Test register from app (Metro log: no 404 on `/device-tokens`), then trigger a booking event and confirm push on device.

---

## 7. Acceptance criteria

- [ ] `POST /api/mobile/v1/device-tokens` returns 200 + `{ registered: true }` with valid JWT
- [ ] `DELETE /api/mobile/v1/device-tokens` removes token for current user only
- [ ] Creating a booking notification sends FCM to registered devices
- [ ] Invalid FCM tokens are removed from DB
- [ ] No secrets committed to git
- [ ] Existing in-app notification list unchanged

---

## 8. SAMSON app side (already done — do not duplicate)

- `@react-native-firebase/messaging`
- `src/services/pushNotifications.ts`
- `src/app/api/deviceTokens.ts`
- Registers token after login; unregisters on logout
- Foreground: alert + refresh notification list
- Background: OS shows notification if payload includes `notification` block

After backend is live, user must **rebuild Android app** (`npm run android`) and sign in once to register token.
