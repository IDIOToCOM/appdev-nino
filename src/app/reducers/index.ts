import { applyMiddleware, combineReducers, createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';

import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './auth';

const sagaMiddleware = createSagaMiddleware();

const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['auth'],
};

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: [],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
});

export type RootState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export default () => {
  const store = createStore(persistedReducer, applyMiddleware(sagaMiddleware));
  const persistor = persistStore(store);
  const runSaga = sagaMiddleware.run;

  return { store, persistor, runSaga };
};

