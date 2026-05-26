import { parseDateInput } from './bookingDates';

/** Calendar days inclusive (pickup through return), minimum 1 — matches RentalPriceCalculator. */
export function countRentalDays(pickupYmd: string, returnYmd: string): number {
  const pickup = parseDateInput(pickupYmd);
  const ret = parseDateInput(returnYmd);
  if (!pickup || !ret) {
    return 1;
  }
  const diffMs = ret.getTime() - pickup.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return Math.max(1, diffDays + 1);
}

export function estimateRentalTotal(
  pickupYmd: string,
  returnYmd: string,
  pricePerDay: number,
): { days: number; total: number } {
  const days = countRentalDays(pickupYmd, returnYmd);
  const rate = Math.max(0, pricePerDay);
  return { days, total: days * rate };
}

export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
}
