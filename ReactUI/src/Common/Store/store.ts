// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import profileReducer from './userProfileSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    profile: profileReducer
  },
});

// Infer RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
