'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  FileBarChart,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Clock,
  AlertCircle,
  Upload,
  Sparkles,
  TrendingUp,
  Target,
} from 'lucide-react';
import { Button, Card, KPICard, InsightCard, ActionCard } from '@repo/ui';
import { formatRelativeTime } from '@repo/utils';
import { trpc } from '@/lib/trpc';

export default function DashboardPage() {
  const [actionStatuses, setActionStatuses] = useState<Record<string, string>>({});

  // Fetch real dashboard data
  const { data, isLoading, error } = trpc.dashboard.getOverview.useQuery();

  const handleActionStatusChange = (id: string, status: string) => {
    setActionStatuses((prev) => ({ ...prev, [id]: status }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">대시보드 로딩중...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - but handle UNAUTHORIZED specially (might be session sync issue)
  if (error) {
    // If unauthorized, try refreshing the page once (session might not be synced yet)
    if (error.data?.code === 'UNAUTHORIZED') {
      return (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
              <p className="text-gray-500">안녕하세요! 오늘의 인사이트를 확인하세요.</p>
            </div>
            <Link href="/analysis/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>새 분석</Button>
            </Link>
          </div>
          <Card className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="h-10 w-10 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                첫 번째 분석을 시작하세요
              </h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Excel 또는 CSV 파일을 업로드하면 AI가 자동으로 분석하고
                인사이트를 찾아드립니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/analysis/new">
                  <Button size="lg" leftIcon={<Plus className="h-5 w-5" />}>
                    파일 업로드하기
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => window.location.reload()}
                >
                  새로고침
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Other errors - show error state
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-2">데이터를 불러올 수 없습니다</p>
            <p className="text-gray-500 text-sm mb-4">{error.message}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { recentAnalyses, topInsights, pendingActions, stats } = data || {
    recentAnalyses: [],
    topInsights: [],
    pendingActions: [],
    stats: { totalAnalyses: 0, totalInsights: 0, completedActions: 0 },
  };

  // Determine user state based on data
  const analysisCount = recentAnalyses.length;
  const isNewUser = analysisCount === 0;
  const isEarlyUser = analysisCount >= 1 && analysisCount <= 3;
  const isActiveUser = analysisCount > 3;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요!';
    if (hour < 18) return '안녕하세요!';
    return '좋은 저녁이에요!';
  };

  // Tips for early users
  const tips = [
    { icon: TrendingUp, text: '여러 기간의 데이터를 분석하면 트렌드를 발견할 수 있어요' },
    { icon: Target, text: '액션 아이템을 완료하면 비즈니스 성과로 이어져요' },
    { icon: Sparkles, text: '다양한 데이터를 분석할수록 AI가 더 정확한 인사이트를 제공해요' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-500">{getGreeting()} 오늘의 인사이트를 확인하세요.</p>
        </div>
        <Link href="/analysis/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>새 분석</Button>
        </Link>
      </div>

      {/* New User - Empty State */}
      {isNewUser && (
        <Card className="py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="h-10 w-10 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              첫 번째 분석을 시작하세요
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Excel 또는 CSV 파일을 업로드하면 AI가 자동으로 분석하고
              인사이트를 찾아드립니다.
            </p>
            <Link href="/analysis/new">
              <Button size="lg" leftIcon={<Plus className="h-5 w-5" />}>
                파일 업로드하기
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Early User - Encouragement + Content */}
      {isEarlyUser && (
        <>
          {/* Celebration Banner */}
          <Card className="bg-gradient-to-r from-primary-50 to-emerald-50 border-primary-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">
                  {analysisCount === 1 ? '첫 분석 완료!' : `${analysisCount}개의 분석 완료!`} 잘하고 있어요 🎉
                </h2>
                <p className="text-sm text-gray-600">
                  더 많은 데이터를 분석하면 숨겨진 트렌드와 패턴을 발견할 수 있어요.
                </p>
              </div>
              <Link href="/analysis/new">
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                  추가 분석
                </Button>
              </Link>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              title="총 분석"
              value={stats.totalAnalyses}
              change={0}
              changeLabel="시작이 좋아요!"
            />
            <KPICard
              title="발견한 인사이트"
              value={stats.totalInsights}
              change={0}
              changeLabel={stats.totalInsights > 0 ? '인사이트 발견!' : '분석 중...'}
            />
            <KPICard
              title="완료한 액션"
              value={stats.completedActions}
              change={0}
              changeLabel={stats.completedActions > 0 ? '실행력 굿!' : '액션을 시작해보세요'}
            />
          </div>

          {/* Recent Analyses + Tips */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">내 분석</h2>
                  <Link
                    href="/analysis"
                    className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                  >
                    모두 보기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentAnalyses.map((analysis) => (
                    <Link
                      key={analysis.id}
                      href={`/analysis/${analysis.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileBarChart className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{analysis.name}</p>
                        <p className="text-sm text-gray-500">
                          {analysis.status === 'completed' ? (
                            <>
                              <CheckCircle className="inline h-3 w-3 text-emerald-500 mr-1" />
                              완료 | 인사이트: {analysis.insightCount}개
                            </>
                          ) : analysis.status === 'failed' ? (
                            <>
                              <AlertCircle className="inline h-3 w-3 text-red-500 mr-1" />
                              실패
                            </>
                          ) : (
                            <>
                              <Clock className="inline h-3 w-3 text-amber-500 mr-1" />
                              처리중...
                            </>
                          )}
                        </p>
                      </div>
                      <span className="text-sm text-gray-400">
                        {formatRelativeTime(analysis.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            {/* Tips for Early Users */}
            <div>
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-gray-900">활용 팁</h2>
                </div>
                <div className="space-y-4">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <tip.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <p className="text-sm text-gray-600">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Insights if any */}
          {topInsights.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">발견한 인사이트</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {topInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    type={insight.type}
                    title={insight.title}
                    description={insight.description}
                    importance={insight.importance}
                    onDetailClick={() => {}}
                  />
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Active User - Full Dashboard */}
      {isActiveUser && (
        <>
          {/* Weekly Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              title="총 분석"
              value={stats.totalAnalyses}
              change={0}
              changeLabel="이번 주"
            />
            <KPICard
              title="발견한 인사이트"
              value={stats.totalInsights}
              change={0}
              changeLabel="전체"
            />
            <KPICard
              title="완료한 액션"
              value={stats.completedActions}
              change={0}
              changeLabel="전체"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Analyses */}
            <div className="lg:col-span-2">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">최근 분석</h2>
                  <Link
                    href="/analysis"
                    className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                  >
                    모두 보기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentAnalyses.map((analysis) => (
                    <Link
                      key={analysis.id}
                      href={`/analysis/${analysis.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileBarChart className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {analysis.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {analysis.status === 'completed' ? (
                            <>
                              <CheckCircle className="inline h-3 w-3 text-emerald-500 mr-1" />
                              완료 | 행: {analysis.rowCount.toLocaleString()} | 인사이트:{' '}
                              {analysis.insightCount}개
                            </>
                          ) : analysis.status === 'failed' ? (
                            <>
                              <AlertCircle className="inline h-3 w-3 text-red-500 mr-1" />
                              실패
                            </>
                          ) : (
                            <>
                              <Clock className="inline h-3 w-3 text-amber-500 mr-1" />
                              처리중...
                            </>
                          )}
                        </p>
                      </div>
                      <span className="text-sm text-gray-400">
                        {formatRelativeTime(analysis.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            {/* Top Insights */}
            <div>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    주요 인사이트
                  </h2>
                </div>

                {topInsights.length > 0 ? (
                  <div className="space-y-4">
                    {topInsights.map((insight) => (
                      <InsightCard
                        key={insight.id}
                        type={insight.type}
                        title={insight.title}
                        description={insight.description}
                        importance={insight.importance}
                        onDetailClick={() => {}}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">아직 인사이트가 없습니다</p>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Pending Actions */}
          {pendingActions.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">대기 중인 액션</h2>
                <Link
                  href="/actions"
                  className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                >
                  모두 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {pendingActions.map((action) => (
                  <ActionCard
                    key={action.id}
                    title={action.title}
                    description={action.description}
                    priority={action.priority}
                    status={(actionStatuses[action.id] as any) || action.status}
                    dueDate={action.dueDate}
                    onStatusChange={(status) =>
                      handleActionStatusChange(action.id, status)
                    }
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Quick tip for active users */}
          {stats.totalInsights > 10 && pendingActions.length > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-800">
                  <strong>Pro Tip:</strong> {pendingActions.length}개의 액션이 대기 중이에요.
                  우선순위가 높은 것부터 실행해보세요!
                </p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
