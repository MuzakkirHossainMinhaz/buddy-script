import { configureStore } from "@reduxjs/toolkit";
import { buddyApi } from "./api";

export const store = configureStore({
  reducer: {
    [buddyApi.reducerPath]: buddyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(buddyApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
