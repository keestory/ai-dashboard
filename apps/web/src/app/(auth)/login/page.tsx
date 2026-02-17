'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart3,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Brain,
  Target,
} from 'lucide-react';
import { Button, Input } from '@repo/ui';
import { useAuth } from '@/contexts/auth-context';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithOAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'kakao') => {
    await signInWithOAuth(provider);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="w-full max-w-sm mx-auto">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">InsightFlow</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">로그인</h1>
          <p className="text-gray-500 mb-8">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              무료 가입
            </Link>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Social Login First */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center"
              onClick={() => handleOAuthLogin('google')}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google로 로그인
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-center"
              onClick={() => handleOAuthLogin('kakao')}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#3C1E1E"
                  d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.8 5.27 4.5 6.71-.2.75-.73 2.72-.84 3.14-.13.52.19.51.4.37.17-.11 2.63-1.79 3.7-2.52.72.1 1.47.15 2.24.15 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z"
                />
              </svg>
              Kakao로 로그인
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">또는 이메일로 로그인</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-500">로그인 유지</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              로그인
            </Button>
          </form>
        </div>
      </div>

      {/* Right side - Value Proposition */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-gray-900 via-blue-900 to-violet-900 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative h-full flex flex-col items-center justify-center p-12">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-blue-200 font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI가 분석하는 30초
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">
              데이터 올리고,
              <br />
              역할만 선택하세요
            </h2>
            <p className="text-blue-200 mb-10">
              나머지는 AI가 알아서 합니다.
              <br />
              KPI 도출, 차트 생성, 액션 추천까지.
            </p>

            {/* How it works mini */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Excel/CSV 업로드</p>
                  <p className="text-blue-300/70 text-xs">드래그 앤 드롭으로 간편하게</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="h-5 w-5 text-violet-300" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">AI 자동 분석</p>
                  <p className="text-violet-300/70 text-xs">Claude AI가 비즈니스 관점으로 분석</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">역할별 맞춤 결과</p>
                  <p className="text-emerald-300/70 text-xs">내 직급에 맞는 인사이트와 액션</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
