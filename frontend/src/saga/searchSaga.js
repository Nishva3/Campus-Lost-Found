import { call, put, takeLatest, debounce } from 'redux-saga/effects';
import { searchAPI } from '../services/api';
import { searchRequest, searchSuccess, searchFailure, suggestRequest, suggestSuccess, suggestFailure, fetchTrendingRequest, fetchTrendingSuccess, fetchTrendingFailure } from '../store/slices/searchSlice';

function* handleSearch(action) {
  try {
    const res = yield call(searchAPI.search, { q: action.payload });
    yield put(searchSuccess(res.data));
  } catch (e) {
    yield put(searchFailure());
  }
}

function* handleSuggest(action) {
  try {
    const res = yield call(searchAPI.suggest, action.payload);
    yield put(suggestSuccess(res.data));
  } catch (e) {
    yield put(suggestFailure());
  }
}

function* handleFetchTrending() {
  try {
    const res = yield call(searchAPI.trending);
    yield put(fetchTrendingSuccess(res.data));
  } catch (e) {
    yield put(fetchTrendingFailure());
  }
}

export function* watchSearch() {
  yield takeLatest(searchRequest.type, handleSearch);
  yield debounce(400, suggestRequest.type, handleSuggest);
  yield takeLatest(fetchTrendingRequest.type, handleFetchTrending);
}
