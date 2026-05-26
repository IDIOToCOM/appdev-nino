import { API_BASE_URL, MOBILE_API } from '../../config/api';
import {
  MobileApiRequestError,
  parseFieldErrorsFromDetails,
} from './errors';

export type MobileApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type MobileEnvelope<T> = {
  success: boolean;
  data: T;
  error: MobileApiError | null;
  meta?: {
    apiVersion: string;
    timestamp: string;
    count?: number;
  };
};

export type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  token?: string | null;
};

let unauthorizedHandler: (() => void) | null = null;

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'SAMSON-Mobile/1.0',
};

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function mergeHeaders(extra?: Record<string, string>): Record<string, string> {
  return { ...DEFAULT_HEADERS, ...extra };
}

function buildMobileUrl(path: string): string {
  if (path.startsWith('http')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${MOBILE_API}${normalized}`;
}

function buildApiUrl(path: string): string {
  if (path.startsWith('http')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

async function parseResponse<T>(
  response: Response,
  auth: boolean,
): Promise<T> {
  if (response.status === 401 && auth) {
    unauthorizedHandler?.();
    throw new Error('Session expired. Please log in again.');
  }

  let json: unknown = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  return json as T;
}

function throwMobileApiError(
  json: MobileEnvelope<unknown> | null,
  status: number,
): never {
  if (!json?.error) {
    throw new Error(`Request failed (${status})`);
  }

  const { code, message, details } = json.error;
  const fieldErrors = parseFieldErrorsFromDetails(details);

  if (__DEV__) {
    console.log('Mobile API error', status, code, message, fieldErrors);
  }

  const detailLines = Object.values(fieldErrors);
  const fullMessage =
    detailLines.length > 0
      ? `${message}\n\n${detailLines.join('\n')}`
      : message;

  throw new MobileApiRequestError(fullMessage, { code, fieldErrors });
}

function formatFetchError(url: string, error: unknown): string {
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    // keep raw url
  }
  if (__DEV__ && error instanceof Error && error.message) {
    return `Unable to reach ${host}. ${error.message}`;
  }
  return `Unable to reach ${host}. Check your internet connection and try again.`;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = false, token = null } = options;

  const headers = mergeHeaders(
    auth && token ? { Authorization: `Bearer ${token}` } : undefined,
  );

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildMobileUrl(path), init);
  } catch (error) {
    if (__DEV__) {
      console.warn('[api] fetch failed', buildMobileUrl(path), error);
    }
    throw new Error(formatFetchError(buildMobileUrl(path), error));
  }

  const json = await parseResponse<MobileEnvelope<T> | null>(response, auth);

  if (!response.ok || !json) {
    if (response.status === 404 && !json) {
      throw new Error(`Request failed (404)`);
    }
    throwMobileApiError(json as MobileEnvelope<unknown> | null, response.status);
  }

  if (!json.success) {
    throwMobileApiError(json as MobileEnvelope<unknown>, response.status);
  }

  return json.data;
}

/** JWT JSON routes under /api (not mobile envelope). */
export async function jwtFetch<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    token: string;
  },
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers = mergeHeaders({ Authorization: `Bearer ${token}` });

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), init);
  } catch (error) {
    if (__DEV__) {
      console.warn('[api] jwtFetch failed', buildApiUrl(path), error);
    }
    throw new Error(formatFetchError(buildApiUrl(path), error));
  }

  const json = await parseResponse<T | { message?: string; error?: string }>(
    response,
    true,
  );

  if (!response.ok) {
    const err = json as { message?: string; error?: string };
    throw new Error(
      err?.message || err?.error || `Request failed (${response.status})`,
    );
  }

  return json as T;
}

export async function jsonFetch<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST';
    body?: unknown;
  } = {},
): Promise<{ data: T; response: Response }> {
  const { method = 'GET', body } = options;

  const headers = mergeHeaders();

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    if (__DEV__) {
      console.warn('[api] jsonFetch failed', url, error);
    }
    throw new Error(formatFetchError(url, error));
  }

  let data: T | null = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { data: data as T, response };
}

export function parseRegisterError(
  data: Record<string, unknown> | null,
  status: number,
): string {
  if (!data) {
    return `Registration failed (${status})`;
  }

  const envelope = data as Partial<MobileEnvelope<unknown>>;
  if (envelope.success === false && envelope.error?.message) {
    return envelope.error.message;
  }

  const errors = data.errors as Record<string, string> | undefined;
  if (errors) {
    const first = Object.values(errors)[0];
    if (first) {
      return first;
    }
  }

  if (typeof data.message === 'string') {
    return data.message;
  }
  if (typeof data.detail === 'string') {
    return data.detail;
  }

  return `Registration failed (${status})`;
}
