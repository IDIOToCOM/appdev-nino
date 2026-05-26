import { call, put, select, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import {
  RESET_USER_LOGIN,
  USER_LOGIN,
  USER_LOGIN_GOOGLE,
  USER_LOGIN_COMPLETE,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  type AuthLoginPayload,
} from '../action';
import { userLogin as userLoginApi } from '../api/auth';
import type { RootState } from '../reducers';
import { signInWithGoogleCredential, signOutFirebase } from '../../services/firebaseAuth';
import { clearPushTokenFromServer } from '../../services/pushNotifications';

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

export function* userLoginGoogleAsync(action: {
  payload: { idToken: string };
}): SagaIterator {
  try {
    yield put({ type: USER_LOGIN_REQUEST });
    const data: Awaited<ReturnType<typeof signInWithGoogleCredential>> = yield call(
      signInWithGoogleCredential,
      action.payload.idToken,
    );
    yield put({ type: USER_LOGIN_COMPLETE, payload: data });
  } catch (error: any) {
    yield put({
      type: USER_LOGIN_ERROR,
      error: error?.message || 'Google sign-in failed',
    });
  }
}

export function* userLogoutAsync(): SagaIterator {
  const authToken: string | null = yield select(
    (s: RootState) => s.auth.data?.token ?? null,
  );
  if (authToken) {
    yield call(clearPushTokenFromServer, authToken);
  }
  yield call(signOutFirebase);
}

export function* userLogin(): SagaIterator {
  yield takeLatest(USER_LOGIN as any, userLoginAsync);
  yield takeLatest(USER_LOGIN_GOOGLE as any, userLoginGoogleAsync);
  yield takeLatest(RESET_USER_LOGIN as any, userLogoutAsync);
}
