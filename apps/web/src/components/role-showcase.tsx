'use client';

import { useState, useRef, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  ArrowRight,
  Brain,
  Target,
  LayoutDashboard,
  BarChart3,
  CheckCircle,
  Zap,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface RoleCardData {
  subtitle: string;
  insights: string[];
  badge: {
    text: string;
    icon: 'zap' | 'trending' | 'sparkles';
  };
}

interface DepartmentShowcase {
  id: string;
  label: string;
  fileName: string;
  teamMember: RoleCardData;
  teamLead: RoleCardData;
  executive: RoleCardData;
}

function renderBoldText(text: string): ReactNode {
  const parts = text.split(/(<strong>.*?<\/strong>)/g);
  return parts.map((part, i) => {
    if (part.startsWith('<strong>')) {
      return <strong key={i}>{part.replace(/<\/?strong>/g, '')}</strong>;
    }
    return part;
  });
}

const DEPARTMENT_SHOWCASES: DepartmentShowcase[] = [
  {
    id: 'marketing',
    label: '마케팅',
    fileName: '2024_Q4_매출데이터.xlsx',
    teamMember: {
      subtitle: '마케팅팀 실무자',
      insights: [
        'Instagram Reels CTR이 8.2%로 <strong>전체 채널 1위</strong> - 콘텐츠 제작 집중',
        '목요일 오후 6시 게시물이 <strong>평균 대비 2.3배 반응</strong> - 게시 스케줄 조정',
        '영상 콘텐츠가 이미지 대비 <strong>전환율 1.8배</strong> - 영상 비중 확대',
      ],
      badge: { text: '바로 실행 가능한 To-Do', icon: 'zap' },
    },
    teamLead: {
      subtitle: '마케팅팀 리더',
      insights: [
        'TikTok 예산 대비 성과 <strong>하위 30%</strong> - Instagram으로 <strong>15% 재배분</strong> 권장',
        '25-34세 여성 세그먼트 <strong>ROAS 4.2x</strong> - 타겟 예산 <strong>+₩5M 증액</strong> 제안',
        '팀 KPI 달성률 <strong>87%</strong> - 전환율 캠페인에 <strong>리소스 집중 시 달성 가능</strong>',
      ],
      badge: { text: '전략 방향 + 리소스 배분', icon: 'trending' },
    },
    executive: {
      subtitle: 'CMO / CFO',
      insights: [
        '전사 마케팅 ROI <strong>3.2x → 3.8x</strong> 개선 - 전분기 대비 <strong>+18.7%</strong>',
        '디지털 채널이 전체 매출 <strong>62% 기여</strong> - 오프라인 예산 <strong>디지털 전환</strong> 검토',
        'Q1 예산 <strong>₩200M 기준</strong> - 현재 배분 vs 최적 배분 시 <strong>매출 +₩45M</strong> 차이',
      ],
      badge: { text: '의사결정 포인트 + 숫자 근거', icon: 'sparkles' },
    },
  },
  {
    id: 'sales',
    label: '영업',
    fileName: '2024_Q4_영업실적.xlsx',
    teamMember: {
      subtitle: '영업팀 실무자',
      insights: [
        'A사 계약 갱신율 <strong>92%</strong>로 상위 거래처 - <strong>업셀 제안</strong> 우선 진행',
        '신규 리드 중 <strong>IT업종 전환율 최고 34%</strong> - 해당 업종 콜드콜 집중',
        '금요일 오전 미팅이 <strong>계약 성사율 2.1배</strong> - 주간 스케줄 조정',
      ],
      badge: { text: '바로 실행 가능한 To-Do', icon: 'zap' },
    },
    teamLead: {
      subtitle: '영업팀 리더',
      insights: [
        '파이프라인 상위 20% 딜이 <strong>매출 68% 차지</strong> - <strong>핵심 딜 집중 관리</strong> 필요',
        '이탈 위험 고객 <strong>12건</strong> 감지 - 즉시 <strong>리텐션 캠페인</strong> 가동 권장',
        '분기 목표 달성률 <strong>78%</strong> - 남은 기간 <strong>주 15건 미팅</strong>으로 달성 가능',
      ],
      badge: { text: '전략 방향 + 리소스 배분', icon: 'trending' },
    },
    executive: {
      subtitle: 'CSO / CEO',
      insights: [
        '전사 영업이익률 <strong>18.3% → 21.7%</strong> 개선 - 고마진 상품 비중 <strong>+12%p</strong>',
        '신규 고객 확보 비용(CAC) <strong>₩380K</strong> - 업계 평균 대비 <strong>23% 낮음</strong>',
        '해외 시장 매출 비중 <strong>8% → 15%</strong> 성장 시 <strong>연 매출 +₩2.8B</strong> 예상',
      ],
      badge: { text: '의사결정 포인트 + 숫자 근거', icon: 'sparkles' },
    },
  },
  {
    id: 'finance',
    label: '재무',
    fileName: '2024_Q4_재무제표.xlsx',
    teamMember: {
      subtitle: '재무팀 실무자',
      insights: [
        '미수금 <strong>60일 초과 건 23건</strong> 발견 - <strong>독촉 대상 리스트</strong> 자동 생성',
        '부서별 예산 집행률 편차 <strong>최대 34%p</strong> - 운영팀/마케팅팀 <strong>재조정 필요</strong>',
        '매월 15일 기준 현금흐름 <strong>₩-45M 적자 패턴</strong> - 결제일 분산 제안',
      ],
      badge: { text: '바로 실행 가능한 To-Do', icon: 'zap' },
    },
    teamLead: {
      subtitle: '재무팀 리더',
      insights: [
        '판관비 중 <strong>SaaS 구독료 18% 증가</strong> - 미사용 툴 <strong>₩8M/월 절감</strong> 가능',
        '부서별 ROI 분석 결과 <strong>R&D 투자 효율 최고</strong> - 예산 <strong>+15% 재배분</strong> 제안',
        '현금 보유 대비 운전자금 비율 <strong>1.8x</strong> - 안정 구간이나 <strong>모니터링 필요</strong>',
      ],
      badge: { text: '전략 방향 + 리소스 배분', icon: 'trending' },
    },
    executive: {
      subtitle: 'CFO / CEO',
      insights: [
        '영업이익률 <strong>12.4% → 15.1%</strong> 개선 - 비용 구조 효율화 <strong>전분기 대비 +2.7%p</strong>',
        'EBITDA 기준 기업가치 <strong>₩85B</strong> - 동종업계 멀티플 적용 시 <strong>상위 25%</strong>',
        '내년 설비투자 <strong>₩5B 집행</strong> 시 손익분기점 <strong>18개월</strong> - 투자 승인 검토',
      ],
      badge: { text: '의사결정 포인트 + 숫자 근거', icon: 'sparkles' },
    },
  },
  {
    id: 'hr',
    label: 'HR',
    fileName: '2024_Q4_인사데이터.xlsx',
    teamMember: {
      subtitle: 'HR팀 실무자',
      insights: [
        '이번 분기 퇴사자 <strong>7명 중 5명이 입사 1년 미만</strong> - <strong>온보딩 프로세스</strong> 점검',
        '채용 공고 중 <strong>개발직군 지원률 최저 2.3:1</strong> - 공고 문구/채널 <strong>A/B 테스트</strong> 필요',
        '교육 이수율 <strong>영업팀 42%로 최하위</strong> - 리마인더 발송 및 일정 재조정',
      ],
      badge: { text: '바로 실행 가능한 To-Do', icon: 'zap' },
    },
    teamLead: {
      subtitle: 'HR팀 리더',
      insights: [
        '전사 이직률 <strong>14.2%</strong>로 업계 평균(11%) 상회 - <strong>리텐션 프로그램</strong> 강화 필요',
        '성과 상위 20% 인재의 <strong>평균 급여가 시장가 대비 88%</strong> - <strong>보상 조정</strong> 시급',
        '채용 소요 기간 <strong>평균 45일 → 32일</strong> 단축 가능 - <strong>면접 프로세스</strong> 간소화 제안',
      ],
      badge: { text: '전략 방향 + 리소스 배분', icon: 'trending' },
    },
    executive: {
      subtitle: 'CHRO / CEO',
      insights: [
        '인건비 대비 매출 <strong>₩4.2M/인</strong> - 전년 대비 <strong>+8%</strong> 생산성 향상',
        '핵심 인재 이탈 시 대체 비용 <strong>연봉의 2.1배</strong> - <strong>리텐션 투자 ROI 3.8x</strong>',
        '조직 확장 시나리오: <strong>+30명 채용</strong> 시 <strong>인건비 +₩1.8B</strong>, 매출 +₩7.2B 예상',
      ],
      badge: { text: '의사결정 포인트 + 숫자 근거', icon: 'sparkles' },
    },
  },
  {
    id: 'operations',
    label: '운영',
    fileName: '2024_Q4_운영데이터.xlsx',
    teamMember: {
      subtitle: '운영팀 실무자',
      insights: [
        '배송 지연 <strong>A물류사 비율 12%</strong>로 최고 - <strong>B물류사로 일부 물량 전환</strong> 필요',
        '반품 사유 중 <strong>"사이즈 불일치" 43%</strong> - <strong>상품페이지 사이즈 가이드</strong> 개선',
        '재고 회전율 <strong>카테고리별 최대 5배 차이</strong> - 저회전 상품 <strong>프로모션 우선</strong>',
      ],
      badge: { text: '바로 실행 가능한 To-Do', icon: 'zap' },
    },
    teamLead: {
      subtitle: '운영팀 리더',
      insights: [
        '물류비 <strong>매출 대비 8.4%</strong>로 목표(7%) 초과 - <strong>묶음배송 비율</strong> 25%→40% 확대 시 달성',
        '주문-배송 리드타임 <strong>평균 2.8일</strong> - <strong>피킹 자동화</strong> 도입 시 <strong>1.9일</strong>로 단축',
        '공급업체 <strong>상위 3곳이 매입 70%</strong> 집중 - <strong>리스크 분산</strong>을 위한 대안 업체 확보 필요',
      ],
      badge: { text: '전략 방향 + 리소스 배분', icon: 'trending' },
    },
    executive: {
      subtitle: 'COO / CEO',
      insights: [
        '운영비용 <strong>전년 대비 -6.2%</strong> 절감 - 자동화 투자 <strong>ROI 280%</strong> 달성',
        '풀필먼트 센터 가동률 <strong>94%</strong> - <strong>95% 초과 시 증설</strong> 의사결정 필요 (투자 ₩3B)',
        '당일배송 커버리지 <strong>수도권 82%</strong> - <strong>전국 확대 시</strong> 고객 만족도 +15%p 예상',
      ],
      badge: { text: '의사결정 포인트 + 숫자 근거', icon: 'sparkles' },
    },
  },
];

const BADGE_ICONS = {
  zap: Zap,
  trending: TrendingUp,
  sparkles: Sparkles,
} as const;

const ROLE_CONFIGS = [
  {
    key: 'teamMember' as const,
    roleLabel: '팀원',
    headerBg: 'bg-blue-600',
    subtitleColor: 'text-blue-200',
    icon: Target,
    checkColor: 'text-blue-500',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    borderClass: 'border border-gray-200',
    extraClass: '',
  },
  {
    key: 'teamLead' as const,
    roleLabel: '팀장',
    headerBg: 'bg-violet-600',
    subtitleColor: 'text-violet-200',
    icon: LayoutDashboard,
    checkColor: 'text-violet-500',
    badgeBg: 'bg-violet-50',
    badgeText: 'text-violet-700',
    borderClass: 'border-2 border-violet-300 ring-1 ring-violet-200',
    extraClass: 'md:shadow-lg md:-my-2',
  },
  {
    key: 'executive' as const,
    roleLabel: '임원',
    headerBg: 'bg-gray-900',
    subtitleColor: 'text-gray-400',
    icon: BarChart3,
    checkColor: 'text-gray-700',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    borderClass: 'border border-gray-200',
    extraClass: '',
  },
];

export default function RoleShowcase() {
  const [activeDept, setActiveDept] = useState(DEPARTMENT_SHOWCASES[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDeptChange = useCallback((dept: DepartmentShowcase) => {
    if (dept.id === activeDept.id) return;
    setIsTransitioning(true);
    scrollRef.current?.scrollTo({ left: 0, behavior: 'auto' });
    setTimeout(() => {
      setActiveDept(dept);
      setIsTransitioning(false);
    }, 150);
  }, [activeDept.id]);

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            같은 데이터, 다른 인사이트
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            같은 매출 데이터를 올려도, <strong className="text-gray-700">내 역할에 따라 완전히 다른 분석</strong>을 받습니다
          </p>
        </div>

        {/* Department Pill Selector */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8" role="tablist" aria-label="부서 선택">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mr-2 hidden sm:inline">부서</span>
          {DEPARTMENT_SHOWCASES.map((dept) => (
            <button
              key={dept.id}
              role="tab"
              aria-selected={activeDept.id === dept.id}
              aria-label={`${dept.label} 부서 예시 보기`}
              onClick={() => handleDeptChange(dept)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeDept.id === dept.id
                  ? 'bg-gray-900 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>

        {/* Shared data indicator */}
        <div className={`flex items-center justify-center gap-3 mb-12 transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 border border-gray-200">
            <FileSpreadsheet className="h-4 w-4 text-gray-400" />
            {activeDept.fileName}
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg text-sm text-blue-700 border border-blue-200">
            <Brain className="h-4 w-4" />
            AI 역할 맞춤 분석
          </div>
        </div>

        {/* Role Cards */}
        <div
          role="tabpanel"
          aria-label={`${activeDept.label} 부서 분석 예시`}
          className={`transition-all duration-150 ${isTransitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
        >
          <div
            ref={scrollRef}
            className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide"
          >
            {ROLE_CONFIGS.map((config) => {
              const data = activeDept[config.key];
              const BadgeIcon = BADGE_ICONS[data.badge.icon];
              const HeaderIcon = config.icon;

              return (
                <div
                  key={config.key}
                  className={`bg-white rounded-2xl ${config.borderClass} overflow-hidden hover:shadow-lg transition-shadow min-w-[300px] md:min-w-0 snap-center flex flex-col ${config.extraClass}`}
                >
                  <div className={`${config.headerBg} px-6 py-4`}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <HeaderIcon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{config.roleLabel}</p>
                        <p className={`${config.subtitleColor} text-xs`}>{data.subtitle}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-3 flex-1 flex flex-col">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">AI가 전달하는 내용</p>
                    <div className="space-y-2.5 flex-1">
                      {data.insights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className={`h-4 w-4 ${config.checkColor} flex-shrink-0 mt-0.5`} />
                          <p className="text-sm text-gray-700">
                            {renderBoldText(insight)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 mt-auto">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 ${config.badgeBg} rounded-full text-xs ${config.badgeText} font-medium`}>
                        <BadgeIcon className="h-3 w-3" />
                        {data.badge.text}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-6">
            영업, 재무, HR, 운영... <strong className="text-gray-700">어떤 부서든</strong>, 어떤 직급이든.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            내 역할로 분석 받아보기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
