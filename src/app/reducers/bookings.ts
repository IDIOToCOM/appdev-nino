import type { Booking } from '../api/bookings';
import {
  CANCEL_BOOKING_COMPLETE,
  CANCEL_BOOKING_ERROR,
  CANCEL_BOOKING_REQUEST,
  PAY_BOOKING_COMPLETE,
  PAY_BOOKING_ERROR,
  PAY_BOOKING_REQUEST,
  CREATE_BOOKING_COMPLETE,
  CREATE_BOOKING_ERROR,
  CREATE_BOOKING_REQUEST,
  FETCH_BOOKINGS_COMPLETE,
  FETCH_BOOKINGS_ERROR,
  FETCH_BOOKINGS_REQUEST,
  RESET_CREATE_BOOKING,
} from '../action';

export type BookingsState = {
  list: Booking[];
  isLoadingList: boolean;
  isCreating: boolean;
  isCancelling: boolean;
  isPaying: boolean;
  createSuccess: boolean;
  isError: boolean;
  error: string | null;
  cancelError: string | null;
  payError: string | null;
  lastCancelMessage: string | null;
  lastPayMessage: string | null;
  fieldErrors: Record<string, string>;
};

const INITIAL: BookingsState = {
  list: [],
  isLoadingList: false,
  isCreating: false,
  isCancelling: false,
  isPaying: false,
  createSuccess: false,
  isError: false,
  error: null,
  cancelError: null,
  payError: null,
  lastCancelMessage: null,
  lastPayMessage: null,
  fieldErrors: {},
};

export default function reducer(
  state: BookingsState = INITIAL,
  action: any,
): BookingsState {
  switch (action.type) {
    case FETCH_BOOKINGS_REQUEST:
      return {
        ...state,
        isLoadingList: true,
        isError: false,
        error: null,
      };

    case FETCH_BOOKINGS_COMPLETE:
      return {
        ...state,
        list: action.payload ?? [],
        isLoadingList: false,
        isError: false,
        error: null,
      };

    case FETCH_BOOKINGS_ERROR:
      return {
        ...state,
        isLoadingList: false,
        isError: true,
        error: action.error || 'Failed to load bookings',
      };

    case CREATE_BOOKING_REQUEST:
      return {
        ...state,
        isCreating: true,
        createSuccess: false,
        isError: false,
        error: null,
        fieldErrors: {},
      };

    case CREATE_BOOKING_COMPLETE:
      return {
        ...state,
        isCreating: false,
        createSuccess: true,
        isError: false,
        error: null,
        fieldErrors: {},
      };

    case CREATE_BOOKING_ERROR:
      return {
        ...state,
        isCreating: false,
        createSuccess: false,
        isError: true,
        error: action.error || 'Booking failed',
        fieldErrors: action.fieldErrors ?? {},
      };

    case RESET_CREATE_BOOKING:
      return {
        ...state,
        isCreating: false,
        createSuccess: false,
        isError: false,
        error: null,
        fieldErrors: {},
      };

    case CANCEL_BOOKING_REQUEST:
      return { ...state, isCancelling: true, cancelError: null, lastCancelMessage: null };

    case CANCEL_BOOKING_COMPLETE: {
      const updated = action.payload as Booking;
      return {
        ...state,
        isCancelling: false,
        cancelError: null,
        lastCancelMessage: action.message ?? null,
        list: state.list.map(b => (b.id === updated.id ? { ...b, ...updated } : b)),
      };
    }

    case CANCEL_BOOKING_ERROR:
      return {
        ...state,
        isCancelling: false,
        cancelError: action.error || 'Cancel failed',
      };

    case PAY_BOOKING_REQUEST:
      return { ...state, isPaying: true, payError: null, lastPayMessage: null };

    case PAY_BOOKING_COMPLETE: {
      const updated = action.payload.booking as Booking;
      return {
        ...state,
        isPaying: false,
        payError: null,
        lastPayMessage: action.payload.message ?? null,
        list: state.list.map(b => (b.id === updated.id ? { ...b, ...updated } : b)),
      };
    }

    case PAY_BOOKING_ERROR:
      return {
        ...state,
        isPaying: false,
        payError: action.error || 'Payment failed',
      };

    default:
      return state;
  }
}
