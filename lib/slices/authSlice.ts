'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, LoginResponse } from '../types';
import { getUsernameFromToken } from '../jwt';

// 서버와 클라이언트에서 동일한 초기 상태 사용
const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  username: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginResponse>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.username = getUsernameFromToken(action.payload.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.username = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

