'use client';

import { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { Button, Card, Input, FileUpload } from '@repo/ui';
import { formatRelativeTime, formatBytes } from '@repo/utils';

// Mock data
const analyses = [
  {
    id: '1',
    name: 'sales_2024.xlsx',
    fileName: 'sales_2024.xlsx',
    fileSize: 3456789,
    status: 'completed' as const,
    rowCount: 10234,
    columnCount: 12,
    insightCount: 5,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'marketing_report.csv',
    fileName: 'marketing_report.csv',
    fileSize: 1234567,
    status: 'completed' as const,
    rowCount: 5621,
    columnCount: 8,
    insightCount: 3,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'inventory.xlsx',
    fileName: 'inventory.xlsx',
    fileSize: 2345678,
    status: 'processing' as const,
    rowCount: null,
    columnCount: null,
    insightCount: 0,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'customer_data.csv',
    fileName: 'customer_data.csv',
    fileSize: 567890,
    status: 'failed' as const,
    rowCount: null,
    columnCount: null,
    insightCount: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const filteredAnalyses = analyses.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = (file: File) => {
    setUploading(true);
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploading(false);
          setShowUploadModal(false);
          setUploadProgress(0);
        }, 500);
      }
    }, 200);
  };

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
              const status = statusConfig[analysis.status];
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
                        {analysis.name}
                      </Link>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.bgColor} ${status.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>{formatBytes(analysis.fileSize)}</span>
                      {analysis.rowCount && (
                        <>
                          <span>|</span>
                          <span>{analysis.rowCount.toLocaleString()}행</span>
                        </>
                      )}
                      {analysis.insightCount > 0 && (
                        <>
                          <span>|</span>
                          <span>인사이트 {analysis.insightCount}개</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-400 hidden sm:block">
                    {formatRelativeTime(analysis.createdAt)}
                  </div>

                  <div className="relative group">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10">
                      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <RefreshCw className="h-4 w-4" />
                        다시 분석
                      </button>
                      <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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
