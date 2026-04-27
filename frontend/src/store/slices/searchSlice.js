import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: { results: [], suggestions: [], trending: [], loading: false, query: '' },
  reducers: {
    searchRequest: (state, action) => { state.loading = true; state.query = action.payload; },
    searchSuccess: (state, action) => { state.loading = false; state.results = action.payload.results || []; },
    searchFailure: (state) => { state.loading = false; },
    suggestRequest: (state) => {},
    suggestSuccess: (state, action) => { state.suggestions = action.payload; },
    suggestFailure: (state) => {},
    fetchTrendingRequest: (state) => {},
    fetchTrendingSuccess: (state, action) => { state.trending = action.payload; },
    fetchTrendingFailure: (state) => {},
    clearSearch: (state) => { state.results = []; state.query = ''; },
  },
});

export const {
  searchRequest, searchSuccess, searchFailure,
  suggestRequest, suggestSuccess, suggestFailure,
  fetchTrendingRequest, fetchTrendingSuccess, fetchTrendingFailure,
  clearSearch,
} = searchSlice.actions;
export default searchSlice.reducer;
