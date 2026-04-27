import { createSlice } from '@reduxjs/toolkit';

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: {
    fetchNotificationsRequest: (state) => { state.loading = true; },
    fetchNotificationsSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    fetchNotificationsFailure: (state) => { state.loading = false; },
    markReadSuccess: (state, action) => {
      state.list = state.list.map(n => n._id === action.payload ? { ...n, read: true } : n);
      state.unreadCount = state.list.filter(n => !n.read).length;
    },
  },
});

export const searchSlice = createSlice({
  name: 'search',
  initialState: { results: [], suggestions: [], trending: [], loading: false, query: '' },
  reducers: {
    searchRequest: (state, action) => { state.loading = true; state.query = action.payload; },
    searchSuccess: (state, action) => { state.loading = false; state.results = action.payload.results; },
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

export const { fetchNotificationsRequest, fetchNotificationsSuccess, fetchNotificationsFailure, markReadSuccess } = notificationSlice.actions;
export const { searchRequest, searchSuccess, searchFailure, suggestRequest, suggestSuccess, suggestFailure, fetchTrendingRequest, fetchTrendingSuccess, fetchTrendingFailure, clearSearch } = searchSlice.actions;

export default notificationSlice.reducer;
