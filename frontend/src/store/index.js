import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import authReducer from './slices/authSlice';
import itemReducer from './slices/itemSlice';
import claimReducer from './slices/claimSlice';
import notificationReducer from './slices/notificationSlice';
import searchReducer from './slices/searchSlice';
import { watchAuth } from '../saga/authSaga';
import { watchItems } from '../saga/itemSaga';
import { watchClaims } from '../saga/claimSaga';
import { watchNotifications } from '../saga/notificationSaga';
import { watchSearch } from '../saga/searchSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    items: itemReducer,
    claims: claimReducer,
    notifications: notificationReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

function* rootSaga() {
  yield all([
    watchAuth(),
    watchItems(),
    watchClaims(),
    watchNotifications(),
    watchSearch(),
  ]);
}

sagaMiddleware.run(rootSaga);

export default store;
