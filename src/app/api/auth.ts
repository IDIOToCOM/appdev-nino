import { API_BASE_URL } from '../../config/api';
import type { AuthLoginPayload } from '../action';
import { apiFetch, jsonFetch, parseRegisterError } from './client';

export type AuthSession = {
  token: string;
  username: string;
  /** Symfony JWT from email login or Forge Google sync */
  authProvider?: 'symfony' | 'firebase' | 'google';
  /** Firebase uid when signed in via Google */
  uid?: string;
  email?: string;
};

export type RegisterPayload = {
  username: string;
  password: string;
};

const JWT_SERVER_HINT =
  'The server could not create a login token. In Laravel Forge → your site → Commands, run: php bin/console lexik:jwt:generate-keypair --overwrite then php bin/console cache:clear --env=prod';

function loginErrorFromJson(
  data: {
    message?: string;
    errors?: Record<string, string>;
    detail?: string;
  } | null,
  status: number,
): Error {
  if (status >= 500) {
    const detail =
      data?.message ||
      data?.errors?.detail ||
      data?.detail ||
      '';
    const generic =
      !detail ||
      detail === 'Internal Server Error' ||
      detail.toLowerCase().includes('internal server error');
    return new Error(
      generic ? JWT_SERVER_HINT : `Server error (${status}): ${detail}`,
    );
  }

  const raw =
    data?.errors?.password ||
    data?.errors?.username ||
    data?.errors?.detail ||
    data?.detail ||
    data?.message ||
    'Invalid username or password.';

  const message =
    typeof raw === 'string' &&
    raw.toLowerCase().includes('verify your email')
      ? 'Invalid username or password.'
      : raw;

  return new Error(message);
}

async function loginViaJwtApi(
  username: string,
  password: string,
): Promise<AuthSession> {
  const { data, response } = await jsonFetch<{
    token?: string;
    message?: string;
    errors?: Record<string, string>;
    detail?: string;
  }>(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    body: { username, password },
  });

  if (!response.ok) {
    throw loginErrorFromJson(data, response.status);
  }

  if (!data?.token) {
    throw new Error('Login response missing token');
  }

  return { token: data.token, username, authProvider: 'symfony' };
}

async function loginViaMobileApi(
  username: string,
  password: string,
): Promise<AuthSession> {
  const data = await apiFetch<{
    token: string;
    username?: string;
  }>('/auth/login', {
    method: 'POST',
    body: { username, password },
  });

  if (!data?.token) {
    throw new Error('Login response missing token');
  }

  return { token: data.token, username: data.username ?? username, authProvider: 'symfony' };
}

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.startsWith('Unable to reach') ||
      error.message.includes('Network request failed'))
  );
}

export async function userLogin({
  username,
  password,
}: AuthLoginPayload): Promise<AuthSession> {
  try {
    return await loginViaJwtApi(username, password);
  } catch (jwtError: unknown) {
    if (isNetworkError(jwtError)) {
      throw jwtError;
    }

    const jwtMessage =
      jwtError instanceof Error ? jwtError.message : 'Login failed';

    if (__DEV__) {
      console.log('JWT /api/login failed, trying /api/mobile/v1/auth/login', jwtMessage);
    }

    try {
      return await loginViaMobileApi(username, password);
    } catch (mobileError: unknown) {
      const mobileMessage =
        mobileError instanceof Error ? mobileError.message : '';
      const jwtIsServerError =
        jwtError instanceof Error && jwtError.message.includes('500');

      if (mobileMessage && (jwtIsServerError || mobileMessage.includes('JWT'))) {
        throw mobileError instanceof Error
          ? mobileError
          : new Error('Login failed');
      }

      if (jwtError instanceof Error) {
        throw jwtError;
      }
      throw mobileError instanceof Error
        ? mobileError
        : new Error('Login failed');
    }
  }
}

export async function loginWithGoogle(idToken: string): Promise<AuthSession> {
  const { data, response } = await jsonFetch<{
    token?: string;
    username?: string;
    email?: string;
    message?: string;
    errors?: Record<string, string>;
    detail?: string;
  }>(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    body: { idToken },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        'Google sign-in is not available on the server yet. Ask your admin to deploy POST /api/auth/google on Forge and set GOOGLE_CLIENT_ID to the Firebase web client ID.',
      );
    }
    if (response.status >= 500) {
      throw new Error(
        data?.message ||
          'Server error during Google sign-in. Check GOOGLE_CLIENT_ID and JWT keys on Forge.',
      );
    }
    const message =
      data?.message ||
      data?.errors?.detail ||
      data?.detail ||
      'Could not sync Google account with the server.';
    if (response.status === 401) {
      const lower = message.toLowerCase();
      if (lower.includes('audience mismatch')) {
        throw new Error(
          'Google token audience mismatch. On Forge, GOOGLE_MOBILE_CLIENT_ID must be 91144758451-quaf2k09d6ia0mg199qh5m2lcbvplm2i.apps.googleusercontent.com, then cache:clear.',
        );
      }
      if (lower.includes('invalid google sign-in token')) {
        throw new Error(
          'Google token was rejected (expired or invalid). Reload the app, try again, and ensure the emulator date/time is correct. On Forge run cache:clear after env changes.',
        );
      }
    }
    throw new Error(message);
  }

  if (!data?.token) {
    throw new Error('Google sign-in response missing token');
  }

  return {
    token: data.token,
    username: data.username ?? data.email ?? '',
    email: data.email,
    authProvider: 'google',
  };
}

export async function userRegister(payload: RegisterPayload): Promise<void> {
  const { data, response } = await jsonFetch<Record<string, unknown>>(
    `${API_BASE_URL}/api/register`,
    {
      method: 'POST',
      body: payload,
    },
  );

  if (!response.ok) {
    throw new Error(parseRegisterError(data, response.status));
  }
}
