import { createSlice } from '@reduxjs/toolkit';

const claimSlice = createSlice({
  name: 'claims',
  initialState: {
    itemClaims: [],
    myClaims: [],
    loading: false,
    error: null,
    stats: null,
  },
  reducers: {
    fetchItemClaimsRequest: (state) => { state.loading = true; },
    fetchItemClaimsSuccess: (state, action) => { state.loading = false; state.itemClaims = action.payload; },
    fetchItemClaimsFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    fetchMyClaimsRequest: (state) => { state.loading = true; },
    fetchMyClaimsSuccess: (state, action) => { state.loading = false; state.myClaims = action.payload; },
    fetchMyClaimsFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    submitClaimRequest: (state) => { state.loading = true; state.error = null; },
    submitClaimSuccess: (state, action) => {
      state.loading = false;
      state.myClaims = [action.payload, ...state.myClaims];
      state.itemClaims = [action.payload, ...state.itemClaims];
    },
    submitClaimFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    updateClaimStatusRequest: (state) => { state.loading = true; },
    updateClaimStatusSuccess: (state, action) => {
      state.loading = false;
      state.itemClaims = state.itemClaims.map(c => c.id === action.payload.id ? action.payload : c);
      state.myClaims = state.myClaims.map(c => c.id === action.payload.id ? action.payload : c);
    },
    updateClaimStatusFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    fetchClaimStatsRequest: (state) => {},
    fetchClaimStatsSuccess: (state, action) => { state.stats = action.payload; },
    fetchClaimStatsFailure: (state, action) => {},
  },
});

export const {
  fetchItemClaimsRequest, fetchItemClaimsSuccess, fetchItemClaimsFailure,
  fetchMyClaimsRequest, fetchMyClaimsSuccess, fetchMyClaimsFailure,
  submitClaimRequest, submitClaimSuccess, submitClaimFailure,
  updateClaimStatusRequest, updateClaimStatusSuccess, updateClaimStatusFailure,
  fetchClaimStatsRequest, fetchClaimStatsSuccess, fetchClaimStatsFailure,
} = claimSlice.actions;
export default claimSlice.reducer;
