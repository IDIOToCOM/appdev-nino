import type { Car } from './api/cars';

export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGIN_GOOGLE = 'USER_LOGIN_GOOGLE';
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST' as const;
export const USER_LOGIN_COMPLETE = 'USER_LOGIN_COMPLETE' as const;
export const USER_LOGIN_ERROR = 'USER_LOGIN_ERROR' as const;
export const RESET_USER_LOGIN = 'RESET_USER_LOGIN' as const;
export const CLEAR_AUTH_ERROR = 'CLEAR_AUTH_ERROR' as const;

export const USER_REGISTER = 'USER_REGISTER';
export const USER_REGISTER_REQUEST = 'USER_REGISTER_REQUEST' as const;
export const USER_REGISTER_COMPLETE = 'USER_REGISTER_COMPLETE' as const;
export const USER_REGISTER_ERROR = 'USER_REGISTER_ERROR' as const;

export const FETCH_HEALTH = 'FETCH_HEALTH';
export const FETCH_HEALTH_REQUEST = 'FETCH_HEALTH_REQUEST' as const;
export const FETCH_HEALTH_COMPLETE = 'FETCH_HEALTH_COMPLETE' as const;
export const FETCH_HEALTH_ERROR = 'FETCH_HEALTH_ERROR' as const;

export const FETCH_CARS = 'FETCH_CARS';
export const FETCH_CARS_REQUEST = 'FETCH_CARS_REQUEST' as const;
export const FETCH_CARS_COMPLETE = 'FETCH_CARS_COMPLETE' as const;
export const FETCH_CARS_ERROR = 'FETCH_CARS_ERROR' as const;

export const FETCH_CAR = 'FETCH_CAR';
export const FETCH_CAR_REQUEST = 'FETCH_CAR_REQUEST' as const;
export const FETCH_CAR_COMPLETE = 'FETCH_CAR_COMPLETE' as const;
export const FETCH_CAR_ERROR = 'FETCH_CAR_ERROR' as const;
export const CLEAR_CAR_DETAIL = 'CLEAR_CAR_DETAIL' as const;

export type AuthLoginPayload = {
  username: string;
  password: string;
};

export type AuthRegisterPayload = {
  username: string;
  password: string;
};

export const authLogin = (payload: AuthLoginPayload) => ({
  type: USER_LOGIN,
  payload,
});

export const authLoginGoogle = (idToken: string) => ({
  type: USER_LOGIN_GOOGLE,
  payload: { idToken },
});

export const authLogout = () => ({
  type: RESET_USER_LOGIN,
});

export const clearAuthError = () => ({
  type: CLEAR_AUTH_ERROR,
});

export const authRegister = (payload: AuthRegisterPayload) => ({
  type: USER_REGISTER,
  payload,
});

export const fetchHealth = () => ({
  type: FETCH_HEALTH,
});

export const fetchCars = () => ({
  type: FETCH_CARS,
});

export const fetchCar = (carId: number | string) => ({
  type: FETCH_CAR,
  payload: { carId },
});

export const clearCarDetail = () => ({
  type: CLEAR_CAR_DETAIL,
});

export const FETCH_BOOKINGS = 'FETCH_BOOKINGS';
export const FETCH_BOOKINGS_REQUEST = 'FETCH_BOOKINGS_REQUEST' as const;
export const FETCH_BOOKINGS_COMPLETE = 'FETCH_BOOKINGS_COMPLETE' as const;
export const FETCH_BOOKINGS_ERROR = 'FETCH_BOOKINGS_ERROR' as const;
export const BOOKING_STATUS_CHANGED = 'BOOKING_STATUS_CHANGED' as const;

export const CREATE_BOOKING = 'CREATE_BOOKING';
export const CREATE_BOOKING_REQUEST = 'CREATE_BOOKING_REQUEST' as const;
export const CREATE_BOOKING_COMPLETE = 'CREATE_BOOKING_COMPLETE' as const;
export const CREATE_BOOKING_ERROR = 'CREATE_BOOKING_ERROR' as const;
export const RESET_CREATE_BOOKING = 'RESET_CREATE_BOOKING' as const;

