import { call, fork, put, select, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  BOOKING_STATUS_CHANGED,
  CANCEL_BOOKING_COMPLETE,
  CREATE_BOOKING_COMPLETE,
  FETCH_NOTIFICATIONS,
  FETCH_NOTIFICATIONS_COMPLETE,
  FETCH_NOTIFICATIONS_ERROR,
  FETCH_NOTIFICATIONS_REQUEST,
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_ALL_NOTIFICATIONS_READ_COMPLETE,
  MARK_NOTIFICATION_READ,
  MARK_NOTIFICATION_READ_COMPLETE,
  PAY_BOOKING_COMPLETE,
  RESET_NOTIFICATIONS,
  RESET_USER_LOGIN,
  USER_LOGIN_COMPLETE,
} from '../action';
import {
  fetchNotifications as fetchNotificationsApi,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../api/notifications';
import type { Booking } from '../api/bookings';
import type { RootState } from '../reducers';
import { displayLocalNotification } from '../../services/notificationDisplay';

function* getToken(): SagaIterator<string | null> {
  const auth: RootState['auth'] = yield select((s: RootState) => s.auth);
  return auth.data?.token ?? null;
}

/** IDs seen this session; first fetch after login is baseline only (no tray spam). */
let knownNotificationIds = new Set<number>();
let notificationBaselineReady = false;

function resetNotificationTracking(): void {
  knownNotificationIds = new Set();
  notificationBaselineReady = false;
}

/** Skip tray for events the user just performed in-app (book / pay / cancel). */
const SKIP_TRAY_SERVER_TYPES = new Set([
  'booking_created',
  'booking_submitted',
  'booking_pending',
]);

function pickNewestUnreadFromServer(
  notifications: AppNotification[],
): AppNotification | null {
  const fresh = notifications.filter(
    n => !knownNotificationIds.has(n.id) && !n.isRead,
  );
  if (fresh.length === 0) {
    return null;
  }

  return fresh.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

function* maybeShowTrayForServerNotifications(
  notifications: AppNotification[],
  options: { skipTray?: boolean },
): SagaIterator {
  if (options.skipTray) {
    notifications.forEach(n => knownNotificationIds.add(n.id));
    return;
  }

  if (!notificationBaselineReady) {
    notifications.forEach(n => knownNotificationIds.add(n.id));
    notificationBaselineReady = true;
    return;
  }

  const newest = pickNewestUnreadFromServer(notifications);
  notifications.forEach(n => knownNotificationIds.add(n.id));

  if (!newest || SKIP_TRAY_SERVER_TYPES.has(newest.type.toLowerCase())) {
    return;
  }

  yield fork(function* showServerTray() {
    yield call(displayLocalNotification, {
      title: newest.title,
      body: newest.body,
      data: {
        type: newest.type,
        notificationId: String(newest.id),
        ...(newest.bookingId != null
          ? { bookingId: String(newest.bookingId) }
          : {}),
      },
    });
  });
}

export function* fetchNotificationsAsync(
  action?: { meta?: { skipTray?: boolean } },
): SagaIterator {
  const skipTray = action?.meta?.skipTray === true;

  try {
    yield put({ type: FETCH_NOTIFICATIONS_REQUEST });
    const token: string | null = yield call(getToken);
    if (!token) {
      yield put({ type: FETCH_NOTIFICATIONS_COMPLETE, payload: null });
      return;
    }

    const data = yield call(fetchNotificationsApi, token);

    if (data?.notifications?.length) {
      yield call(maybeShowTrayForServerNotifications, data.notifications, {
        skipTray,
      });
    } else if (data?.notifications) {
      yield call(maybeShowTrayForServerNotifications, data.notifications, {
        skipTray,
      });
    }

    yield put({ type: FETCH_NOTIFICATIONS_COMPLETE, payload: data });
  } catch (error: any) {
    yield put({
      type: FETCH_NOTIFICATIONS_ERROR,
      error: error?.message || 'Failed to load notifications',
    });
  }
}

function* refreshNotificationsQuietly(): SagaIterator {
  yield call(fetchNotificationsAsync, { meta: { skipTray: true } });
}

function bookingStatusLabel(booking: Booking): string {
  const status = (booking.status || '').toLowerCase();
  const paymentStatus = (booking.paymentStatus || '').toLowerCase();

  if (status === 'refunded' || paymentStatus === 'refunded') {
    return 'refunded';
  }
  if (status === 'cancelled') {
    return 'cancelled';
  }
  if (status === 'confirmed') {
    return 'confirmed';
  }
  return status || paymentStatus || 'updated';
}

function bookingTrayForStatusChange(booking: Booking): {
  title: string;
  body: string;
  type: string;
} | null {
  const label = bookingStatusLabel(booking);
  switch (label) {
    case 'confirmed':
      return {
        title: 'Booking confirmed',
        body: `Booking #${booking.id} has been confirmed.`,
        type: 'booking_confirmed',
      };
    case 'cancelled':
      return {
        title: 'Booking cancelled',
        body: `Booking #${booking.id} has been cancelled.`,
        type: 'booking_cancelled',
      };
    case 'refunded':
      return {
        title: 'Booking refunded',
        body: `Booking #${booking.id} has been refunded.`,
        type: 'booking_refunded',
      };
    default:
      return null;
  }
}

function* showBookingStatusChangedTray(action: {
  payload?: { booking?: Booking };
}): SagaIterator {
  const booking = action.payload?.booking;
  if (!booking) {
    return;
  }

  const tray = bookingTrayForStatusChange(booking);
  if (!tray) {
    return;
  }

  yield fork(function* showBookingStatusTray() {
    yield call(displayLocalNotification, {
      title: tray.title,
      body: tray.body,
      data: {
        type: tray.type,
        bookingId: String(booking.id),
      },
    });
  });
}

function* showCancellationTray(action: {
  payload: Booking;
  message?: string;
}): SagaIterator {
  const booking = action.payload;
  const body =
    action.message || `Booking #${booking.id} has been cancelled.`;

  yield fork(function* postCancelTray() {
    yield call(displayLocalNotification, {
      title: 'Booking cancelled',
      body,
      data: {
        type: 'booking_cancelled',
        bookingId: String(booking.id),
      },
    });
  });

  yield call(refreshNotificationsQuietly);
}

export function* markReadAsync(action: { payload: { id: number } }): SagaIterator {
  const token: string | null = yield call(getToken);
  if (!token) {
    return;
  }
  const result = yield call(markNotificationRead, token, action.payload.id);
  if (result) {
    yield put({
      type: MARK_NOTIFICATION_READ_COMPLETE,
      payload: { id: action.payload.id, unreadCount: result.unreadCount },
    });
  }
}

export function* markAllReadAsync(): SagaIterator {
  const token: string | null = yield call(getToken);
  if (!token) {
    return;
  }
  const result = yield call(markAllNotificationsRead, token);
  if (result) {
    yield put({ type: MARK_ALL_NOTIFICATIONS_READ_COMPLETE });
  }
}

export function* watchNotifications(): SagaIterator {
  yield takeLatest(FETCH_NOTIFICATIONS as any, fetchNotificationsAsync);
  yield takeLatest(MARK_NOTIFICATION_READ as any, markReadAsync);
  yield takeLatest(MARK_ALL_NOTIFICATIONS_READ as any, markAllReadAsync);
  yield takeLatest(USER_LOGIN_COMPLETE as any, fetchNotificationsAsync);
  yield takeLatest(BOOKING_STATUS_CHANGED as any, showBookingStatusChangedTray);
  yield takeLatest(CREATE_BOOKING_COMPLETE as any, refreshNotificationsQuietly);
  yield takeLatest(PAY_BOOKING_COMPLETE as any, refreshNotificationsQuietly);
  yield takeLatest(CANCEL_BOOKING_COMPLETE as any, showCancellationTray);
  yield takeLatest(RESET_USER_LOGIN as any, function* resetNotifs() {
    resetNotificationTracking();
    yield put({ type: RESET_NOTIFICATIONS });
  });
}
