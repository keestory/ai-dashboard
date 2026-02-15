'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, ArrowRight, CheckCircle } from 'lucide-react';
import { Button, Input } from '@repo/ui';
import { useAuth } from '@/contexts/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithOAuth } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, name);
      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'kakao') => {
    await signInWithOAuth(provider);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            이메일을 확인해주세요
          </h1>
          <p className="text-gray-600 mb-8">
            {email}로 인증 링크를 보냈습니다.
            <br />
            이메일의 링크를 클릭하여 가입을 완료해주세요.
          </p>
          <Link href="/login">
            <Button variant="secondary">로그인으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="w-full max-w-sm mx-auto">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <BarChart3 className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">InsightFlow</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-gray-600 mb-8">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary-600 hover:underline">
              로그인
            </Link>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="이름"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              label="이메일"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="비밀번호"
              placeholder="8자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="비밀번호 확인"
              placeholder="비밀번호 재입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                <Link href="/terms" className="text-primary-600 hover:underline">
                  이용약관
                </Link>
                {' '}및{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">
                  개인정보처리방침
                </Link>
                에 동의합니다
              </span>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              가입하기
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleOAuthLogin('google')}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleOAuthLogin('kakao')}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.8 5.27 4.5 6.71-.2.75-.73 2.72-.84 3.14-.13.52.19.51.4.37.17-.11 2.63-1.79 3.7-2.52.72.1 1.47.15 2.24.15 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z"
                  />
                </svg>
                Kakao
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-primary-600">
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">무료로 시작하세요</h2>
            <p className="text-primary-100 text-lg mb-8">
              신용카드 없이 시작하고
              <br />
              언제든지 업그레이드하세요
            </p>
            <ul className="text-left text-primary-100 space-y-3 max-w-xs mx-auto">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-white" />
                월 3회 무료 분석
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-white" />
                AI 기반 인사이트
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-white" />
                인터랙티브 대시보드
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
