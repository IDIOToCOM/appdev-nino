/**
 * API host for Symfony backend (website + mobile JSON).
 *
 * While Metro is running, `__DEV__` is true. Set USE_FORGE_IN_DEV to true to hit
 * production/staging on Forge instead of local Symfony.
 *
 * - Forge: Laravel Forge HTTPS site
 * - Dev emulator (local): 10.0.2.2 = host machine from Android emulator
 * - Dev physical device (local): set DEV_API to your PC LAN IP, e.g. http://192.168.1.10:8000
 */
export const FORGE_API = 'https://uto.on-forge.com';

/** Local Symfony: symfony serve or php -S on port 8000 */
export const DEV_API = 'http://10.0.2.2:8000';

/**
 * PC-side proxy (npm run dev:proxy) for Android emulators that cannot reach external HTTPS.
 * Emulator uses 10.0.2.2 to reach the host machine.
 */
export const DEV_PROXY = 'http://10.0.2.2:8787';

/** true = app uses Forge when you run from Metro (npm start / run-android) */
export const USE_FORGE_IN_DEV = true;

/**
 * true = route API through DEV_PROXY in dev (emulator only).
 * Keep false when demoing on a physical phone; 10.0.2.2 only exists inside
 * the Android emulator.
 */
export const USE_EMULATOR_PROXY = false;

export const API_BASE_URL =
  __DEV__ && USE_EMULATOR_PROXY
    ? DEV_PROXY
    : __DEV__ && !USE_FORGE_IN_DEV
      ? DEV_API
      : FORGE_API;

export const MOBILE_API = `${API_BASE_URL}/api/mobile/v1`;

if (__DEV__) {
  console.log('[SAMSON] API_BASE_URL =', API_BASE_URL);
}


