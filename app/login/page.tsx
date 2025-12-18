'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authAPI } from '@/lib/api';
import { useAppDispatch } from '@/lib/hooks';
import { setCredentials } from '@/lib/slices/authSlice';

const loginSchema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(data);
      if (response.success && response.data) {
        dispatch(setCredentials(response.data));
        router.push('/');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message || '로그인에 실패했습니다.';
        if (errorMessage.includes('아이디') || errorMessage.includes('비밀번호')) {
          setError('username', { message: errorMessage });
        } else {
          alert(errorMessage);
        }
      } else {
        alert('로그인에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">로그인</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-gray-700">
            아이디
          </label>
          <Input
            id="username"
            placeholder="아이디를 입력하세요"
            {...register('username')}
            className={errors.username ? 'border-red-500' : ''}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            {...register('password')}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium rounded-lg shadow-sm"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        계정이 없으신가요?{' '}
        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
          회원가입
        </Link>
      </div>
      </div>
    </div>
  );
}

