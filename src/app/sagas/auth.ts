import { call, put, takeEvery } from 'redux-saga/effects';
import { authLogin, authRegister } from '../api/auth';

import {
  USER_LOGIN,
  USER_LOGIN_COMPLETED,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_REGISTER,
  USER_REGISTER_COMPLETED,
  USER_REGISTER_ERROR,
  USER_REGISTER_REQUEST,
} from '../action';

export function* userLoginAsync(action: any): any {
  yield put({ type: USER_LOGIN_REQUEST });
  try {
    const response = yield call(authLogin, action.payload);
    yield put({ type: USER_LOGIN_COMPLETED, payload: response });
  } catch (error) {
    // log the full error so we can inspect network/server problems
    console.error('userLoginAsync failed', error);
    yield put({ type: USER_LOGIN_ERROR, payload: (error as Error).message });
  }
}

export function* userRegisterAsync(action: any): any {
  yield put({ type: USER_REGISTER_REQUEST });
  try {
    const response = yield call(authRegister, action.payload);
    yield put({ type: USER_REGISTER_COMPLETED, payload: response });
  } catch (error) {
    console.error('userRegisterAsync failed', error);
    yield put({ type: USER_REGISTER_ERROR, payload: (error as Error).message });
  }
}

export function* userLogin() {
  yield takeEvery(USER_LOGIN, userLoginAsync);
}

export function* userRegister() {
  yield takeEvery(USER_REGISTER, userRegisterAsync);
}
