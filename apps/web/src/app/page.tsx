import Link from 'next/link';
import {
  BarChart3,
  Upload,
  Lightbulb,
  Zap,
  ArrowRight,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Brain,
  Target,
  CheckCircle,
  Star,
  ChevronRight,
  Play,
  Sparkles,
  ArrowDown,
  LayoutDashboard,
  PieChart,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">InsightFlow</span>
            </div>
            <div className="hidden sm:flex items-center space-x-8 text-sm font-medium text-gray-600">
              <a href="#how-it-works" className="hover:text-gray-900 transition-colors">사용법</a>
              <a href="#features" className="hover:text-gray-900 transition-colors">기능</a>
              <a href="#pricing" className="hover:text-gray-900 transition-colors">가격</a>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white font-medium text-sm rounded-lg hover:bg-gray-800 transition-colors"
              >
                무료 시작
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-100/50 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-sm text-blue-700 font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              Claude AI 기반 역할 맞춤 분석
            </div>

            {/* Headline - Role-based hooking */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.15] tracking-tight">
              데이터는 있는데,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                &ldquo;그래서 뭘 해야 하지?&rdquo;
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              데이터 올리고, <strong className="text-gray-900">내 역할</strong>만 선택하면
              <br className="hidden sm:block" />
              AI가 <strong className="text-gray-900">팀원에겐 실행 액션</strong>,{' '}
              <strong className="text-gray-900">팀장에겐 전략 방향</strong>,{' '}
              <strong className="text-gray-900">임원에겐 의사결정 포인트</strong>를 30초 만에 전달합니다.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold text-lg rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20"
              >
                30초 만에 시작하기
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 px-6 py-4 text-gray-600 font-medium text-lg hover:text-gray-900 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Play className="h-4 w-4 ml-0.5" />
                </div>
                결과 미리보기
              </a>
            </div>

            {/* Trust line */}
            <p className="mt-6 text-sm text-gray-400">
              카드 등록 없이 무료 시작 &middot; 월 3회 분석 무료
            </p>
          </div>

          {/* Product Mockup - Dashboard Preview */}
          <div id="demo" className="mt-16 relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden bg-gray-50">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-gray-400 text-center max-w-md mx-auto border border-gray-200">
                    app.insightflow.kr/analysis/result
                  </div>
                </div>
              </div>
              {/* Dashboard content */}
              <div className="p-6 sm:p-8 bg-white">
                {/* Executive Summary */}
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl p-5 mb-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-blue-200" />
                    <span className="font-semibold">Executive Summary</span>
                  </div>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    SNS 마케팅 캠페인 분석 결과, Instagram Reels의 ROAS가 4.2x로 가장 높으며,
                    25-34세 여성 타겟의 전환율이 평균 대비 187% 높습니다.
                    TikTok 예산을 Instagram으로 15% 재배분 시 월 매출 +₩12M 예상됩니다.
                  </p>
                </div>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: '총 매출', value: '₩847M', change: '+12.3%', up: true },
                    { label: 'ROAS 평균', value: '3.8x', change: '+0.6x', up: true },
                    { label: '전환율', value: '4.2%', change: '+1.1%p', up: true },
                    { label: 'CPA', value: '₩8,400', change: '-15%', up: true },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                      <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
                      <p className="text-xs text-emerald-600 font-medium mt-1">
                        <TrendingUp className="inline h-3 w-3 mr-0.5" />
                        {kpi.change}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Chart mockup */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-3">플랫폼별 ROAS</p>
                    <div className="flex items-end gap-3 h-32">
                      {[
                        { label: 'Instagram', h: '100%', color: 'bg-gradient-to-t from-pink-500 to-pink-400' },
                        { label: 'Facebook', h: '65%', color: 'bg-gradient-to-t from-blue-500 to-blue-400' },
                        { label: 'TikTok', h: '45%', color: 'bg-gradient-to-t from-gray-800 to-gray-700' },
                        { label: 'YouTube', h: '75%', color: 'bg-gradient-to-t from-red-500 to-red-400' },
                      ].map((bar) => (
                        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`w-full rounded-t-lg ${bar.color}`} style={{ height: bar.h }} />
                          <span className="text-[10px] text-gray-500">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-3">AI 추천 액션</p>
                    <div className="space-y-2.5">
                      {[
                        { text: 'Instagram Reels 예산 30% 증액', impact: '매출 +₩5.2M' },
                        { text: 'TikTok 25-34세 타겟 리타겟팅', impact: 'ROAS +1.2x' },
                        { text: '주말 캠페인 집중 시간대 변경', impact: '전환율 +0.8%p' },
                      ].map((action, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Target className="h-3 w-3 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-700 font-medium">{action.text}</p>
                            <p className="text-[10px] text-emerald-600">{action.impact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Numbers */}
      <section className="py-12 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10,000+', label: '분석 완료', icon: FileSpreadsheet },
              { number: '30초', label: '평균 분석 시간', icon: Clock },
              { number: '4.8/5', label: '사용자 만족도', icon: Star },
              { number: '3시간', label: '주간 절약 시간', icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <stat.icon className="h-5 w-5 text-blue-600 mb-2" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.number}</span>
                <span className="text-sm text-gray-500 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based Analysis Showcase */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              같은 데이터, 다른 인사이트
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              같은 매출 데이터를 올려도, <strong className="text-gray-700">내 역할에 따라 완전히 다른 분석</strong>을 받습니다
            </p>
          </div>

          {/* Shared data indicator */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 border border-gray-200">
              <FileSpreadsheet className="h-4 w-4 text-gray-400" />
              2024_Q4_매출데이터.xlsx
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg text-sm text-blue-700 border border-blue-200">
              <Brain className="h-4 w-4" />
              AI 역할 맞춤 분석
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Team Member */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">팀원</p>
                    <p className="text-blue-200 text-xs">마케팅팀 실무자</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">AI가 전달하는 내용</p>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">Instagram Reels CTR이 8.2%로 <strong>전체 채널 1위</strong> - 콘텐츠 제작 집중</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">목요일 오후 6시 게시물이 <strong>평균 대비 2.3배 반응</strong> - 게시 스케줄 조정</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">영상 콘텐츠가 이미지 대비 <strong>전환율 1.8배</strong> - 영상 비중 확대</p>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-xs text-blue-700 font-medium">
                    <Zap className="h-3 w-3" />
                    바로 실행 가능한 To-Do
                  </div>
                </div>
              </div>
            </div>

            {/* Team Lead */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow md:scale-[1.03] md:shadow-lg">
              <div className="bg-violet-600 px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">팀장</p>
                    <p className="text-violet-200 text-xs">마케팅팀 리더</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">AI가 전달하는 내용</p>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">TikTok 예산 대비 성과 <strong>하위 30%</strong> - Instagram으로 <strong>15% 재배분</strong> 권장</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">25-34세 여성 세그먼트 <strong>ROAS 4.2x</strong> - 타겟 예산 <strong>+₩5M 증액</strong> 제안</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">팀 KPI 달성률 <strong>87%</strong> - 전환율 캠페인에 <strong>리소스 집중 시 달성 가능</strong></p>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 rounded-full text-xs text-violet-700 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    전략 방향 + 리소스 배분
                  </div>
                </div>
              </div>
            </div>

            {/* Executive */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gray-900 px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">임원</p>
                    <p className="text-gray-400 text-xs">CMO / CFO</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">AI가 전달하는 내용</p>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-700 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">전사 마케팅 ROI <strong>3.2x → 3.8x</strong> 개선 - 전분기 대비 <strong>+18.7%</strong></p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-700 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">디지털 채널이 전체 매출 <strong>62% 기여</strong> - 오프라인 예산 <strong>디지털 전환</strong> 검토</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-700 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">Q1 예산 <strong>₩200M 기준</strong> - 현재 배분 vs 최적 배분 시 <strong>매출 +₩45M</strong> 차이</p>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 font-medium">
                    <Sparkles className="h-3 w-3" />
                    의사결정 포인트 + 숫자 근거
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-500">
              영업, 재무, HR, 운영... <strong className="text-gray-700">어떤 부서든</strong>, 어떤 직급이든.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              정말 3단계면 끝납니다
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              복잡한 설정도, 데이터 지식도 필요 없습니다
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200" />

            <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                파일 업로드
              </h3>
              <p className="text-gray-500">
                Excel, CSV 파일을 드래그 앤 드롭.
                <br />
                그게 끝입니다.
              </p>
            </div>

            <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
                <Brain className="h-8 w-8 text-violet-600" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 text-white text-sm font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI가 분석
              </h3>
              <p className="text-gray-500">
                Claude AI가 데이터를 읽고
                <br />
                비즈니스 관점으로 분석합니다.
              </p>
            </div>

            <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                인사이트 + 액션
              </h3>
              <p className="text-gray-500">
                KPI, 차트, 인사이트, 액션 플랜까지
                <br />
                한 화면에서 확인하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Visual */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              데이터팀 없이도, 프로 수준의 분석
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              AI가 각 역할에 맞는 시니어 분석가의 역할을 대신합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 - Executive Summary */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-5">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Executive Summary</h3>
              <p className="text-gray-500 mb-4">
                CEO가 30초에 읽을 수 있는 핵심 요약. &ldquo;결론이 뭔데?&rdquo;에 바로 답합니다.
              </p>
              <div className="bg-white rounded-lg p-3 border border-blue-100 text-sm text-gray-600 italic">
                &ldquo;Instagram Reels의 ROAS가 4.2x로 가장 높으며, 25-34세 여성 타겟의 전환율이 평균 대비 187% 높습니다...&rdquo;
              </div>
            </div>

            {/* Feature 2 - Business KPIs */}
            <div className="group relative bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-8 border border-emerald-100 hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-5">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">핵심 KPI 자동 도출</h3>
              <p className="text-gray-500 mb-4">
                데이터에서 가장 중요한 지표 4개를 자동으로 찾아 트렌드와 함께 보여줍니다.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2.5 border border-emerald-100 text-center">
                  <p className="text-lg font-bold text-gray-900">₩847M</p>
                  <p className="text-xs text-emerald-600">총 매출 +12.3%</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-emerald-100 text-center">
                  <p className="text-lg font-bold text-gray-900">3.8x</p>
                  <p className="text-xs text-emerald-600">ROAS +0.6x</p>
                </div>
              </div>
            </div>

            {/* Feature 3 - Smart Charts */}
            <div className="group relative bg-gradient-to-br from-violet-50 to-white rounded-2xl p-8 border border-violet-100 hover:border-violet-200 transition-colors">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 mb-5">
                <PieChart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI가 고른 최적의 차트</h3>
              <p className="text-gray-500 mb-4">
                &ldquo;이 데이터엔 어떤 차트가 맞을까?&rdquo; 고민 끝. AI가 데이터 특성에 맞는 시각화를 자동 생성합니다.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-white rounded-lg p-2 border border-violet-100 flex items-end justify-center gap-1 h-16">
                  <div className="w-4 bg-violet-400 rounded-t" style={{ height: '70%' }} />
                  <div className="w-4 bg-violet-300 rounded-t" style={{ height: '50%' }} />
                  <div className="w-4 bg-violet-500 rounded-t" style={{ height: '90%' }} />
                  <div className="w-4 bg-violet-200 rounded-t" style={{ height: '40%' }} />
                </div>
                <div className="flex-1 bg-white rounded-lg p-2 border border-violet-100 flex items-center justify-center h-16">
                  <div className="w-12 h-12 rounded-full border-4 border-violet-400 border-t-pink-400 border-r-blue-400" />
                </div>
              </div>
            </div>

            {/* Feature 4 - Action Plans */}
            <div className="group relative bg-gradient-to-br from-amber-50 to-white rounded-2xl p-8 border border-amber-100 hover:border-amber-200 transition-colors">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">실행 가능한 액션 플랜</h3>
              <p className="text-gray-500 mb-4">
                &ldquo;좋은 건 알겠는데, 뭘 해야 하지?&rdquo; 예상 효과까지 포함된 구체적 다음 단계를 제시합니다.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-amber-100 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-700">Instagram Reels 예산 30% 증액</span>
                  <span className="text-xs text-emerald-600 ml-auto font-medium">+₩5.2M</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-amber-100 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-700">주말 캠페인 시간대 변경</span>
                  <span className="text-xs text-emerald-600 ml-auto font-medium">+0.8%p</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Department Use Cases */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              어떤 팀이든, 어떤 데이터든
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              각 부서의 raw data를 올리면, 해당 팀에 맞는 분석을 받습니다
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                dept: '마케팅',
                data: '캠페인 성과, 광고 비용, 채널별 트래픽',
                output: 'ROAS 분석, 채널 최적화, 타겟 세그먼트 추천',
                color: 'blue',
              },
              {
                dept: '영업',
                data: '거래처별 매출, 파이프라인, 계약 현황',
                output: '이탈 위험 고객, 업셀 기회, 분기 목표 달성 예측',
                color: 'violet',
              },
              {
                dept: '재무',
                data: '매출/비용 장부, 예산 집행, 현금흐름',
                output: 'P&L 이상 징후, 비용 절감 포인트, 예산 재배분 안',
                color: 'emerald',
              },
              {
                dept: '이커머스',
                data: '상품별 매출, 재고, 고객 주문 이력',
                output: '베스트셀러 트렌드, 재고 최적화, 번들 추천',
                color: 'amber',
              },
              {
                dept: 'HR/인사',
                data: '채용 현황, 이직률, 급여 데이터',
                output: '이직 위험 부서, 채용 효율 분석, 보상 벤치마크',
                color: 'pink',
              },
              {
                dept: '운영/물류',
                data: '배송 시간, 반품률, 공급업체 성과',
                output: '병목 구간 식별, 공급업체 점수카드, 비용 절감 기회',
                color: 'cyan',
              },
            ].map((useCase) => (
              <div key={useCase.dept} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mb-4 ${
                  useCase.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  useCase.color === 'violet' ? 'bg-violet-100 text-violet-700' :
                  useCase.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  useCase.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                  useCase.color === 'pink' ? 'bg-pink-100 text-pink-700' :
                  'bg-cyan-100 text-cyan-700'
                }`}>
                  {useCase.dept}
                </div>
                <p className="text-xs text-gray-400 font-medium mb-1">올리는 데이터</p>
                <p className="text-sm text-gray-600 mb-3">{useCase.data}</p>
                <p className="text-xs text-gray-400 font-medium mb-1">AI가 분석하는 것</p>
                <p className="text-sm text-gray-900 font-medium">{useCase.output}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              심플한 가격
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              무료로 시작하고, 필요할 때 업그레이드하세요
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Free"
              price="0"
              description="가볍게 시작하기"
              features={['월 3회 분석', '기본 차트', '5MB 파일', 'AI 인사이트 (기본)']}
              cta="무료 시작"
            />
            <PricingCard
              name="Pro"
              price="19"
              description="개인/팀 분석가"
              features={['무제한 분석', 'AI 심층 인사이트', '50MB 파일', 'PDF 리포트 내보내기', '우선 처리']}
              popular
              cta="14일 무료 체험"
            />
            <PricingCard
              name="Team"
              price="49"
              description="팀 협업"
              features={['Pro 전체 기능', '5명 팀 협업', '100MB 파일', '팀 대시보드', '우선 지원']}
              cta="팀 시작하기"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-violet-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            팀원부터 임원까지,
            <br />
            각자에게 필요한 답을 30초 만에.
          </h2>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            데이터 올리고 역할만 선택하면 끝.
            <br />
            카드 등록 없이 지금 바로 시작하세요.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center px-10 py-5 bg-white text-gray-900 font-semibold text-lg rounded-2xl hover:bg-gray-100 transition-all shadow-2xl"
          >
            무료로 첫 분석 시작하기
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-5 text-sm text-blue-300">
            가입 30초 &middot; 카드 없음 &middot; 월 3회 무료
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">InsightFlow</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
              <Link href="/contact" className="hover:text-white transition-colors">문의하기</Link>
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

function PricingCard({
  name,
  price,
  description,
  features,
  popular,
  cta,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}) {
  return (
    <div
      className={`relative bg-white rounded-2xl p-8 ${
        popular
          ? 'border-2 border-blue-600 shadow-xl shadow-blue-600/10 scale-[1.02]'
          : 'border border-gray-200'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium px-4 py-1 rounded-full">
          가장 인기
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
      <div className="mt-5 flex items-baseline">
        <span className="text-4xl font-bold text-gray-900">${price}</span>
        <span className="text-gray-500 ml-1">/월</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-emerald-500 mr-2.5 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className={`mt-8 block w-full text-center py-3 rounded-xl font-medium transition-colors ${
          popular
            ? 'bg-gray-900 text-white hover:bg-gray-800'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
