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
} from 'lucide-react';
import { Button, Card, KPICard, InsightCard, ActionCard } from '@repo/ui';
import { formatRelativeTime } from '@repo/utils';

// Mock data
const recentAnalyses = [
  {
    id: '1',
    name: 'sales_2024.xlsx',
    status: 'completed' as const,
    rowCount: 10234,
    insightCount: 5,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'marketing_report.csv',
    status: 'completed' as const,
    rowCount: 5621,
    insightCount: 3,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'inventory.xlsx',
    status: 'processing' as const,
    rowCount: 2341,
    insightCount: 0,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const weeklyStats = {
  totalAnalyses: 12,
  analysesChange: 3,
  insights: 34,
  insightsChange: 12,
  actionsCompleted: 8,
  actionsChange: 5,
};

const topInsights = [
  {
    id: '1',
    type: 'anomaly' as const,
    title: '서울 지역 매출 15% 급감',
    description:
      '지난달 대비 서울 지역 매출이 15% 감소했습니다. 경쟁사 프로모션 영향 가능성이 있습니다.',
    importance: 'critical' as const,
  },
  {
    id: '2',
    type: 'trend' as const,
    title: '온라인 채널 성장세 지속',
    description:
      '온라인 채널 매출이 3개월 연속 20% 이상 성장하고 있습니다.',
    importance: 'high' as const,
  },
];

const pendingActions = [
  {
    id: '1',
    title: '서울 지역 프로모션 검토',
    description: '경쟁사 프로모션 현황 파악 및 대응 전략 수립',
    priority: 'urgent' as const,
    status: 'pending' as const,
    dueDate: '2024-01-15',
  },
  {
    id: '2',
    title: '온라인 마케팅 예산 조정',
    description: '성장하는 온라인 채널에 마케팅 예산 20% 재배분 검토',
    priority: 'high' as const,
    status: 'pending' as const,
    dueDate: '2024-01-20',
  },
];

export default function DashboardPage() {
  const [actionStatuses, setActionStatuses] = useState<Record<string, string>>(
    {}
  );

  const handleActionStatusChange = (id: string, status: string) => {
    setActionStatuses((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-500">안녕하세요! 오늘의 인사이트를 확인하세요.</p>
        </div>
        <Link href="/analysis/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>새 분석</Button>
        </Link>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="총 분석"
          value={weeklyStats.totalAnalyses}
          change={(weeklyStats.analysesChange / weeklyStats.totalAnalyses) * 100}
          changeLabel="이번 주"
        />
        <KPICard
          title="발견한 인사이트"
          value={weeklyStats.insights}
          change={(weeklyStats.insightsChange / weeklyStats.insights) * 100}
          changeLabel="이번 주"
        />
        <KPICard
          title="완료한 액션"
          value={weeklyStats.actionsCompleted}
          change={(weeklyStats.actionsChange / weeklyStats.actionsCompleted) * 100}
          changeLabel="이번 주"
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
              <Link
                href="/insights"
                className="text-sm text-primary-600 hover:underline"
              >
                모두 보기
              </Link>
            </div>

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
          </Card>
        </div>
      </div>

      {/* Pending Actions */}
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
              status={
                (actionStatuses[action.id] as any) || action.status
              }
              dueDate={action.dueDate}
              onStatusChange={(status) =>
                handleActionStatusChange(action.id, status)
              }
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
