import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import { claimAPI } from '../services/api';
import {
  fetchItemClaimsRequest, fetchItemClaimsSuccess, fetchItemClaimsFailure,
  fetchMyClaimsRequest, fetchMyClaimsSuccess, fetchMyClaimsFailure,
  submitClaimRequest, submitClaimSuccess, submitClaimFailure,
  updateClaimStatusRequest, updateClaimStatusSuccess, updateClaimStatusFailure,
  fetchClaimStatsRequest, fetchClaimStatsSuccess, fetchClaimStatsFailure,
} from '../store/slices/claimSlice';
import toast from 'react-hot-toast';

function* handleFetchItemClaims(action) {
  try {
    const res = yield call(claimAPI.getByItem, action.payload);
    yield put(fetchItemClaimsSuccess(Array.isArray(res.data) ? res.data : []));
  } catch (e) {
    yield put(fetchItemClaimsFailure(e.response?.data?.error || 'Failed'));
  }
}

function* handleFetchMyClaims() {
  try {
    const res = yield call(claimAPI.getMyClaims);
    yield put(fetchMyClaimsSuccess(Array.isArray(res.data) ? res.data : []));
  } catch (e) {
    yield put(fetchMyClaimsFailure(e.response?.data?.error || 'Failed'));
  }
}

function* handleSubmitClaim(action) {
  try {
    const res = yield call(claimAPI.submit, action.payload);
    yield put(submitClaimSuccess(res.data));
    // Immediately refresh claims tab
    yield put(fetchMyClaimsRequest());
    // Refresh item claims sidebar
    const itemId = action.payload.item_id || action.payload.itemId;
    if (itemId) yield put(fetchItemClaimsRequest(itemId));
    toast.success('Claim submitted! Check your Claims tab. ');
  } catch (e) {
    const msg = e.response?.data?.error || 'Failed to submit claim';
    yield put(submitClaimFailure(msg));
    toast.error(msg);
  }
}

function* handleUpdateClaimStatus(action) {
  try {
    const { id, status } = action.payload;
    const res = yield call(claimAPI.updateStatus, id, status);
    yield put(updateClaimStatusSuccess(res.data));
    // Refresh claims immediately after approve/reject
    yield put(fetchMyClaimsRequest());
    const emoji = status === 'approved' ? '' : '';
    toast.success(`${emoji} Claim ${status} successfully!`);
  } catch (e) {
    const msg = e.response?.data?.error || 'Update failed';
    yield put(updateClaimStatusFailure(msg));
    toast.error(msg);
  }
}

function* handleFetchClaimStats() {
  try {
    const res = yield call(claimAPI.getStats);
    yield put(fetchClaimStatsSuccess(res.data));
  } catch (e) {
    yield put(fetchClaimStatsFailure());
  }
}

export function* watchClaims() {
  yield takeLatest(fetchItemClaimsRequest.type, handleFetchItemClaims);
  yield takeLatest(fetchMyClaimsRequest.type, handleFetchMyClaims);
  yield takeEvery(submitClaimRequest.type, handleSubmitClaim);
  yield takeEvery(updateClaimStatusRequest.type, handleUpdateClaimStatus);
  yield takeLatest(fetchClaimStatsRequest.type, handleFetchClaimStats);
}