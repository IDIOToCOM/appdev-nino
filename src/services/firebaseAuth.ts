import { getAuth, signOut } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { loginWithGoogle, type AuthSession } from '../app/api/auth';

/**
 * Google Sign-In → Symfony JWT. Forge verifies the Google id token directly;
 * we do not pass the token through Firebase Auth (avoids stale-token errors).
 */
export async function signInWithGoogleCredential(
  idToken: string,
): Promise<AuthSession> {
  const forgeSession = await loginWithGoogle(idToken);

  return {
    token: forgeSession.token,
    username: forgeSession.username || forgeSession.email || '',
    email: forgeSession.email,
    authProvider: 'google',
  };
}

export async function signOutFirebase(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // User may not have signed in with Google on this device session.
  }

  const auth = getAuth();
  if (auth.currentUser) {
    await signOut(auth);
  }
}
