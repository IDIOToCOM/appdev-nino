import {
  TIME_SLOTS,
  formatDateInput,
  parseDateInput,
  startOfToday,
} from './bookingDates';

export type RentalScheduleFields = {
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
};

export function compareYmd(a: string, b: string): number {
  const da = parseDateInput(a);
  const db = parseDateInput(b);
  if (!da || !db) {
    return 0;
  }
  return da.getTime() - db.getTime();
}

export function maxYmd(a: string, b: string): string {
  return compareYmd(a, b) >= 0 ? a : b;
}

export function minYmd(a: string, b: string): string {
  return compareYmd(a, b) <= 0 ? a : b;
}

export function todayYmd(): string {
  return formatDateInput(startOfToday());
}

/** Minutes from midnight for "9:30 AM" style strings. */
export function parseTimeSlot(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) {
    return null;
  }
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) {
    hour += 12;
  }
  if (ampm === 'AM' && hour === 12) {
    hour = 0;
  }
  return hour * 60 + minute;
}

export function combineLocalDateTime(ymd: string, time: string): Date | null {
  const date = parseDateInput(ymd);
  const minutes = parseTimeSlot(time);
  if (!date || minutes === null) {
    return null;
  }
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date;
}

function minutesNow(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/** Next 30-minute slot at or after now (within catalog hours). */
export function earliestSlotToday(): string {
  const now = minutesNow();
  for (const slot of TIME_SLOTS) {
    const m = parseTimeSlot(slot);
    if (m !== null && m >= now) {
      return slot;
    }
  }
  return TIME_SLOTS[TIME_SLOTS.length - 1];
}

export function allowedTimeSlots(options: {
  dateYmd: string;
  role: 'pickup' | 'return';
  pickupDate?: string;
  pickupTime?: string;
}): string[] {
  let slots = [...TIME_SLOTS];
  const today = todayYmd();

  if (options.dateYmd === today) {
    const floor = minutesNow();
    slots = slots.filter(s => {
      const m = parseTimeSlot(s);
      return m !== null && m >= floor;
    });
  }

  if (
    options.role === 'return' &&
    options.pickupDate &&
    options.pickupDate === options.dateYmd &&
    options.pickupTime
  ) {
    const pickMins = parseTimeSlot(options.pickupTime);
    if (pickMins !== null) {
      const minReturn = pickMins + 30;
      slots = slots.filter(s => {
        const m = parseTimeSlot(s);
        return m !== null && m >= minReturn;
      });
    }
  }

  return slots;
}

export function clampTimeToAllowed(
  time: string,
  options: Parameters<typeof allowedTimeSlots>[0],
): string {
  const allowed = allowedTimeSlots(options);
  if (allowed.length === 0) {
    return time;
  }
  if (allowed.includes(time)) {
    return time;
  }
  const want = parseTimeSlot(time);
  if (want === null) {
    return allowed[0];
  }
  for (const slot of allowed) {
    const m = parseTimeSlot(slot);
    if (m !== null && m >= want) {
      return slot;
    }
  }
  return allowed[allowed.length - 1];
}

/** Normalize dates/times after any field change (catalog + booking). */
export function normalizeRentalSchedule(
  input: RentalScheduleFields,
): RentalScheduleFields {
  const today = todayYmd();
  let pickupDate = input.pickupDate;
  let returnDate = input.returnDate;
  let pickupTime = input.pickupTime;
  let returnTime = input.returnTime;

  if (compareYmd(pickupDate, today) < 0) {
    pickupDate = today;
  }
  if (compareYmd(returnDate, today) < 0) {
    returnDate = today;
  }
  if (compareYmd(returnDate, pickupDate) < 0) {
    returnDate = pickupDate;
  }

  pickupTime = clampTimeToAllowed(pickupTime, {
    dateYmd: pickupDate,
    role: 'pickup',
  });
  returnTime = clampTimeToAllowed(returnTime, {
    dateYmd: returnDate,
    role: 'return',
    pickupDate,
    pickupTime,
  });

  return { pickupDate, returnDate, pickupTime, returnTime };
}

export function applyRentalWindowChange(
  current: RentalScheduleFields,
  partial: Partial<RentalScheduleFields>,
): RentalScheduleFields {
  return normalizeRentalSchedule({ ...current, ...partial });
}

/** User-facing message for invalid dates/times (before silent normalize). */
export function scheduleIssuesMessage(
  fields: RentalScheduleFields,
): string | null {
  const errors = validateRentalSchedule(fields);
  return errors.schedule ?? errors.rentalDates ?? null;
}

export function scheduleIssuesMessageForChange(
  current: RentalScheduleFields,
  partial: Partial<RentalScheduleFields>,
): string | null {
  return scheduleIssuesMessage({ ...current, ...partial });
}

/** Explain why a time from the clock/chips was changed to another slot. */
export function timePickRejectionMessage(
  requested: string,
  applied: string,
  context: {
    dateYmd: string;
    role: 'pickup' | 'return';
    pickupDate?: string;
    pickupTime?: string;
  },
): string | null {
  if (requested === applied) {
    return null;
  }

  const reqM = parseTimeSlot(requested);
  const appM = parseTimeSlot(applied);
  if (reqM === null || appM === null) {
    return 'Choose a valid time.';
  }

  if (
    context.role === 'return' &&
    context.pickupDate &&
    context.pickupDate === context.dateYmd &&
    context.pickupTime
  ) {
    const pickM = parseTimeSlot(context.pickupTime);
    if (pickM !== null && reqM < pickM + 30) {
      return 'Return time must be after pickup. On the same day, choose a time at least 30 minutes later.';
    }
  }

  if (context.role === 'pickup' && appM > reqM) {
    return 'That pickup time has already passed today. Choose a later time.';
  }

  if (context.role === 'return' && appM > reqM) {
    return 'That return time is not available. Choose a later time.';
  }

  return 'That time is not available for your selected date. Please pick a later slot.';
}

export function validateRentalSchedule(
  fields: RentalScheduleFields,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const today = todayYmd();
  const now = new Date();

  if (!fields.pickupDate || !fields.returnDate) {
    errors.rentalDates = 'Please select pickup and return dates.';
    return errors;
  }

  if (compareYmd(fields.pickupDate, today) < 0) {
    errors.schedule = 'Pickup date cannot be in the past.';
    return errors;
  }

  if (compareYmd(fields.returnDate, today) < 0) {
    errors.schedule = 'Return date cannot be in the past.';
    return errors;
  }

  if (compareYmd(fields.returnDate, fields.pickupDate) < 0) {
    errors.schedule = 'Return date must be on or after pickup date.';
    return errors;
  }

  const pickupDt = combineLocalDateTime(fields.pickupDate, fields.pickupTime);
  const returnDt = combineLocalDateTime(fields.returnDate, fields.returnTime);

  if (!pickupDt || !returnDt) {
    errors.schedule = 'Enter valid pickup and return times.';
    return errors;
  }

  if (pickupDt < now) {
    errors.schedule = 'Pickup cannot be in the past. Choose a later date or time.';
    return errors;
  }

  if (returnDt < now) {
    errors.schedule = 'Return cannot be in the past. Choose a later date or time.';
    return errors;
  }

  if (returnDt < pickupDt) {
    errors.schedule = 'Return must be after pickup.';
    return errors;
  }

  const minRentalMs = 30 * 60 * 1000;
  if (returnDt.getTime() - pickupDt.getTime() < minRentalMs) {
    errors.schedule = 'Rental must be at least 30 minutes.';
  }

  return errors;
}

export function minReturnDateYmd(pickupDate: string): Date {
  const today = startOfToday();
  const pickup = parseDateInput(pickupDate);
  if (!pickup || pickup < today) {
    return today;
  }
  return pickup;
}
