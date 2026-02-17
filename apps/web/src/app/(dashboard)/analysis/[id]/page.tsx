'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  RefreshCw,
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Lightbulb,
  Target,
  ChevronRight,
  Users,
  UserCog,
  Crown,
} from 'lucide-react';
import { Button, Card, InsightCard, ActionCard } from '@repo/ui';
import { formatRelativeTime, formatBytes } from '@repo/utils';
import { trpc } from '@/lib/trpc';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

const ROLE_INFO: Record<string, { label: string; icon: typeof Users; color: string }> = {
  team_member: { label: '팀원 관점', icon: Users, color: 'blue' },
  team_lead: { label: '팀장 관점', icon: UserCog, color: 'emerald' },
  executive: { label: '임원 관점', icon: Crown, color: 'purple' },
};

interface Analysis {
  id: string;
  name: string;
  description: string | null;
  file_name: string;
  file_size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  row_count: number | null;
  column_count: number | null;
  summary: {
    totalRows?: number;
    totalColumns?: number;
    numericColumns?: unknown[];
    categoricalColumns?: unknown[];
    businessKPIs?: {
      label: string;
      value: string;
      change?: string;
      changeType?: 'positive' | 'negative' | 'neutral';
    }[];
    executiveSummary?: string;
  } | null;
  created_at: string;
  completed_at: string | null;
}

interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  data: unknown;
}

interface ChartData {
  id: string;
  type: string;
  title: string;
  config: { xKey?: string; yKey?: string };
  data: unknown;
}

interface Action {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;

  const [reanalyzing, setReanalyzing] = useState(false);
  const [actionStatuses, setActionStatuses] = useState<Record<string, string>>({});

  const { data, isLoading, error, refetch } = trpc.analysis.getById.useQuery(
    { id: analysisId },
    {
      refetchInterval: (query) => {
        const status = (query.state.data as any)?.status;
        if (status === 'pending' || status === 'processing') {
          return 3000;
        }
        return false;
      }
    }
  );

  const analysisData = data as any;
  const analysis: Analysis | null = analysisData ? {
    id: analysisData.id,
    name: analysisData.name,
    description: analysisData.description,
    file_name: analysisData.file_name,
    file_size: analysisData.file_size,
    status: analysisData.status,
    row_count: analysisData.row_count,
    column_count: analysisData.column_count,
    summary: analysisData.summary,
    created_at: analysisData.created_at,
    completed_at: analysisData.completed_at,
  } : null;

  // Extract role from description
  const analysisRole = analysis?.description?.match(/^role:(\w+)\|/)?.[1] || null;
  const roleInfo = analysisRole ? ROLE_INFO[analysisRole] : null;
  const insights = (analysisData?.insights || []) as Insight[];
  const charts = (analysisData?.charts || []) as ChartData[];
  const actions = (analysisData?.actions || []) as Action[];

