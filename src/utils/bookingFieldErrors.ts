/** Map Symfony validation keys to messages shown on each form control. */
export function resolveFieldError(
  fieldErrors: Record<string, string>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    if (fieldErrors[key]) {
      return fieldErrors[key];
    }
  }
  return undefined;
}

export function allFieldErrorMessages(
  fieldErrors: Record<string, string>,
): string[] {
  return Object.values(fieldErrors);
}
