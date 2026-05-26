import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  USER_REGISTER,
  USER_REGISTER_COMPLETE,
  USER_REGISTER_ERROR,
  USER_REGISTER_REQUEST,
  type AuthRegisterPayload,
} from '../action';
import { userLogin as userLoginApi, userRegister as userRegisterApi } from '../api/auth';
import {
  USER_LOGIN_COMPLETE,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
} from '../action';

export function* userRegisterAsync(action: {
  payload: AuthRegisterPayload;
}): SagaIterator {
  try {
    yield put({ type: USER_REGISTER_REQUEST });
    yield call(userRegisterApi, action.payload);
    yield put({ type: USER_REGISTER_COMPLETE });

    yield put({ type: USER_LOGIN_REQUEST });
    const session: Awaited<ReturnType<typeof userLoginApi>> = yield call(
      userLoginApi,
      {
        username: action.payload.username,
        password: action.payload.password,
      },
    );
    yield put({ type: USER_LOGIN_COMPLETE, payload: session });
  } catch (error: any) {
    const message = error?.message || 'Registration failed';
    yield put({
      type: USER_REGISTER_ERROR,
      error: message,
    });
  }
}

export function* watchRegister(): SagaIterator {
  yield takeLatest(USER_REGISTER as any, userRegisterAsync);
}
