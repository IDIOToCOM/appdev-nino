import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  USER_LOGIN,
  USER_LOGIN_COMPLETE,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  type AuthLoginPayload,
} from '../action';
import { userLogin as userLoginApi } from '../api/auth';

export function* userLoginAsync(action: { payload: AuthLoginPayload }): SagaIterator {
  try {
    yield put({ type: USER_LOGIN_REQUEST });
    const data: any = yield call(userLoginApi, action.payload);
    yield put({ type: USER_LOGIN_COMPLETE, payload: data });
  } catch (error: any) {
    yield put({
      type: USER_LOGIN_ERROR,
      error: error?.message || 'Login failed',
    });
  }
}

export function* userLogin(): SagaIterator {
  yield takeLatest(USER_LOGIN as any, userLoginAsync);
}

