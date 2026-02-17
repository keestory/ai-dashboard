'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Target,
  Loader2,
  AlertCircle,
  Users,
  UserCog,
  Crown,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
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
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

const ROLE_INFO: Record<string, { label: string; icon: typeof Users; color: string }> = {
  team_member: { label: '팀원 관점', icon: Users, color: 'blue' },
  team_lead: { label: '팀장 관점', icon: UserCog, color: 'emerald' },
  executive: { label: '임원 관점', icon: Crown, color: 'purple' },
};

const DEPT_LABELS: Record<string, string> = {
  sales: '영업', marketing: '마케팅', biz_dev: '사업개발', pr: 'PR',
  strategy: '전략', finance: '재무', accounting: '회계', legal: '법무',
  service_planning: '서비스 기획', development: '개발', product_design: '프로덕트 디자인',
  content_planning: '콘텐츠 기획', content_design: '콘텐츠 디자인',
  operations: '운영', logistics: '물류', cs: 'CS(CX)',
  hr: '인사', other: '기타',
};

interface ShareData {
  id: string;
  name: string;
  description: string | null;
  file_name: string;
  row_count: number | null;
  column_count: number | null;
  summary: {
    businessKPIs?: { label: string; value: string; change?: string; changeType?: string }[];
    executiveSummary?: string;
    numericColumns?: any[];
  } | null;
  created_at: string;
  insights: { id: string; type: string; title: string; description: string; importance: string }[];
  charts: { id: string; type: string; title: string; config: { xKey?: string; yKey?: string }; data: unknown }[];
  actions: { id: string; title: string; description: string; priority: string; status: string }[];
}

export default function SharePage() {
  const params = useParams();
  const analysisId = params.id as string;

  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/share/${analysisId}`);
        if (!res.ok) throw new Error('Not found');
        const json = await res.json();
        setData(json.analysis);
      } catch {
        setError('분석 결과를 찾을 수 없거나 공유되지 않은 분석입니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [analysisId]);

  const analysisRole = data?.description?.match(/role:(\w+)\|/)?.[1] || null;
  const roleInfo = analysisRole ? ROLE_INFO[analysisRole] : null;
  const analysisDept = data?.description?.match(/dept:(\w+)\|/)?.[1] || null;
  const deptLabel = analysisDept ? DEPT_LABELS[analysisDept] : null;

  const businessKPIs = data?.summary?.businessKPIs || [];
  const executiveSummary = data?.summary?.executiveSummary || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">분석 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">분석을 찾을 수 없습니다</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            InsightFlow 시작하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">InsightFlow</span>
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            무료로 시작하기
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
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
            {deptLabel && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {deptLabel}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {data.row_count?.toLocaleString()}행 x {data.column_count}열 | {new Date(data.created_at).toLocaleDateString('ko-KR')}
          </p>
        </div>

        {/* Executive Summary */}
        {executiveSummary && (
          <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">AI 분석 요약</h2>
                <p className="text-gray-700 leading-relaxed text-sm">{executiveSummary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Business KPIs */}
        {businessKPIs.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {businessKPIs.map((kpi, index) => (
              <div key={index} className="bg-white rounded-xl border p-4">
                <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
                {kpi.change && (
                  <p className={`text-xs mt-1 ${
                    kpi.changeType === 'positive' ? 'text-emerald-600' :
                    kpi.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {kpi.change}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        {data.charts.filter(c => c.type !== 'kpi').length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6">
            {data.charts
              .filter(c => c.type === 'bar' || c.type === 'line' || c.type === 'pie')
              .map((chart) => (
                <div key={chart.id} className="bg-white rounded-xl border p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">{chart.title}</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      {chart.type === 'pie' ? (
                        <PieChart>
                          <Pie
                            data={chart.data as unknown[]}
                            dataKey={chart.config.yKey || 'count'}
                            nameKey={chart.config.xKey || 'value'}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
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
                          <XAxis dataKey={chart.config.xKey || 'date'} tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey={chart.config.yKey || 'value'} stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      ) : (
                        <BarChart data={chart.data as unknown[]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={chart.config.xKey || 'value'} tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
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
                </div>
              ))}
          </div>
        )}

        {/* Insights */}
        {data.insights.length > 0 && (
          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">AI 인사이트</h2>
              <span className="text-sm text-gray-400 ml-auto">{data.insights.length}개</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {data.insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-xl border ${
                    insight.importance === 'critical' ? 'border-red-200 bg-red-50' :
                    insight.importance === 'high' ? 'border-amber-200 bg-amber-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      insight.importance === 'critical' ? 'bg-red-100 text-red-700' :
                      insight.importance === 'high' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {insight.importance === 'critical' ? '긴급' :
                       insight.importance === 'high' ? '중요' :
                       insight.importance === 'medium' ? '보통' : '참고'}
                    </span>
                    <span className="text-xs text-gray-400">{insight.type}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {data.actions.length > 0 && (
          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">추천 액션</h2>
            </div>
            <div className="space-y-3">
              {data.actions.map((action) => (
                <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <span className={`mt-0.5 text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                    action.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    action.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {action.priority === 'urgent' ? '긴급' :
                     action.priority === 'high' ? '높음' :
                     action.priority === 'medium' ? '보통' : '낮음'}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">내 데이터도 이렇게 분석받고 싶다면?</h3>
          <p className="text-blue-100 text-sm mb-6">
            Excel 파일만 올리면 30초 만에 AI가 비즈니스 인사이트를 생성합니다
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
          >
            무료로 시작하기 — 월 3회 무료
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600">InsightFlow</Link>
          <span className="mx-2">·</span>
          AI 기반 비즈니스 데이터 분석
        </div>
      </footer>
    </div>
  );
}