export type CreateBookingActionPayload = {
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

export const fetchBookings = () => ({
  type: FETCH_BOOKINGS,
});

export const createBooking = (payload: CreateBookingActionPayload) => ({
  type: CREATE_BOOKING,
  payload,
});

export const resetCreateBooking = () => ({
  type: RESET_CREATE_BOOKING,
});

export const SET_CATALOG_RENTAL_WINDOW = 'SET_CATALOG_RENTAL_WINDOW' as const;
export const CLEAR_CATALOG_RENTAL_WINDOW = 'CLEAR_CATALOG_RENTAL_WINDOW' as const;

export type CatalogRentalWindowPayload = {
  pickupDate?: string;
  returnDate?: string;
  pickupTime?: string;
  returnTime?: string;
};

export const setCatalogRentalWindow = (payload: CatalogRentalWindowPayload) => ({
  type: SET_CATALOG_RENTAL_WINDOW,
  payload,
});

export const clearCatalogRentalWindow = () => ({
  type: CLEAR_CATALOG_RENTAL_WINDOW,
});

export const FETCH_CAR_REVIEWS = 'FETCH_CAR_REVIEWS';
export const FETCH_CAR_REVIEWS_REQUEST = 'FETCH_CAR_REVIEWS_REQUEST' as const;
export const FETCH_CAR_REVIEWS_COMPLETE = 'FETCH_CAR_REVIEWS_COMPLETE' as const;
export const FETCH_CAR_REVIEWS_ERROR = 'FETCH_CAR_REVIEWS_ERROR' as const;
export const SUBMIT_CAR_REVIEW = 'SUBMIT_CAR_REVIEW';
export const SUBMIT_CAR_REVIEW_REQUEST = 'SUBMIT_CAR_REVIEW_REQUEST' as const;
export const SUBMIT_CAR_REVIEW_COMPLETE = 'SUBMIT_CAR_REVIEW_COMPLETE' as const;
export const SUBMIT_CAR_REVIEW_ERROR = 'SUBMIT_CAR_REVIEW_ERROR' as const;
export const CLEAR_CAR_REVIEWS = 'CLEAR_CAR_REVIEWS' as const;

export const fetchCarReviews = (carId: number) => ({
  type: FETCH_CAR_REVIEWS,
  payload: { carId },
});

export const submitCarReview = (payload: {
  carId: number;
  rating: number;
  comment?: string;
}) => ({
  type: SUBMIT_CAR_REVIEW,
  payload,
});

export const clearCarReviews = () => ({
  type: CLEAR_CAR_REVIEWS,
});

export const CANCEL_BOOKING = 'CANCEL_BOOKING';
export const CANCEL_BOOKING_REQUEST = 'CANCEL_BOOKING_REQUEST' as const;
export const CANCEL_BOOKING_COMPLETE = 'CANCEL_BOOKING_COMPLETE' as const;
export const CANCEL_BOOKING_ERROR = 'CANCEL_BOOKING_ERROR' as const;

export const cancelBooking = (bookingId: number) => ({
  type: CANCEL_BOOKING,
  payload: { bookingId },
});

export const PAY_BOOKING = 'PAY_BOOKING';
export const PAY_BOOKING_REQUEST = 'PAY_BOOKING_REQUEST' as const;
export const PAY_BOOKING_COMPLETE = 'PAY_BOOKING_COMPLETE' as const;
export const PAY_BOOKING_ERROR = 'PAY_BOOKING_ERROR' as const;

export const payBooking = (bookingId: number, amount?: number) => ({
  type: PAY_BOOKING,
  payload: { bookingId, amount },
});

export const TOGGLE_FAVORITE = 'TOGGLE_FAVORITE';
export const SET_FAVORITE_IDS = 'SET_FAVORITE_IDS' as const;
export const SET_FAVORITES = 'SET_FAVORITES' as const;
export const SYNC_FAVORITES = 'SYNC_FAVORITES';

export const toggleFavorite = (carId: number, car?: Car) => ({
  type: TOGGLE_FAVORITE,
  payload: { carId, car },
});

export const syncFavorites = () => ({
  type: SYNC_FAVORITES,
});

export const FETCH_NOTIFICATIONS = 'FETCH_NOTIFICATIONS';
export const FETCH_NOTIFICATIONS_REQUEST = 'FETCH_NOTIFICATIONS_REQUEST' as const;
export const FETCH_NOTIFICATIONS_COMPLETE = 'FETCH_NOTIFICATIONS_COMPLETE' as const;
export const FETCH_NOTIFICATIONS_ERROR = 'FETCH_NOTIFICATIONS_ERROR' as const;
export const MARK_NOTIFICATION_READ = 'MARK_NOTIFICATION_READ';
export const MARK_NOTIFICATION_READ_COMPLETE = 'MARK_NOTIFICATION_READ_COMPLETE' as const;
export const MARK_ALL_NOTIFICATIONS_READ = 'MARK_ALL_NOTIFICATIONS_READ';
export const MARK_ALL_NOTIFICATIONS_READ_COMPLETE =
  'MARK_ALL_NOTIFICATIONS_READ_COMPLETE' as const;
export const RESET_NOTIFICATIONS = 'RESET_NOTIFICATIONS' as const;

export const fetchNotifications = (options?: { skipTray?: boolean }) => ({
  type: FETCH_NOTIFICATIONS,
  meta: { skipTray: Boolean(options?.skipTray) },
});

export const markNotificationRead = (id: number) => ({
  type: MARK_NOTIFICATION_READ,
  payload: { id },
});

export const markAllNotificationsRead = () => ({
  type: MARK_ALL_NOTIFICATIONS_READ,
});
