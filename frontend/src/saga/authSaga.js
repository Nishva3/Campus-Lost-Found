import { call, put, takeLatest } from 'redux-saga/effects';
import { authAPI } from '../services/api';
import {
  loginRequest, loginSuccess, loginFailure,
  registerRequest, registerSuccess, registerFailure,
} from '../store/slices/authSlice';
import toast from 'react-hot-toast';

function* handleLogin(action) {
  try {
    const res = yield call(authAPI.login, action.payload);
    yield put(loginSuccess(res.data));
    toast.success(`Welcome back, ${res.data.user.name}! `);
  } catch (e) {
    const msg = e.response?.data?.error || 'Login failed';
    yield put(loginFailure(msg));
    toast.error(msg);
  }
}

function* handleRegister(action) {
  try {
    const res = yield call(authAPI.register, action.payload);
    yield put(registerSuccess(res.data));
    toast.success(`Welcome to Campus Lost & Found, ${res.data.user.name}! `);
  } catch (e) {
    const msg = e.response?.data?.error || 'Registration failed';
    yield put(registerFailure(msg));
    toast.error(msg);
  }
}

export function* watchAuth() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
}
