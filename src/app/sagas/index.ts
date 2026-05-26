import { all } from 'redux-saga/effects';
import { userLogin } from './auth';
import { watchBookings } from './bookings';
import { watchCars } from './cars';
import { watchFavorites } from './favorites';
import { watchHealth } from './health';
import { watchRegister } from './register';
import { watchNotifications } from './notifications';
import { watchReviews } from './reviews';

export default function* rootSaga() {
  yield all([
    userLogin(),
    watchRegister(),
    watchHealth(),
    watchCars(),
    watchBookings(),
    watchReviews(),
    watchFavorites(),
    watchNotifications(),
  ]);
}
