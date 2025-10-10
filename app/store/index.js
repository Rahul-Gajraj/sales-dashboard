import { combineReducers, configureStore } from "@reduxjs/toolkit";

import UsersSlice from "./dashboard/UsersSlice";
import UserSlice from "./dashboard/UserSlice";

const reducers = combineReducers({
  users: UsersSlice,
  user: UserSlice,
});

const reducerProxy = (state, action) => {
  return reducers(state, action);
};

const store = configureStore({
  reducer: reducerProxy,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
