import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import { itemAPI } from '../services/api';
import {
  fetchItemsRequest, fetchItemsSuccess, fetchItemsFailure,
  fetchMyItemsRequest, fetchMyItemsSuccess, fetchMyItemsFailure,
  fetchItemRequest, fetchItemSuccess, fetchItemFailure,
  createItemRequest, createItemSuccess, createItemFailure,
  updateItemRequest, updateItemSuccess, updateItemFailure,
  deleteItemRequest, deleteItemSuccess, deleteItemFailure,
  fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure,
} from '../store/slices/itemSlice';
import toast from 'react-hot-toast';

function* handleFetchItems(action) {
  try {
    const res = yield call(itemAPI.getAll, action.payload || {});
    yield put(fetchItemsSuccess(res.data));
  } catch (e) {
    yield put(fetchItemsFailure(e.response?.data?.error || 'Failed to fetch items'));
  }
}

function* handleFetchMyItems() {
  try {
    const res = yield call(itemAPI.getMyItems);
    yield put(fetchMyItemsSuccess(Array.isArray(res.data) ? res.data : []));
  } catch (e) {
    yield put(fetchMyItemsFailure(e.response?.data?.error || 'Failed'));
  }
}

function* handleFetchItem(action) {
  try {
    const res = yield call(itemAPI.getOne, action.payload);
    yield put(fetchItemSuccess(res.data));
  } catch (e) {
    yield put(fetchItemFailure(e.response?.data?.error || 'Not found'));
  }
}

function* handleCreateItem(action) {
  try {
    const res = yield call(itemAPI.create, action.payload);
    yield put(createItemSuccess(res.data));
    // Refresh items list so new item appears immediately
    yield put(fetchItemsRequest({ status: 'active' }));
    toast.success('Item reported! It is now visible in Browse. ');
  } catch (e) {
    const msg = e.response?.data?.error || 'Failed to create item';
    yield put(createItemFailure(msg));
    toast.error(msg);
  }
}

function* handleUpdateItem(action) {
  try {
    const { id, data } = action.payload;
    const res = yield call(itemAPI.update, id, data);
    yield put(updateItemSuccess(res.data));
    yield put(fetchItemsRequest({ status: 'active' }));
    toast.success('Item updated!');
  } catch (e) {
    const msg = e.response?.data?.error || 'Update failed';
    yield put(updateItemFailure(msg));
    toast.error(msg);
  }
}

function* handleDeleteItem(action) {
  try {
    yield call(itemAPI.delete, action.payload);
    yield put(deleteItemSuccess(action.payload));
    yield put(fetchItemsRequest({ status: 'active' }));
    toast.success('Item deleted');
  } catch (e) {
    const msg = e.response?.data?.error || 'Delete failed';
    yield put(deleteItemFailure(msg));
    toast.error(msg);
  }
}

function* handleFetchStats() {
  try {
    const res = yield call(itemAPI.getStats);
    yield put(fetchStatsSuccess(res.data));
  } catch (e) {
    yield put(fetchStatsFailure());
  }
}

export function* watchItems() {
  yield takeLatest(fetchItemsRequest.type, handleFetchItems);
  yield takeLatest(fetchMyItemsRequest.type, handleFetchMyItems);
  yield takeLatest(fetchItemRequest.type, handleFetchItem);
  yield takeEvery(createItemRequest.type, handleCreateItem);
  yield takeEvery(updateItemRequest.type, handleUpdateItem);
  yield takeEvery(deleteItemRequest.type, handleDeleteItem);
  yield takeLatest(fetchStatsRequest.type, handleFetchStats);
}