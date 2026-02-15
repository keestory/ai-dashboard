'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Download, Trash2, Plus, Loader2 } from 'lucide-react';
import { Button, Card } from '@repo/ui';
import { formatRelativeTime } from '@repo/utils';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';

interface Report {
  id: string;
  name: string;
  template: string;
  pdf_url: string | null;
  created_at: string;
  analyses: {
    id: string;
    name: string;
  };
}

export default function ReportsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        analyses(id, name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReports(data as Report[]);
    }
    setLoading(false);
  };

  const handleDownload = async (report: Report) => {
    if (!report.pdf_url) return;

    const { data, error } = await supabase.storage
      .from('reports')
      .createSignedUrl(report.pdf_url, 3600);

    if (!error && data) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('리포트를 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (!error) {
      setReports(reports.filter(r => r.id !== reportId));
    }
  };

  const templateLabels: Record<string, string> = {
    summary: '요약 리포트',
    detailed: '상세 리포트',
    comparison: '비교 리포트',
    custom: '커스텀 리포트',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">리포트</h1>
          <p className="text-gray-500">분석 결과를 리포트로 생성하고 공유하세요</p>
        </div>
        <Link href="/analysis">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            새 리포트
          </Button>
        </Link>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">아직 생성된 리포트가 없습니다</p>
            <Link href="/analysis">
              <Button variant="secondary">분석에서 리포트 생성하기</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {report.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {templateLabels[report.template]} | {report.analyses?.name}
                  </p>
                </div>
                <span className="text-sm text-gray-400 hidden sm:block">
                  {formatRelativeTime(report.created_at)}
                </span>
                <div className="flex items-center gap-2">
                  {report.pdf_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(report)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(report.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
