'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button, Card, KPICard, InsightCard, ActionCard } from '@repo/ui';
import { formatRelativeTime, formatBytes } from '@repo/utils';
import { createClient } from '@/lib/supabase/client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

interface Analysis {
  id: string;
  name: string;
  file_name: string;
  file_size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  row_count: number | null;
  column_count: number | null;
  summary: unknown;
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

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchAnalysis();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`analysis-${analysisId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analyses',
          filter: `id=eq.${analysisId}`,
        },
        (payload) => {
          setAnalysis(payload.new as Analysis);
          if (payload.new.status === 'completed') {
            fetchRelatedData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [analysisId]);

  const fetchAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', analysisId)
        .single();

      if (error) throw error;
      const analysisData = data as Analysis;
      setAnalysis(analysisData);

      if (analysisData.status === 'completed') {
        await fetchRelatedData();
      }
    } catch (err) {
      setError('분석을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    const [insightsRes, chartsRes, actionsRes] = await Promise.all([
      supabase.from('insights').select('*').eq('analysis_id', analysisId),
      supabase.from('charts').select('*').eq('analysis_id', analysisId).order('position'),
      supabase.from('actions').select('*').eq('analysis_id', analysisId),
    ]);

    if (insightsRes.data) setInsights(insightsRes.data as Insight[]);
    if (chartsRes.data) setCharts(chartsRes.data as ChartData[]);
    if (actionsRes.data) setActions(actionsRes.data as Action[]);
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId }),
      });

      if (!response.ok) throw new Error('Failed to reanalyze');

      await fetchAnalysis();
    } catch (err) {
      console.error(err);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleActionStatusChange = async (actionId: string, status: string) => {
    const { error } = await supabase
      .from('actions')
      .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null } as never)
      .eq('id', actionId);

    if (!error) {
      setActions(actions.map(a =>
        a.id === actionId ? { ...a, status: status as Action['status'] } : a
      ));
    }
  };

  const handleGenerateReport = async () => {
    router.push(`/reports/new?analysisId=${analysisId}`);
  };

  if (loading) {
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
        <p className="text-gray-600">{error || '분석을 찾을 수 없습니다.'}</p>
        <Link href="/analysis">
          <Button variant="secondary" className="mt-4">
            목록으로 돌아가기
          </Button>
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
            <h1 className="text-2xl font-bold text-gray-900">{analysis.name}</h1>
            <p className="text-gray-500">
              {formatBytes(analysis.file_size)} | {formatRelativeTime(analysis.created_at)}
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
            onClick={handleGenerateReport}
          >
            리포트 생성
          </Button>
        </div>
      </div>

      {/* Processing State */}
      {(analysis.status === 'pending' || analysis.status === 'processing') && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">분석 진행 중...</p>
              <p className="text-sm text-blue-700">
                잠시만 기다려주세요. 분석이 완료되면 자동으로 결과가 표시됩니다.
              </p>
            </div>
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
              <p className="text-sm text-red-700">
                파일 분석 중 오류가 발생했습니다. 파일 형식을 확인하고 다시 시도해주세요.
              </p>
            </div>
            <Button onClick={handleReanalyze} loading={reanalyzing}>
              다시 시도
            </Button>
          </div>
        </Card>
      )}

      {/* Completed State */}
      {analysis.status === 'completed' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="총 행"
              value={analysis.row_count?.toLocaleString() || '-'}
            />
            <KPICard
              title="총 열"
              value={analysis.column_count?.toString() || '-'}
            />
            <KPICard
              title="인사이트"
              value={insights.length}
            />
            <KPICard
              title="액션 아이템"
              value={actions.length}
            />
          </div>

          {/* Charts */}
          {charts.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6">
              {charts
                .filter(c => c.type === 'bar' || c.type === 'line')
                .map((chart) => (
                  <Card key={chart.id}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {chart.title}
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        {chart.type === 'bar' ? (
                          <BarChart data={chart.data as unknown[]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={chart.config.xKey || 'value'} />
                            <YAxis />
                            <Tooltip />
                            <Bar
                              dataKey={chart.config.yKey || 'count'}
                              fill="#3B82F6"
                            />
                          </BarChart>
                        ) : (
                          <LineChart data={chart.data as unknown[]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={chart.config.xKey || 'date'} />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey={chart.config.yKey || 'value'}
                              stroke="#3B82F6"
                              strokeWidth={2}
                            />
                          </LineChart>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                AI 인사이트
              </h2>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                추천 액션
              </h2>
              <div className="space-y-4">
                {actions.map((action) => (
                  <ActionCard
                    key={action.id}
                    title={action.title}
                    description={action.description}
                    priority={action.priority}
                    status={action.status}
                    onStatusChange={(status) =>
                      handleActionStatusChange(action.id, status)
                    }
                  />
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
