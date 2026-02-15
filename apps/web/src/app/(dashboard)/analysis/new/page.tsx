'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button, Card, FileUpload, Input } from '@repo/ui';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';

export default function NewAnalysisPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analysisName, setAnalysisName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get default workspace
    const fetchWorkspace = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
        .single();

      if (data) {
        setWorkspaceId((data as { id: string }).id);
      }
    };

    fetchWorkspace();
  }, [user]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    if (!analysisName) {
      setAnalysisName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !workspaceId) {
      setError('파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspaceId', workspaceId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { analysis } = await response.json();

      // Trigger analysis
      await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: analysis.id }),
      });

      // Navigate to analysis page
      router.push(`/analysis/${analysis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
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
              disabled={!file || uploading}
              loading={uploading}
            >
              {uploading ? '업로드 중...' : '분석 시작'}
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
