import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  FETCH_CAR,
  FETCH_CAR_COMPLETE,
  FETCH_CAR_ERROR,
  FETCH_CAR_REQUEST,
  FETCH_CARS,
  FETCH_CARS_COMPLETE,
  FETCH_CARS_ERROR,
  FETCH_CARS_REQUEST,
} from '../action';
import { fetchCar as fetchCarApi, fetchCars as fetchCarsApi } from '../api/cars';
import { pickPopularCars } from '../../utils/popularCars';

export function* fetchCarsAsync(): SagaIterator {
  try {
    yield put({ type: FETCH_CARS_REQUEST });
    const result: Awaited<ReturnType<typeof fetchCarsApi>> = yield call(
      fetchCarsApi,
    );
    const popularCars =
      result.popularCars.length > 0
        ? result.popularCars
        : pickPopularCars(result.cars);
    yield put({
      type: FETCH_CARS_COMPLETE,
      payload: { cars: result.cars, popularCars },
    });
  } catch (error: any) {
    yield put({
      type: FETCH_CARS_ERROR,
      error: error?.message || 'Failed to load vehicles',
    });
  }
}

export function* fetchCarAsync(action: {
  payload: { carId: number | string };
}): SagaIterator {
  try {
    yield put({ type: FETCH_CAR_REQUEST });
    const car: Awaited<ReturnType<typeof fetchCarApi>> = yield call(
      fetchCarApi,
      action.payload.carId,
    );
    yield put({ type: FETCH_CAR_COMPLETE, payload: car });
  } catch (error: any) {
    yield put({
      type: FETCH_CAR_ERROR,
      error: error?.message || 'Failed to load vehicle',
    });
  }
}

export function* watchCars(): SagaIterator {
  yield takeLatest(FETCH_CARS as any, fetchCarsAsync);
  yield takeLatest(FETCH_CAR as any, fetchCarAsync);
}
