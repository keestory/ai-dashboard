'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileSpreadsheet, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button, Card, FileUpload, Input } from '@repo/ui';
import { useAuth } from '@/contexts/auth-context';
import { trpc } from '@/lib/trpc';

export default function NewAnalysisPage() {
  const router = useRouter();
  const { profile } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [analysisName, setAnalysisName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // tRPC로 현재 워크스페이스 가져오기 (없으면 자동 생성)
  const { data: workspace, isLoading: workspaceLoading } = trpc.workspace.getCurrent.useQuery();
  const workspaceId = workspace?.id || null;

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    if (!analysisName) {
      setAnalysisName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }

    if (workspaceLoading) {
      setError('워크스페이스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!workspaceId) {
      setError('워크스페이스를 찾을 수 없습니다. 페이지를 새로고침하거나 다시 로그인해주세요.');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspaceId', workspaceId);

      // Use XMLHttpRequest for upload progress tracking
      const uploadResult = await new Promise<{ analysis: { id: string } }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 70); // 0-70% for upload
            setUploadProgress(percent);
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error('Invalid response'));
            }
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.error || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      setUploadProgress(75);

      // Trigger analysis (AI processing may take 10-30s)
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: uploadResult.analysis.id }),
        signal: AbortSignal.timeout(120000), // 2 min timeout
      });

      if (!analyzeResponse.ok) {
        const data = await analyzeResponse.json();
        console.error('Analysis error:', data.error);
        // Still navigate - analysis record exists, can retry later
      }

      setUploadProgress(100);

      // Navigate to analysis page
      router.push(`/analysis/${uploadResult.analysis.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '업로드에 실패했습니다.';
      // Translate common errors to Korean and provide actionable feedback
      const errorMap: Record<string, string> = {
        'File size exceeds limit': '파일 크기가 현재 플랜의 한도를 초과했습니다. 더 작은 파일을 선택하거나 플랜을 업그레이드하세요.',
        'Upload failed': '파일 업로드에 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.',
        'Analysis not found': '분석을 시작할 수 없습니다. 다시 시도해주세요.',
        'Invalid file type': '지원하지 않는 파일 형식입니다. Excel(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.',
        'No data found': '파일에 데이터가 없습니다. 파일 내용을 확인해주세요.',
      };

      const friendlyError = Object.keys(errorMap).find(key => errorMessage.includes(key));
      setError(friendlyError ? errorMap[friendlyError] : errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setFile(null);
    setAnalysisName('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/analysis" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">새 분석</h1>
          <p className="text-gray-500">Excel 또는 CSV 파일을 업로드하여 AI 분석을 시작하세요</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              파일 선택
            </label>
            <FileUpload
              accept={['.xlsx', '.xls', '.csv']}
              maxSize={(profile?.plan === 'free' ? 5 : profile?.plan === 'pro' ? 50 : 100) * 1024 * 1024}
              onUpload={handleFileSelect}
              uploading={uploading}
              progress={uploadProgress}
            />
          </div>

          {/* Analysis Name */}
          {file && (
            <Input
              label="분석 이름"
              placeholder="분석 이름을 입력하세요"
              value={analysisName}
              onChange={(e) => setAnalysisName(e.target.value)}
              required
            />
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 font-medium text-sm">오류가 발생했습니다</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <RefreshCw className="h-4 w-4" />
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Link href="/analysis">
              <Button variant="secondary" type="button">
                취소
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={!file || uploading || workspaceLoading || !workspaceId}
              loading={uploading || workspaceLoading}
            >
              {workspaceLoading ? '로딩 중...' : uploading ? (uploadProgress < 70 ? '업로드 중...' : uploadProgress < 100 ? 'AI 분석 중...' : '완료!') : '분석 시작'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Tips */}
      <Card className="mt-6 bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-3">팁</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <FileSpreadsheet className="h-4 w-4 mt-0.5 text-gray-400" />
            첫 번째 행은 컬럼 헤더로 사용됩니다
          </li>
          <li className="flex items-start gap-2">
            <FileSpreadsheet className="h-4 w-4 mt-0.5 text-gray-400" />
            날짜 형식은 YYYY-MM-DD를 권장합니다
          </li>
          <li className="flex items-start gap-2">
            <FileSpreadsheet className="h-4 w-4 mt-0.5 text-gray-400" />
            숫자 컬럼에는 숫자만 입력해주세요
          </li>
          <li className="flex items-start gap-2">
            <FileSpreadsheet className="h-4 w-4 mt-0.5 text-gray-400" />
            {profile?.plan === 'free'
              ? '무료 플랜은 최대 5MB까지 업로드 가능합니다'
              : `현재 플랜에서는 최대 ${profile?.plan === 'pro' ? '50' : '100'}MB까지 업로드 가능합니다`}
          </li>
        </ul>
      </Card>
    </div>
  );
}
