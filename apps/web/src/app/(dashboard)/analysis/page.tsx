'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  FileBarChart,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button, Card, FileUpload } from '@repo/ui';
import { formatRelativeTime, formatBytes } from '@repo/utils';
import { trpc } from '@/lib/trpc';

const statusConfig = {
  completed: {
    icon: CheckCircle,
    label: '완료',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  processing: {
    icon: Clock,
    label: '처리중',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  pending: {
    icon: Clock,
    label: '대기중',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  failed: {
    icon: XCircle,
    label: '실패',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

export default function AnalysisPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Optimized: Single query to get workspace + analyses (eliminates waterfall)
  const { data, isLoading, refetch } = trpc.analysis.listForCurrentUser.useQuery(
    { limit: 50 }
  );

  const workspaceId = data?.workspace?.id;
  const analyses = data?.items || [];

  // Delete mutation
  const deleteMutation = trpc.analysis.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Rerun mutation
  const rerunMutation = trpc.analysis.rerun.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Filter analyses by search query
  const filteredAnalyses = useMemo(() => {
    return analyses.filter((a) =>
      (a.name || a.file_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [analyses, searchQuery]);

  // Ensure workspace mutation (creates workspace if none exists)
  const ensureWorkspace = trpc.workspace.getCurrent.useQuery(undefined, {
    enabled: false, // Only run when manually triggered
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(10);

    try {
      // Ensure workspace exists
      let currentWorkspaceId = workspaceId;
      if (!currentWorkspaceId) {
        const result = await ensureWorkspace.refetch();
        currentWorkspaceId = result.data?.id;
        if (!currentWorkspaceId) {
          throw new Error('워크스페이스를 생성할 수 없습니다.');
        }
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspaceId', currentWorkspaceId);

      setUploadProgress(30);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { analysis } = await response.json();
      setUploadProgress(60);

      // Trigger analysis
      await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: analysis.id }),
      });

      setUploadProgress(100);

      setTimeout(() => {
        setUploading(false);
        setShowUploadModal(false);
        setUploadProgress(0);
        router.push(`/analysis/${analysis.id}`);
      }, 500);
    } catch (err) {
      console.error('Upload error:', err);
      setUploading(false);
      setUploadProgress(0);
      alert(err instanceof Error ? err.message : '업로드에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('이 분석을 삭제하시겠습니까?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleRerun = async (id: string) => {
    rerunMutation.mutate({ id });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">분석</h1>
            <p className="text-gray-500">파일을 업로드하고 AI 인사이트를 받으세요</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">분석 목록 로딩중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">분석</h1>
          <p className="text-gray-500">파일을 업로드하고 AI 인사이트를 받으세요</p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowUploadModal(true)}
        >
          새 분석
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="분석 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button variant="secondary" leftIcon={<Filter className="h-4 w-4" />}>
          필터
        </Button>
      </div>

      {/* Analysis List */}
      <Card padding="none">
        <div className="divide-y divide-gray-200">
          {filteredAnalyses.length === 0 ? (
            <div className="py-12 text-center">
              <FileBarChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">분석이 없습니다</p>
              <Button
                className="mt-4"
                onClick={() => setShowUploadModal(true)}
              >
                첫 분석 시작하기
              </Button>
            </div>
          ) : (
            filteredAnalyses.map((analysis) => {
              const statusKey = (analysis.status || 'pending') as keyof typeof statusConfig;
              const status = statusConfig[statusKey] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={analysis.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileBarChart className="h-5 w-5 text-primary-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/analysis/${analysis.id}`}
                        className="font-medium text-gray-900 hover:text-primary-600 truncate"
                      >
                        {analysis.name || analysis.file_name}
                      </Link>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.bgColor} ${status.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>{formatBytes(analysis.file_size || 0)}</span>
                      {analysis.row_count && (
                        <>
                          <span>|</span>
                          <span>{analysis.row_count.toLocaleString()}행</span>
                        </>
                      )}
                      {analysis.column_count && (
                        <>
                          <span>|</span>
                          <span>{analysis.column_count}열</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-400 hidden sm:block">
                    {formatRelativeTime(analysis.created_at)}
                  </div>

                  <div className="relative group">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10">
                      <button
                        onClick={() => handleRerun(analysis.id)}
                        disabled={rerunMutation.isPending}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-4 w-4 ${rerunMutation.isPending ? 'animate-spin' : ''}`} />
                        다시 분석
                      </button>
                      <button
                        onClick={() => handleDelete(analysis.id)}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">새 분석</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <FileUpload
              onUpload={handleUpload}
              uploading={uploading}
              progress={uploadProgress}
              maxSize={50 * 1024 * 1024}
            />

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowUploadModal(false)}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
