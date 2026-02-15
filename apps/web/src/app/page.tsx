import Link from 'next/link';
import { BarChart3, Upload, Lightbulb, Zap, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">InsightFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                무료 시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Upload. Analyze. Act.
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Excel 파일 업로드 한 번으로
            <br className="hidden sm:block" />
            AI가 비즈니스 인사이트를 찾아드립니다
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold text-lg rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
            >
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center px-8 py-4 bg-gray-100 text-gray-700 font-semibold text-lg rounded-xl hover:bg-gray-200 transition-colors"
            >
              데모 보기
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            3단계로 끝
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <Upload className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                1. 업로드
              </h3>
              <p className="text-gray-600">
                Excel 또는 CSV 파일을 드래그 앤 드롭하세요.
                복잡한 설정 없이 바로 시작할 수 있습니다.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2. AI 분석
              </h3>
              <p className="text-gray-600">
                AI가 데이터를 자동으로 분석하고 트렌드, 이상치, 패턴을 찾아냅니다.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <Lightbulb className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3. 인사이트
              </h3>
              <p className="text-gray-600">
                대시보드에서 인사이트를 확인하고 추천 액션을 실행하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            주요 기능
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Lightbulb className="h-6 w-6" />}
              title="AI 인사이트"
              description="트렌드, 이상치, 패턴을 자동으로 발견하고 비즈니스 인사이트로 변환합니다."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="시각화 대시보드"
              description="인터랙티브 차트와 KPI 카드로 데이터를 한눈에 파악하세요."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="액션 추천"
              description="'다음에 뭘 해야 하지?'에 대한 구체적인 답변을 제공합니다."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            가격 플랜
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <PricingCard
              name="Free"
              price="0"
              features={['월 3회 분석', '기본 차트', '5MB 파일']}
            />
            <PricingCard
              name="Pro"
              price="19"
              features={['무제한 분석', 'AI 인사이트', '50MB 파일', 'PDF 내보내기']}
              popular
            />
            <PricingCard
              name="Team"
              price="49"
              features={['Pro 기능 모두', '5명 협업', '100MB 파일', '우선 지원']}
            />
            <PricingCard
              name="Business"
              price="99"
              features={['Team 기능 모두', '무제한 멤버', 'API 접근', '커스텀 브랜딩']}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            무료로 시작하고, 언제든지 업그레이드하세요.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold text-lg rounded-xl hover:bg-gray-100 transition-colors"
          >
            무료 계정 만들기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BarChart3 className="h-6 w-6 text-white" />
              <span className="text-lg font-bold text-white">InsightFlow</span>
            </div>
            <div className="flex items-center space-x-6 text-gray-400">
              <Link href="/terms" className="hover:text-white">이용약관</Link>
              <Link href="/privacy" className="hover:text-white">개인정보처리방침</Link>
              <Link href="/contact" className="hover:text-white">문의하기</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            &copy; 2026 InsightFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  features,
  popular,
}: {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}) {
  return (
    <div
      className={`relative bg-white rounded-2xl p-8 ${
        popular
          ? 'border-2 border-primary-600 shadow-lg'
          : 'border border-gray-200'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-sm font-medium px-3 py-1 rounded-full">
          인기
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-bold text-gray-900">${price}</span>
        <span className="text-gray-500 ml-1">/월</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center text-gray-600">
            <svg
              className="h-5 w-5 text-emerald-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className={`mt-8 block w-full text-center py-3 rounded-lg font-medium transition-colors ${
          popular
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        시작하기
      </Link>
    </div>
  );
}
