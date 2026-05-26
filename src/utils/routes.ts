const ROUTES = {
  LOGIN: 'Login',
  REGISTER: 'Register',
  WRONG: 'Wrong',

  CAR_LIST: 'CarList',
  CAR_DETAIL: 'CarDetail',
  BOOK: 'Book',
  MY_BOOKINGS: 'MyBookings',
  PROFILE: 'Profile',
  HELP: 'Help',
  SAVED: 'Saved',
  NOTIFICATIONS: 'Notifications',

  /** @deprecated Use CAR_LIST — kept for deep links */
  HOME: 'CarList',
} as const;

export default ROUTES;
