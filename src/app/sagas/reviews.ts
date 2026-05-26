import { call, put, select, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  FETCH_CAR_REVIEWS,
  FETCH_CAR_REVIEWS_COMPLETE,
  FETCH_CAR_REVIEWS_ERROR,
  FETCH_CAR_REVIEWS_REQUEST,
  SUBMIT_CAR_REVIEW,
  SUBMIT_CAR_REVIEW_COMPLETE,
  SUBMIT_CAR_REVIEW_ERROR,
  SUBMIT_CAR_REVIEW_REQUEST,
} from '../action';
import { fetchCarReviews, submitCarReview } from '../api/reviews';
import type { RootState } from '../reducers';

export function* fetchCarReviewsAsync(action: {
  payload: { carId: number };
}): SagaIterator {
  try {
    yield put({ type: FETCH_CAR_REVIEWS_REQUEST });
    const auth: RootState['auth'] = yield select((s: RootState) => s.auth);
    const token = auth.data?.token ?? null;
    const data = yield call(fetchCarReviews, token, action.payload.carId);
    yield put({ type: FETCH_CAR_REVIEWS_COMPLETE, payload: data });
  } catch (error: any) {
    yield put({
      type: FETCH_CAR_REVIEWS_ERROR,
      error: error?.message || 'Failed to load reviews',
    });
  }
}

export function* submitCarReviewAsync(action: {
  payload: { carId: number; rating: number; comment?: string };
}): SagaIterator {
  try {
    yield put({ type: SUBMIT_CAR_REVIEW_REQUEST });
    const auth: RootState['auth'] = yield select((s: RootState) => s.auth);
    const token = auth.data?.token;
    if (!token) {
      throw new Error('Sign in to submit a review');
    }
    yield call(submitCarReview, token, action.payload.carId, {
      rating: action.payload.rating,
      comment: action.payload.comment,
    });
    const data = yield call(fetchCarReviews, token, action.payload.carId);
    yield put({ type: SUBMIT_CAR_REVIEW_COMPLETE, payload: data });
  } catch (error: any) {
    yield put({
      type: SUBMIT_CAR_REVIEW_ERROR,
      error: error?.message || 'Review submission failed',
    });
  }
}

export function* watchReviews(): SagaIterator {
  yield takeLatest(FETCH_CAR_REVIEWS as any, fetchCarReviewsAsync);
  yield takeLatest(SUBMIT_CAR_REVIEW as any, submitCarReviewAsync);
}
