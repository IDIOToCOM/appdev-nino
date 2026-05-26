# Website login works, mobile app does not

## Why

| | Website | Mobile app |
|---|---------|------------|
| URL | `POST /login` (form + session cookie) | `POST /api/mobile/v1/auth/login` (JSON + JWT token) |
| Auth | Symfony session | Lexik JWT (`config/jwt/private.pem` + `JWT_PASSPHRASE`) |

Same database users, **different login mechanism**. If JWT keys on Forge are missing or wrong, the website still works; the app gets a server error after correct username/password.

## Fix on Forge

**Option A — Commands tab (no SSH):**

1. Forge → your site → **Commands** → **New command**
2. Run: `php bin/console lexik:jwt:generate-keypair --overwrite`
3. Run: `php bin/console cache:clear --env=prod`

**Option B — SSH:**

```bash
cd /home/forge/YOUR-SITE-DIRECTORY

php bin/console lexik:jwt:generate-keypair --overwrite
php bin/console cache:clear --env=prod
```

After generating keys, confirm `.env` on the server still has the same `JWT_PASSPHRASE` as before (or update it to match `config/jwt/passphrase` if Lexik wrote a new one).

Test:

```bash
curl -s -X POST https://uto.on-forge.com/api/mobile/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"juan@example.com","password":"YOUR_PASSWORD"}'
```

Expect: `"success":true` and `"token":"eyJ..."`.

## Deploy latest Symfony code

Ensure Forge has `MobileAuthController` and `LoginUserProvider` (email or username login).

## App config

`src/config/api.ts`: `USE_FORGE_IN_DEV = true` and `FORGE_API` = your Forge HTTPS URL.
