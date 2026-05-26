import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  FETCH_HEALTH,
  FETCH_HEALTH_COMPLETE,
  FETCH_HEALTH_ERROR,
  FETCH_HEALTH_REQUEST,
} from '../action';
import { fetchHealth as fetchHealthApi } from '../api/health';

export function* fetchHealthAsync(): SagaIterator {
  try {
    yield put({ type: FETCH_HEALTH_REQUEST });
    const data: Awaited<ReturnType<typeof fetchHealthApi>> = yield call(
      fetchHealthApi,
    );
    yield put({ type: FETCH_HEALTH_COMPLETE, payload: data });
  } catch (error: any) {
    yield put({
      type: FETCH_HEALTH_ERROR,
      error: error?.message || 'Unable to reach Uto Mobility. Try again shortly.',
    });
  }
}

export function* watchHealth(): SagaIterator {
  yield takeLatest(FETCH_HEALTH as any, fetchHealthAsync);
}
