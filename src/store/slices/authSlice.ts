// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean; // true when user skipped login
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isGuest: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isGuest = false; // guest mode ends on real login
      // AsyncStorage is async — we fire-and-forget here to keep reducer sync
      AsyncStorage.setItem('token', action.payload.token).catch(() => {});
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isGuest = false;
      AsyncStorage.removeItem('token').catch(() => {});
    },
    setGuest: (state) => {
      // User skipped login — allow browsing without credentials
      state.isGuest = true;
    },
    clearGuest: (state) => {
      state.isGuest = false;
    },
  },
});

export const { setCredentials, logout, setGuest, clearGuest } = authSlice.actions;
export default authSlice.reducer;
