import type { Car } from '../app/api/cars';

/** Match brand, model, or full name (e.g. "toyota innova"). */
export function matchesCarSearch(
  query: string,
  car: Pick<Car, 'brand' | 'model'>,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const brand = car.brand.trim().toLowerCase();
  const model = car.model.trim().toLowerCase();
  const full = `${brand} ${model}`;
  return (
    brand.includes(q) ||
    model.includes(q) ||
    full.includes(q) ||
    q.split(/\s+/).every(part => full.includes(part))
  );
}
