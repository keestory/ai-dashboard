'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { Button, Card, Input } from '@repo/ui';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';

interface Analysis {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

type Template = 'summary' | 'detailed' | 'comparison' | 'custom';

function NewReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabase = createClient();

  const preselectedAnalysisId = searchParams.get('analysisId');

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(preselectedAnalysisId || '');
  const [reportName, setReportName] = useState('');
  const [template, setTemplate] = useState<Template>('summary');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyses();
  }, [user]);

  const fetchAnalyses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('analyses')
      .select('id, name, status, created_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnalyses(data);
      if (preselectedAnalysisId) {
        const selected = data.find(a => a.id === preselectedAnalysisId);
        if (selected) {
          setReportName(`${selected.name} 리포트`);
        }
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAnalysisId) {
      setError('분석을 선택해주세요.');
      return;
    }

    if (!reportName.trim()) {
      setError('리포트 이름을 입력해주세요.');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      // Create report record
      const { data: report, error: createError } = await supabase
        .from('reports')
        .insert({
          user_id: user?.id,
          analysis_id: selectedAnalysisId,
          name: reportName,
          template: template,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Generate PDF (this would be handled by an API route)
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id }),
      });

      if (!response.ok) {
        // Still navigate even if PDF generation fails
        console.error('PDF generation failed');
      }

      router.push('/reports');
    } catch (err) {
      setError(err instanceof Error ? err.message : '리포트 생성에 실패했습니다.');
      setGenerating(false);
    }
  };

  const templates = [
    {
      id: 'summary' as Template,
      title: '요약 리포트',
      description: '핵심 인사이트와 KPI를 한눈에 보여주는 1페이지 요약',
    },
    {
      id: 'detailed' as Template,
      title: '상세 리포트',
      description: '모든 분석 결과와 차트를 포함한 상세 리포트',
    },
    {
      id: 'comparison' as Template,
      title: '비교 리포트',
      description: '여러 기간 또는 카테고리 간 비교 분석',
    },
    {
      id: 'custom' as Template,
      title: '커스텀 리포트',
      description: '원하는 섹션만 선택하여 구성',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/reports" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">새 리포트</h1>
          <p className="text-gray-500">분석 결과를 PDF 리포트로 생성하세요</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select Analysis */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">분석 선택</h2>
          {analyses.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">완료된 분석이 없습니다</p>
              <Link href="/analysis/new">
                <Button variant="secondary">새 분석 시작하기</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {analyses.map((analysis) => (
                <label
                  key={analysis.id}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnalysisId === analysis.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="analysis"
                    value={analysis.id}
                    checked={selectedAnalysisId === analysis.id}
                    onChange={(e) => {
                      setSelectedAnalysisId(e.target.value);
                      if (!reportName) {
                        setReportName(`${analysis.name} 리포트`);
                      }
                    }}
                    className="h-4 w-4 text-primary-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{analysis.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(analysis.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </Card>

        {/* Report Name */}
        <Card>
          <Input
            label="리포트 이름"
            placeholder="리포트 이름을 입력하세요"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            required
          />
        </Card>

        {/* Template Selection */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">템플릿 선택</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {templates.map((t) => (
              <label
                key={t.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  template === t.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="template"
                    value={t.id}
                    checked={template === t.id}
                    onChange={(e) => setTemplate(e.target.value as Template)}
                    className="h-4 w-4 mt-1 text-primary-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{t.title}</p>
                    <p className="text-sm text-gray-500">{t.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/reports">
            <Button variant="secondary" type="button">
              취소
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={!selectedAnalysisId || generating}
            loading={generating}
          >
            {generating ? '생성 중...' : '리포트 생성'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>}>
      <NewReportContent />
    </Suspense>
  );
}
