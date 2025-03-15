import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authReducer from "../features/auth/authSlice";
import courseIdReducer from "../features/courses/courseSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import groupIdReducer from "../features/groups/groupSlice"
import projectIdReducer from "../features/projects/projectSlice"
import userIdReducer from "../features/users/userSlice"

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    course: courseIdReducer,
    group: groupIdReducer,
    project: projectIdReducer,
    user: userIdReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

setupListeners(store.dispatch);
