import { createSlice } from '@reduxjs/toolkit';

const itemSlice = createSlice({
  name: 'items',
  initialState: {
    list: [],
    myItems: [],
    selected: null,
    total: 0,
    pages: 1,
    loading: false,
    error: null,
    stats: null,
    filters: { type: '', category: '', status: 'active', search: '' },
  },
  reducers: {
    fetchItemsRequest: (state) => { state.loading = true; state.error = null; },
    fetchItemsSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload.items;
      state.total = action.payload.total;
      state.pages = action.payload.pages;
    },
    fetchItemsFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    fetchMyItemsRequest: (state) => { state.loading = true; },
    fetchMyItemsSuccess: (state, action) => { state.loading = false; state.myItems = action.payload; },
    fetchMyItemsFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    fetchItemRequest: (state) => { state.loading = true; },
    fetchItemSuccess: (state, action) => { state.loading = false; state.selected = action.payload; },
    fetchItemFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    createItemRequest: (state) => { state.loading = true; state.error = null; },
    createItemSuccess: (state, action) => {
      state.loading = false;
      state.list = [action.payload, ...state.list];
      state.myItems = [action.payload, ...state.myItems];
    },
    createItemFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    updateItemRequest: (state) => { state.loading = true; },
    updateItemSuccess: (state, action) => {
      state.loading = false;
      state.list = state.list.map(i => i._id === action.payload._id ? action.payload : i);
      state.myItems = state.myItems.map(i => i._id === action.payload._id ? action.payload : i);
      state.selected = action.payload;
    },
    updateItemFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    deleteItemRequest: (state) => { state.loading = true; },
    deleteItemSuccess: (state, action) => {
      state.loading = false;
      state.list = state.list.filter(i => i._id !== action.payload);
      state.myItems = state.myItems.filter(i => i._id !== action.payload);
    },
    deleteItemFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    fetchStatsRequest: (state) => {},
    fetchStatsSuccess: (state, action) => { state.stats = action.payload; },
    fetchStatsFailure: (state, action) => {},
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
  },
});

export const {
  fetchItemsRequest, fetchItemsSuccess, fetchItemsFailure,
  fetchMyItemsRequest, fetchMyItemsSuccess, fetchMyItemsFailure,
  fetchItemRequest, fetchItemSuccess, fetchItemFailure,
  createItemRequest, createItemSuccess, createItemFailure,
  updateItemRequest, updateItemSuccess, updateItemFailure,
  deleteItemRequest, deleteItemSuccess, deleteItemFailure,
  fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure,
  setFilters,
} = itemSlice.actions;
export default itemSlice.reducer;
