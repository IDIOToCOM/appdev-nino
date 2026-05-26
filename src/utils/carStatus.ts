export function isBookableStatus(status?: string | null): boolean {
  if (!status) {
    return true;
  }
  const s = status.toLowerCase();
  return s !== 'out of service' && s !== 'out_of_service' && s !== 'unavailable';
}
