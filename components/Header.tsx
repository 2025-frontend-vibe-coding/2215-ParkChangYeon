'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { logout } from '@/lib/slices/authSlice';
import { Button } from '@/components/ui/button';

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              게시판 서비스
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            {mounted && isAuthenticated ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                로그아웃
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    로그인
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    회원가입
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

