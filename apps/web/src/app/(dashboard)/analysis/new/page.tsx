'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileSpreadsheet, AlertCircle, RefreshCw, Loader2, Users, UserCog, Crown, Check, Zap, CheckCircle2 } from 'lucide-react';
import { Button, Card, FileUpload, Input } from '@repo/ui';
import { useAuth } from '@/contexts/auth-context';
import { trpc } from '@/lib/trpc';

const ROLES = [
  {
    id: 'team_member' as const,
    label: '팀원',
    icon: Users,
    description: '실무 중심 분석',
    detail: '업무에 바로 활용할 수 있는 데이터 패턴, 이상치 탐지, 작업 효율화 포인트를 제공합니다.',
    color: 'blue',
  },
  {
    id: 'team_lead' as const,
    label: '팀장',
    icon: UserCog,
    description: '팀 성과 관리 분석',
    detail: '팀 KPI 달성률, 리소스 배분 최적화, 병목 구간 파악 등 팀 운영에 필요한 인사이트를 제공합니다.',
    color: 'emerald',
  },
  {
    id: 'executive' as const,
    label: '임원',
    icon: Crown,
    description: '전략적 의사결정 분석',
    detail: '핵심 비즈니스 지표, 시장 트렌드, 전략적 리스크와 기회를 경영진 관점에서 분석합니다.',
    color: 'purple',
  },
] as const;

type RoleType = typeof ROLES[number]['id'];

export default function NewAnalysisPage() {
  const router = useRouter();
  const { profile } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [analysisName, setAnalysisName] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('team_member');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [showUpgradeNudge, setShowUpgradeNudge] = useState(false);

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
      formData.append('role', selectedRole);

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
        body: JSON.stringify({ analysisId: uploadResult.analysis.id, role: selectedRole }),
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

      // Check if this is a plan limit error (monthly analysis limit)
      if (errorMessage.includes('무료 분석 한도') || errorMessage.includes('한도를 초과')) {
        setShowUpgradeNudge(true);
        return;
      }

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

          {/* Role Selection */}
          {file && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                분석 관점 선택
              </label>
              <p className="text-xs text-gray-500 mb-3">
                선택한 역할에 따라 AI가 다른 관점으로 데이터를 분석합니다
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? role.color === 'blue'
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : role.color === 'emerald'
                            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                            : 'border-purple-500 bg-purple-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && (
                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${
                          role.color === 'blue' ? 'bg-blue-500' :
                          role.color === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500'
                        }`}>
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                        isSelected
                          ? role.color === 'blue' ? 'bg-blue-100' :
                            role.color === 'emerald' ? 'bg-emerald-100' : 'bg-purple-100'
                          : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          isSelected
                            ? role.color === 'blue' ? 'text-blue-600' :
                              role.color === 'emerald' ? 'text-emerald-600' : 'text-purple-600'
                            : 'text-gray-500'
                        }`} />
                      </div>
                      <p className={`font-semibold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {role.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${isSelected ? 'text-gray-700' : 'text-gray-500'}`}>
                        {role.description}
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {ROLES.find(r => r.id === selectedRole)?.detail}
              </p>
            </div>
          )}

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

      {/* Upgrade Nudge Modal */}
      {showUpgradeNudge && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                이번 달 무료 분석을 모두 사용했습니다
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                무료 플랜은 월 3회까지 분석할 수 있습니다.
                <br />
                Pro 플랜으로 업그레이드하면 무제한으로 분석하세요.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-gray-900 mb-3">Pro 플랜 혜택</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    무제한 분석
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    최대 50MB 파일 업로드
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    PDF 리포트 내보내기
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    심층 AI 인사이트
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/settings"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  Pro 플랜 시작하기 — ₩19,000/월
                </Link>
                <button
                  onClick={() => setShowUpgradeNudge(false)}
                  className="w-full px-6 py-3 text-gray-500 font-medium rounded-xl hover:bg-gray-100 transition-colors text-sm"
                >
                  다음 달에 다시 사용하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
