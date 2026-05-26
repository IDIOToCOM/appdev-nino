import type { AppNotification } from '../api/notifications';
import {
  FETCH_NOTIFICATIONS_COMPLETE,
  FETCH_NOTIFICATIONS_ERROR,
  FETCH_NOTIFICATIONS_REQUEST,
  MARK_ALL_NOTIFICATIONS_READ_COMPLETE,
  MARK_NOTIFICATION_READ_COMPLETE,
  RESET_NOTIFICATIONS,
} from '../action';

export type NotificationsState = {
  list: AppNotification[];
  unreadCount: number;
  apiAvailable: boolean;
  isLoading: boolean;
  error: string | null;
};

const INITIAL: NotificationsState = {
  list: [],
  unreadCount: 0,
  apiAvailable: true,
  isLoading: false,
  error: null,
};

export default function reducer(
  state: NotificationsState = INITIAL,
  action: any,
): NotificationsState {
  switch (action.type) {
    case FETCH_NOTIFICATIONS_REQUEST:
      return { ...state, isLoading: true, error: null };

    case FETCH_NOTIFICATIONS_COMPLETE:
      return {
        ...state,
        isLoading: false,
        apiAvailable: action.payload !== null,
        list: action.payload?.notifications ?? [],
        unreadCount: action.payload?.unreadCount ?? 0,
        error: null,
      };

    case FETCH_NOTIFICATIONS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.error || 'Failed to load notifications',
      };

    case MARK_NOTIFICATION_READ_COMPLETE: {
      const id = action.payload?.id as number;
      const unread = action.payload?.unreadCount ?? state.unreadCount;
      return {
        ...state,
        unreadCount: unread,
        list: state.list.map(n =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
      };
    }

    case MARK_ALL_NOTIFICATIONS_READ_COMPLETE:
      return {
        ...state,
        unreadCount: 0,
        list: state.list.map(n => ({ ...n, isRead: true })),
      };

    case RESET_NOTIFICATIONS:
      return INITIAL;

    default:
      return state;
  }
}
