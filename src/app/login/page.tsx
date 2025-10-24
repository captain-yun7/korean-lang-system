'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다');
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
    setLoading(true);
    setError('');

    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text">Private LMS</h1>
          </Link>
          <p className="mt-2 text-text-secondary">계정에 로그인하세요</p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-2xl shadow-card p-8">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-text-primary font-medium">Google로 계속하기</span>
            </button>

            <button
              onClick={() => handleSocialLogin('kakao')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#FEE500' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#000000"
                  d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
                />
              </svg>
              <span className="font-medium" style={{ color: '#000000' }}>
                카카오로 계속하기
              </span>
            </button>

            <button
              onClick={() => handleSocialLogin('naver')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#03C75A' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#FFFFFF" d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
              </svg>
              <span className="text-white font-medium">네이버로 계속하기</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-text-secondary">또는</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                이메일
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="input-field"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                비밀번호
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="input-field"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-border text-primary mr-2" />
                <span className="text-text-secondary">로그인 상태 유지</span>
              </label>
              <Link href="/forgot-password" className="text-primary hover:text-primary-dark">
                비밀번호 찾기
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            아직 계정이 없으신가요?{' '}
            <Link href="/signup" className="text-primary hover:text-primary-dark font-medium">
              회원가입
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-text-secondary">
          로그인하면 Private LMS의{' '}
          <Link href="/terms" className="underline hover:text-text-primary">
            이용약관
          </Link>{' '}
          및{' '}
          <Link href="/privacy" className="underline hover:text-text-primary">
            개인정보처리방침
          </Link>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
