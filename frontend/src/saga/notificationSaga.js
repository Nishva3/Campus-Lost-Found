import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import { notifAPI } from '../services/api';
import {
  fetchNotificationsRequest, fetchNotificationsSuccess,
  fetchNotificationsFailure, markReadSuccess
} from '../store/slices/notificationSlice';

function* handleFetchNotifications(action) {
  try {
    const res = action.payload
      ? yield call(notifAPI.getByUser, action.payload)
      : yield call(notifAPI.getAll);
    yield put(fetchNotificationsSuccess(Array.isArray(res.data) ? res.data : []));
  } catch (e) {
    yield put(fetchNotificationsFailure());
  }
}

function* handleMarkRead(action) {
  try {
    yield call(notifAPI.markRead, action.payload);
    yield put(markReadSuccess(action.payload));
  } catch (e) {}
}

export function* watchNotifications() {
  yield takeLatest(fetchNotificationsRequest.type, handleFetchNotifications);
  yield takeEvery('notifications/markReadRequest', handleMarkRead);
}