  const businessKPIs = analysis?.summary?.businessKPIs || [];
  const executiveSummary = analysis?.summary?.executiveSummary || '';

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId }),
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) throw new Error('Failed to reanalyze');
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setReanalyzing(false);
    }
  };

  const updateActionMutation = trpc.action.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const handleActionStatusChange = async (actionId: string, status: string) => {
    setActionStatuses(prev => ({ ...prev, [actionId]: status }));
    updateActionMutation.mutate({ id: actionId, status: status as any });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600">{error?.message || '분석을 찾을 수 없습니다.'}</p>
        <Link href="/analysis">
          <Button variant="secondary" className="mt-4">목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/analysis" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{analysis.name}</h1>
              {roleInfo && (() => {
                const RoleIcon = roleInfo.icon;
                return (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    roleInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    roleInfo.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    <RoleIcon className="h-3 w-3" />
                    {roleInfo.label}
                  </span>
                );
              })()}
            </div>
            <p className="text-gray-500">
              {formatBytes(analysis.file_size)} | {analysis.row_count?.toLocaleString()}행 | {formatRelativeTime(analysis.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={handleReanalyze}
            loading={reanalyzing}
          >
            다시 분석
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Share2 className="h-4 w-4" />}
          >
            공유
          </Button>
          <Button
            leftIcon={<FileText className="h-4 w-4" />}
            onClick={() => router.push(`/reports/new?analysisId=${analysisId}`)}
          >
            리포트 생성
          </Button>
        </div>
      </div>

      {/* Processing State */}
      {(analysis.status === 'pending' || analysis.status === 'processing') && (
        <Card>
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI가 데이터를 분석하고 있습니다</h2>
            <p className="text-gray-500 mb-8">
              비즈니스 인사이트와 액션 아이템을 생성하고 있습니다
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                {['데이터 파싱', '통계 분석', 'AI 인사이트', '차트 생성'].map((step, index) => {
                  const isActive = analysis.status === 'pending' ? index === 0 : index <= 2;
                  const isCompleted = analysis.status === 'processing' && index < 1;
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <span className={`text-xs mt-1 ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-500 animate-pulse"
                  style={{ width: analysis.status === 'pending' ? '25%' : '66%' }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-6">AI 분석에 10-30초 정도 소요됩니다</p>
          </div>
        </Card>
      )}

      {/* Failed State */}
      {analysis.status === 'failed' && (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-900">분석 실패</p>
              <p className="text-sm text-red-700">파일 분석 중 오류가 발생했습니다. 파일 형식을 확인하고 다시 시도해주세요.</p>
            </div>
            <Button onClick={handleReanalyze} loading={reanalyzing}>다시 시도</Button>
          </div>
        </Card>
      )}

      {/* Completed State */}
      {analysis.status === 'completed' && (
        <>
          {/* Executive Summary */}
          {executiveSummary && (
            <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 mb-1">AI 분석 요약</h2>
                  <p className="text-gray-700 leading-relaxed">{executiveSummary}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Business KPIs */}
          {businessKPIs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {businessKPIs.map((kpi, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      kpi.changeType === 'positive' ? 'bg-emerald-100' :
                      kpi.changeType === 'negative' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {kpi.changeType === 'positive' ? <TrendingUp className="h-4 w-4 text-emerald-600" /> :
                       kpi.changeType === 'negative' ? <TrendingDown className="h-4 w-4 text-red-600" /> :
                       <Minus className="h-4 w-4 text-gray-400" />}
                    </div>
                  </div>
                  {kpi.change && (
                    <p className={`text-xs mt-2 ${
                      kpi.changeType === 'positive' ? 'text-emerald-600' :
                      kpi.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {kpi.change}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            /* Fallback KPIs from raw data */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <p className="text-sm text-gray-500 mb-1">데이터 규모</p>
                <p className="text-2xl font-bold text-gray-900">{analysis.row_count?.toLocaleString()}<span className="text-sm text-gray-400 ml-1">행</span></p>
              </Card>
              <Card>
                <p className="text-sm text-gray-500 mb-1">분석 항목</p>
                <p className="text-2xl font-bold text-gray-900">{analysis.column_count}<span className="text-sm text-gray-400 ml-1">열</span></p>
              </Card>
              <Card>
                <p className="text-sm text-gray-500 mb-1">인사이트</p>
                <p className="text-2xl font-bold text-gray-900">{insights.length}<span className="text-sm text-gray-400 ml-1">개</span></p>
              </Card>
              <Card>
                <p className="text-sm text-gray-500 mb-1">액션 아이템</p>
                <p className="text-2xl font-bold text-gray-900">{actions.length}<span className="text-sm text-gray-400 ml-1">개</span></p>
              </Card>
            </div>
          )}

          {/* Charts */}
          {charts.filter(c => c.type !== 'kpi').length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6">
              {charts
                .filter(c => c.type === 'bar' || c.type === 'line' || c.type === 'pie')
                .map((chart) => (
                  <Card key={chart.id}>
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        {chart.type === 'pie' ? (
                          <PieChart>
                            <Pie
                              data={chart.data as unknown[]}
                              dataKey={chart.config.yKey || 'count'}
                              nameKey={chart.config.xKey || 'value'}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {(chart.data as unknown[]).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        ) : chart.type === 'line' ? (
                          <LineChart data={chart.data as unknown[]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={chart.config.xKey || 'date'} tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey={chart.config.yKey || 'value'} stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        ) : (
                          <BarChart data={chart.data as unknown[]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={chart.config.xKey || 'value'} tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey={chart.config.yKey || 'count'} radius={[4, 4, 0, 0]}>
                              {(chart.data as unknown[]).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </Card>
                ))}
            </div>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">AI 인사이트</h2>
                <span className="text-sm text-gray-400 ml-auto">{insights.length}개 발견</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {insights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    type={insight.type as any}
                    title={insight.title}
                    description={insight.description}
                    importance={insight.importance}
                    onDetailClick={() => {}}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">추천 액션</h2>
                <span className="text-sm text-gray-400 ml-auto">
                  {actions.filter(a => (actionStatuses[a.id] || a.status) === 'completed').length}/{actions.length} 완료
                </span>
              </div>
              <div className="space-y-4">
                {actions.map((action) => (
                  <ActionCard
                    key={action.id}
                    title={action.title}
                    description={action.description}
                    priority={action.priority}
                    status={(actionStatuses[action.id] || action.status) as Action['status']}
                    onStatusChange={(status) => handleActionStatusChange(action.id, status)}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Data Overview (collapsed) */}
          <details className="group">
            <summary className="cursor-pointer list-none">
              <Card className="hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                    <h3 className="font-medium text-gray-700">원본 데이터 통계</h3>
                    <span className="text-sm text-gray-400">
                      {analysis.row_count?.toLocaleString()}행 x {analysis.column_count}열
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-90" />
                </div>
              </Card>
            </summary>
            <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(analysis.summary?.numericColumns as any[] || []).map((col: any) => (
                <Card key={col.name} className="bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">{col.name}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>평균: <span className="text-gray-900 font-medium">{col.mean?.toLocaleString()}</span></div>
                    <div>중앙값: <span className="text-gray-900 font-medium">{col.median?.toLocaleString()}</span></div>
                    <div>최소: <span className="text-gray-900 font-medium">{col.min?.toLocaleString()}</span></div>
                    <div>최대: <span className="text-gray-900 font-medium">{col.max?.toLocaleString()}</span></div>
                  </div>
                </Card>
              ))}
            </div>
          </details>
        </>
      )}
    </div>
  );
}
