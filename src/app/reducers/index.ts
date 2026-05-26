import { applyMiddleware, combineReducers, createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';

import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './auth';
import bookingsReducer from './bookings';
import catalogReducer from './catalog';
import carsReducer from './cars';
import customerPrefsReducer from './customerPrefs';
import healthReducer from './health';
import notificationsReducer from './notifications';
import registerReducer from './register';
import reviewsReducer from './reviews';

const sagaMiddleware = createSagaMiddleware();

const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['auth', 'cars', 'health', 'register', 'bookings', 'reviews', 'notifications'],
};

const customerPrefsPersistConfig = {
  key: 'customerPrefs',
  storage: AsyncStorage,
  blacklist: [],
};

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  // Only keep JWT session — never persist login errors (avoids stale "verify email" screen).
  whitelist: ['data'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  bookings: bookingsReducer,
  catalog: catalogReducer,
  cars: carsReducer,
  customerPrefs: persistReducer(
    customerPrefsPersistConfig,
    customerPrefsReducer,
  ),
  health: healthReducer,
  notifications: notificationsReducer,
  register: registerReducer,
  reviews: reviewsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export default () => {
  const store = createStore(persistedReducer, applyMiddleware(sagaMiddleware));
  const persistor = persistStore(store);
  const runSaga = sagaMiddleware.run;

  return { store, persistor, runSaga };
};
