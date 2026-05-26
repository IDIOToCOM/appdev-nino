import { apiFetch, jwtFetch } from './client';

export type Booking = {
  id: number;
  status?: string;
  paymentStatus?: string | null;
  amountDue?: number | null;
  amountPaid?: number | null;
  canPay?: boolean;
  name: string;
  phone?: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  car?: {
    id: number;
    brand: string;
    model: string;
  } | null;
  createdBy?: string | null;
};

export type CreateBookingPayload = {
  carId: number;
  name: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
};

export type ConflictResult = {
  hasConflict: boolean;
  message: string;
};

export async function fetchMyBookings(token: string): Promise<Booking[]> {
  const data = await apiFetch<{ bookings: Booking[] }>('/bookings', {
    auth: true,
    token,
  });
  return data.bookings ?? [];
}

/** Only used if mobile bookings route is missing (old servers). */
export async function fetchMyBookingsLegacy(
  token: string,
  username: string,
): Promise<Booking[]> {
  const rows = await jwtFetch<Booking[]>('/api/booking', {
    method: 'GET',
    token,
  });
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.filter(b => b.createdBy === username);
}

export async function fetchMyBookingsWithFallback(
  token: string,
  username: string,
): Promise<Booking[]> {
  try {
    return await fetchMyBookings(token);
  } catch (error: any) {
    const msg = error?.message || '';
    if (msg.includes('404')) {
      return fetchMyBookingsLegacy(token, username);
    }
    throw error;
  }
}

export async function createBooking(
  token: string,
  payload: CreateBookingPayload,
): Promise<Booking> {
  const data = await apiFetch<{ booking: Booking }>('/bookings', {
    method: 'POST',
    auth: true,
    token,
    body: payload,
  });
  if (!data.booking) {
    throw new Error('We could not confirm your booking. Please try again or contact Uto Mobility support.');
  }
  return data.booking;
}

export async function cancelBooking(
  token: string,
  bookingId: number,
): Promise<{ booking: Booking; message?: string }> {
  const data = await apiFetch<{ booking: Booking; message?: string }>(
    `/bookings/${bookingId}/cancel`,
    {
      method: 'POST',
      auth: true,
      token,
      body: {},
    },
  );
  if (!data.booking) {
    throw new Error('We could not cancel this booking. Please try again or contact Uto Mobility support.');
  }
  return { booking: data.booking, message: data.message };
}

export function canCancelBookingClient(booking: Booking): boolean {
  const status = (booking.status || '').toLowerCase();
  if (status === 'cancelled' || status === 'refunded') {
    return false;
  }
  if (status !== 'pending' && status !== 'confirmed') {
    return false;
  }
  if (!booking.pickupDate || !booking.pickupTime) {
    return true;
  }
  const pickup = new Date(`${booking.pickupDate}T12:00:00`);
  const now = new Date();
  const hoursUntil = (pickup.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntil > 24;
}

export function canPayBooking(booking: Booking): boolean {
  if (booking.canPay === true) {
    return true;
  }
  if (booking.canPay === false) {
    return false;
  }
  const bookingStatus = (booking.status || '').toLowerCase();
  if (bookingStatus === 'cancelled' || bookingStatus === 'refunded') {
    return false;
  }
  return (booking.paymentStatus || '').toLowerCase() === 'pending';
}

export async function payBooking(
  token: string,
  bookingId: number,
  amount?: number,
): Promise<{ booking: Booking; message?: string }> {
  const body = amount != null && amount > 0 ? { amount } : {};
  const data = await apiFetch<{ booking: Booking; message?: string }>(
    `/bookings/${bookingId}/pay`,
    {
      method: 'POST',
      auth: true,
      token,
      body,
    },
  );
  if (!data.booking) {
    throw new Error('Payment response missing booking');
  }
  return data;
}

export function paymentStatusLabel(status?: string | null): string {
  if (!status) {
    return '';
  }
  if (status.toLowerCase() === 'pending') {
    return 'Unpaid';
  }
  if (status.toLowerCase() === 'completed') {
    return 'Paid';
  }
  return status;
}

export async function checkBookingConflict(
  token: string,
  payload: CreateBookingPayload & { excludeBookingId?: number },
): Promise<ConflictResult> {
  return apiFetch<ConflictResult>('/bookings/check-conflict', {
    method: 'POST',
    auth: true,
    token,
    body: payload,
  });
}
