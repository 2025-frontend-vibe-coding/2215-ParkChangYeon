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

const registerSchema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요.').max(100, '아이디는 100자 이하여야 합니다.'),
  email: z.string().min(1, '이메일을 입력해주세요.').email('올바른 이메일 형식이 아닙니다. (예: example@gmail.com)'),
  nickname: z.string().min(1, '닉네임을 입력해주세요.').max(15, '닉네임은 최대 15자까지 입력 가능합니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(data);
      if (response.success) {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        router.push('/login');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message || '회원가입에 실패했습니다.');
      } else {
        alert('회원가입에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">회원가입</h1>
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
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            이메일
          </label>
          <Input
            id="email"
            type="email"
            placeholder="example@gmail.com"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="nickname" className="text-sm font-medium text-gray-700">
            닉네임
          </label>
          <Input
            id="nickname"
            placeholder="닉네임을 입력하세요 (최대 15자)"
            maxLength={15}
            {...register('nickname')}
            className={errors.nickname ? 'border-red-500' : ''}
          />
          {errors.nickname && (
            <p className="text-sm text-red-500">{errors.nickname.message}</p>
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
          {isLoading ? '가입 중...' : '회원가입'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        계정이 있으신가요?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          로그인
        </Link>
      </div>
      </div>
    </div>
  );
}

