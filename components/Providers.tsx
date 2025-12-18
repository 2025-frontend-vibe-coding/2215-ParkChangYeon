'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { setCredentials } from '@/lib/slices/authSlice';
import { getUsernameFromToken } from '@/lib/jwt';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 클라이언트에서만 localStorage에서 토큰 읽어오기
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      // 토큰이 있으면 Redux store에 설정
      store.dispatch(
        setCredentials({
          accessToken,
          refreshToken,
        })
      );
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

