/** YYYY-MM-DD in local time */
export function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateInput(ymd: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!match) {
    return null;
  }
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    12,
    0,
    0,
    0,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateDisplay(ymd: string): string {
  const date = parseDateInput(ymd);
  if (!date) {
    return 'Select date';
  }
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function suggestedRentalDates(): { pickupDate: string; returnDate: string } {
  const pickup = new Date();
  pickup.setDate(pickup.getDate() + 1);
  pickup.setHours(0, 0, 0, 0);
  const ret = new Date(pickup);
  ret.setDate(ret.getDate() + 3);
  return {
    pickupDate: formatDateInput(pickup),
    returnDate: formatDateInput(ret),
  };
}

/** 30-minute slots from 6:00 AM to 10:00 PM (website rules). */
export function buildTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 22 && minute === 30) {
        break;
      }
      const h12 = hour % 12 === 0 ? 12 : hour % 12;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const mm = minute === 0 ? '00' : '30';
      slots.push(`${h12}:${mm} ${ampm}`);
    }
  }
  return slots;
}

export const TIME_SLOTS = buildTimeSlots();

export const SUGGESTED_TIMES = ['9:00 AM', '9:30 AM', '5:00 PM', '5:30 PM'] as const;
