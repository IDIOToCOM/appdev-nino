import { call, put, select, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  BOOKING_STATUS_CHANGED,
  CANCEL_BOOKING,
  CANCEL_BOOKING_COMPLETE,
  CANCEL_BOOKING_ERROR,
  CANCEL_BOOKING_REQUEST,
  PAY_BOOKING,
  PAY_BOOKING_COMPLETE,
  PAY_BOOKING_ERROR,
  PAY_BOOKING_REQUEST,
  CREATE_BOOKING,
  CREATE_BOOKING_COMPLETE,
  CREATE_BOOKING_ERROR,
  CREATE_BOOKING_REQUEST,
  FETCH_BOOKINGS,
  FETCH_BOOKINGS_COMPLETE,
  FETCH_BOOKINGS_ERROR,
  FETCH_BOOKINGS_REQUEST,
  type CreateBookingActionPayload,
} from '../action';
import {
  type Booking,
  checkBookingConflict,
  createBooking as createBookingApi,
  fetchMyBookingsWithFallback,
  payBooking as payBookingApi,
  cancelBooking as cancelBookingApi,
} from '../api/bookings';
import { MobileApiRequestError } from '../api/errors';
import type { RootState } from '../reducers';

function* getAuth(): SagaIterator<{ token: string; username: string } | null> {
  const auth: RootState['auth'] = yield select((s: RootState) => s.auth);
  if (!auth.data?.token || !auth.data.username) {
    return null;
  }
  return { token: auth.data.token, username: auth.data.username };
}

function bookingSnapshot(booking: Booking): string {
  return [
    (booking.status || '').toLowerCase(),
    (booking.paymentStatus || '').toLowerCase(),
  ].join('|');
}

function* emitStatusChanges(nextList: Booking[]): SagaIterator {
  const previousList: Booking[] = yield select(
    (s: RootState) => s.bookings.list,
  );
  const previousById = new Map(
    previousList.map(booking => [String(booking.id), booking]),
  );

  for (const next of nextList) {
    const previous = previousById.get(String(next.id));
    if (!previous) {
      continue;
    }

    const before = bookingSnapshot(previous);
    const after = bookingSnapshot(next);
    if (before !== after) {
      yield put({
        type: BOOKING_STATUS_CHANGED,
        payload: { previous, booking: next },
      });
    }
  }
}

export function* fetchBookingsAsync(): SagaIterator {
  try {
    yield put({ type: FETCH_BOOKINGS_REQUEST });
    const credentials: { token: string; username: string } | null =
      yield call(getAuth);
    if (!credentials) {
      throw new Error('Not signed in');
    }
    const list = yield call(
      fetchMyBookingsWithFallback,
      credentials.token,
      credentials.username,
    );
    yield call(emitStatusChanges, list);
    yield put({ type: FETCH_BOOKINGS_COMPLETE, payload: list });
  } catch (error: any) {
    yield put({
      type: FETCH_BOOKINGS_ERROR,
      error: error?.message || 'Failed to load bookings',
    });
  }
}

export function* createBookingAsync(action: {
  payload: CreateBookingActionPayload;
}): SagaIterator {
  try {
    yield put({ type: CREATE_BOOKING_REQUEST });
    const credentials: { token: string; username: string } | null =
      yield call(getAuth);
    if (!credentials) {
      throw new Error('Not signed in');
    }

    const conflict: Awaited<ReturnType<typeof checkBookingConflict>> = yield call(
      checkBookingConflict,
      credentials.token,
      action.payload,
    );
    if (conflict.hasConflict) {
      throw new Error(
        conflict.message ||
          'This vehicle is not available for the selected dates and times.',
      );
    }

    const booking: Awaited<ReturnType<typeof createBookingApi>> = yield call(
      createBookingApi,
      credentials.token,
      action.payload,
    );
    yield put({ type: CREATE_BOOKING_COMPLETE, payload: booking });
    yield put({ type: FETCH_BOOKINGS });
  } catch (error: unknown) {
    const fieldErrors =
      error instanceof MobileApiRequestError ? error.fieldErrors : {};
    const message =
      error instanceof Error ? error.message : 'Booking failed';
    yield put({
      type: CREATE_BOOKING_ERROR,
      error: message,
      fieldErrors,
    });
  }
}

export function* cancelBookingAsync(action: {
  payload: { bookingId: number };
}): SagaIterator {
  try {
    yield put({ type: CANCEL_BOOKING_REQUEST });
    const credentials: { token: string; username: string } | null =
      yield call(getAuth);
    if (!credentials) {
      throw new Error('Not signed in');
    }
    const result: Awaited<ReturnType<typeof cancelBookingApi>> = yield call(
      cancelBookingApi,
      credentials.token,
      action.payload.bookingId,
    );
    yield put({
      type: CANCEL_BOOKING_COMPLETE,
      payload: result.booking,
      message: result.message,
    });
  } catch (error: unknown) {
    let message = 'Cancel failed';
    if (error instanceof MobileApiRequestError) {
      message = error.message;
      if (error.code === 'BOOKING_NOT_FOUND') {
        message =
          'This booking was not found for your account. Pull to refresh My bookings, then try again.';
      }
    } else if (error instanceof Error) {
      message = error.message;
    }
    yield put({
      type: CANCEL_BOOKING_ERROR,
      error: message,
    });
  }
}

export function* payBookingAsync(action: {
  payload: { bookingId: number; amount?: number };
}): SagaIterator {
  try {
    yield put({ type: PAY_BOOKING_REQUEST });
    const credentials: { token: string; username: string } | null =
      yield call(getAuth);
    if (!credentials) {
      throw new Error('Not signed in');
    }
    const result: Awaited<ReturnType<typeof payBookingApi>> = yield call(
      payBookingApi,
      credentials.token,
      action.payload.bookingId,
      action.payload.amount,
    );
    yield put({
      type: PAY_BOOKING_COMPLETE,
      payload: {
        booking: result.booking,
        message: result.message,
      },
    });
  } catch (error: any) {
    yield put({
      type: PAY_BOOKING_ERROR,
      error: error?.message || 'Payment failed',
    });
  }
}

export function* watchBookings(): SagaIterator {
  yield takeLatest(FETCH_BOOKINGS as any, fetchBookingsAsync);
  yield takeLatest(CREATE_BOOKING as any, createBookingAsync);
  yield takeLatest(CANCEL_BOOKING as any, cancelBookingAsync);
  yield takeLatest(PAY_BOOKING as any, payBookingAsync);
}
