/** Thrown by apiFetch when the mobile envelope includes validation details. */
export class MobileApiRequestError extends Error {
  readonly code?: string;
  readonly fieldErrors: Record<string, string>;

  constructor(
    message: string,
    options?: { code?: string; fieldErrors?: Record<string, string> },
  ) {
    super(message);
    this.name = 'MobileApiRequestError';
    this.code = options?.code;
    this.fieldErrors = options?.fieldErrors ?? {};
  }
}

export function parseFieldErrorsFromDetails(
  details: unknown,
): Record<string, string> {
  if (!details || typeof details !== 'object') {
    return {};
  }

  const raw = (details as { fields?: unknown }).fields;
  if (!raw) {
    return {};
  }

  if (Array.isArray(raw)) {
    return { form: raw.filter((x): x is string => typeof x === 'string').join(' ') };
  }

  if (typeof raw === 'object') {
    const map: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value === 'string') {
        map[key] = value;
      }
    }
    return map;
  }

  return {};
}
