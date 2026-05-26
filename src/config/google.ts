/**
 * Web OAuth client ID from Firebase (client_type 3 in android/app/google-services.json).
 * Required by @react-native-google-signin/google-signin for Firebase Google Auth.
 */
export const GOOGLE_WEB_CLIENT_ID =
  '91144758451-quaf2k09d6ia0mg199qh5m2lcbvplm2i.apps.googleusercontent.com';

export const isGoogleSignInConfigured = (): boolean =>
  GOOGLE_WEB_CLIENT_ID.length > 0 &&
  !GOOGLE_WEB_CLIENT_ID.includes('REPLACE_WITH_YOUR');

export const SHOW_GOOGLE_SIGN_IN_UI = isGoogleSignInConfigured();
