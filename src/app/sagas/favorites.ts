import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { Car } from '../api/cars';
import {
  SET_FAVORITES,
  SYNC_FAVORITES,
  TOGGLE_FAVORITE,
  USER_LOGIN_COMPLETE,
} from '../action';
import { fetchFavoriteCars, toggleFavorite } from '../api/favorites';
import type { RootState } from '../reducers';

function* getToken(): SagaIterator<string | null> {
  const auth: RootState['auth'] = yield select((s: RootState) => s.auth);
  return auth.data?.token ?? null;
}

function* carsForFavoriteIds(ids: number[]): SagaIterator<Car[]> {
  const list: Car[] = yield select((s: RootState) => s.cars.list);
  const stored: Car[] = yield select((s: RootState) => s.customerPrefs.favoriteCars);
  const byId = new Map<number, Car>();
  for (const car of [...stored, ...list]) {
    if (ids.includes(car.id)) {
      byId.set(car.id, car);
    }
  }
  return ids
    .map(id => byId.get(id))
    .filter((c): c is Car => c !== undefined);
}

/** Rebuild car snapshots from local ids; drop ids with no matching vehicle once fleet is loaded. */
function* refreshFavoriteCarsFromState(): SagaIterator {
  const ids: number[] = yield select((s: RootState) => s.customerPrefs.favoriteIds);
  let favoriteCars: Car[] = yield call(carsForFavoriteIds, ids);
  const list: Car[] = yield select((s: RootState) => s.cars.list);
  const isLoadingList: boolean = yield select(
    (s: RootState) => s.cars.isLoadingList,
  );

  let favoriteIds = ids;
  if (!isLoadingList && list.length > 0 && ids.length > 0) {
    const resolvedIds = favoriteCars.map(c => c.id);
    if (resolvedIds.length < ids.length) {
      favoriteIds = resolvedIds;
      favoriteCars = favoriteCars.filter(c => favoriteIds.includes(c.id));
    }
  }

  yield put({
    type: SET_FAVORITES,
    payload: { favoriteIds, favoriteCars },
  });
}

/** Pull favorites from server — only on login so local unsaves are not overwritten. */
export function* syncFavoritesFromServerAsync(): SagaIterator {
  try {
    const token: string | null = yield call(getToken);
    if (!token) {
      return;
    }
    const cars: Car[] | null = yield call(fetchFavoriteCars, token);
    if (cars !== null) {
      yield put({
        type: SET_FAVORITES,
        payload: {
          favoriteIds: cars.map(c => c.id),
          favoriteCars: cars,
        },
      });
      return;
    }
    yield call(refreshFavoriteCarsFromState);
  } catch (error: unknown) {
    if (__DEV__) {
      console.warn('Favorites sync skipped:', error);
    }
    yield call(refreshFavoriteCarsFromState);
  }
}

export function* syncFavoritesAsync(): SagaIterator {
  yield call(syncFavoritesFromServerAsync);
}

export function* toggleFavoriteAsync(action: {
  payload: { carId: number; car?: Car };
}): SagaIterator {
  const token: string | null = yield call(getToken);
  if (!token) {
    yield call(refreshFavoriteCarsFromState);
    return;
  }

  try {
    const result: Awaited<ReturnType<typeof toggleFavorite>> = yield call(
      toggleFavorite,
      token,
      action.payload.carId,
    );
    if (result?.favoriteIds) {
      const favoriteCars: Car[] = yield call(
        carsForFavoriteIds,
        result.favoriteIds,
      );
      yield put({
        type: SET_FAVORITES,
        payload: {
          favoriteIds: result.favoriteIds,
          favoriteCars,
        },
      });
      return;
    }
    yield call(syncFavoritesFromServerAsync);
  } catch (error: unknown) {
    if (__DEV__) {
      console.warn('Favorite toggle API failed, resyncing from server:', error);
    }
    yield call(syncFavoritesFromServerAsync);
  }
}

export function* watchFavorites(): SagaIterator {
  yield takeLatest(SYNC_FAVORITES as any, syncFavoritesAsync);
  yield takeLatest(USER_LOGIN_COMPLETE as any, syncFavoritesFromServerAsync);
  yield takeEvery(TOGGLE_FAVORITE as any, toggleFavoriteAsync);
}
