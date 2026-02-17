'use client';

import { useState } from 'react';
import { User, Bell, CreditCard, Shield, Loader2, Check, Users } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, Input } from '@repo/ui';
import { useAuth } from '@/contexts/auth-context';
import { trpc } from '@/lib/trpc';

type Tab = 'profile' | 'workspace' | 'notifications' | 'billing' | 'security';

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const updateSettingsMutation = trpc.auth.updateSettings.useMutation();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Profile form state
  const [name, setName] = useState(profile?.name || '');
  const [company, setCompany] = useState(profile?.company || '');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const tabs = [
    { id: 'profile' as Tab, label: '프로필', icon: User },
    { id: 'workspace' as Tab, label: '워크스페이스', icon: Users },
    { id: 'notifications' as Tab, label: '알림', icon: Bell },
    { id: 'billing' as Tab, label: '결제', icon: CreditCard },
    { id: 'security' as Tab, label: '보안', icon: Shield },
  ];

  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccess(false);

    const { error } = await updateProfile({ name, company });

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      await updateSettingsMutation.mutateAsync({
        settings: {
          notifications: {
            email: emailNotifications,
            analysisComplete,
            weeklyReport,
          },
        },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // silently fail
    }

    setSaving(false);
  };

  const planLabels: Record<string, string> = {
    free: '무료',
    pro: '프로',
    enterprise: '엔터프라이즈',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-500">계정 및 앱 설정을 관리하세요</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <Card padding="none">
            <nav className="divide-y divide-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">프로필 설정</h2>
              <div className="space-y-4 max-w-md">
                <Input
                  label="이메일"
                  value={user?.email || ''}
                  disabled
                  helperText="이메일은 변경할 수 없습니다"
                />
                <Input
                  label="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                />
                <Input
                  label="회사/조직"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="회사 또는 조직명을 입력하세요"
                />
                <div className="pt-4">
                  <Button onClick={handleSaveProfile} loading={saving}>
                    {success ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        저장됨
                      </>
                    ) : (
                      '저장'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Workspace Tab */}
          {activeTab === 'workspace' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">워크스페이스 설정</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  팀원을 초대하고 권한을 관리하세요. 워크스페이스를 통해 분석 결과를 공유할 수 있습니다.
                </p>
                <Link href="/settings/workspace">
                  <Button leftIcon={<Users className="h-4 w-4" />}>
                    워크스페이스 관리
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">알림 설정</h2>
              <div className="space-y-6 max-w-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">이메일 알림</p>
                    <p className="text-sm text-gray-500">알림을 이메일로 받습니다</p>
                  </div>
                  <Toggle
                    checked={emailNotifications}
                    onChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">분석 완료 알림</p>
                    <p className="text-sm text-gray-500">분석이 완료되면 알림을 받습니다</p>
                  </div>
                  <Toggle
                    checked={analysisComplete}
                    onChange={setAnalysisComplete}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">주간 리포트</p>
                    <p className="text-sm text-gray-500">매주 분석 요약을 받습니다</p>
                  </div>
                  <Toggle
                    checked={weeklyReport}
                    onChange={setWeeklyReport}
                  />
                </div>
                <div className="pt-4">
                  <Button onClick={handleSaveNotifications} loading={saving}>
                    {success ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        저장됨
                      </>
                    ) : (
                      '저장'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">현재 플랜</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {planLabels[profile?.plan || 'free']} 플랜
                    </p>
                    <p className="text-sm text-gray-500">
                      {profile?.plan === 'free'
                        ? '월 10회 분석, 5MB 파일 제한'
                        : profile?.plan === 'pro'
                        ? '무제한 분석, 50MB 파일 제한'
                        : '무제한 분석, 100MB 파일 제한, 팀 기능'}
                    </p>
                  </div>
                  {profile?.plan === 'free' && (
                    <Button>업그레이드</Button>
                  )}
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">사용량</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">이번 달 분석 횟수</span>
                      <span className="font-medium">
                        {profile?.usage_count || 0} / {profile?.plan === 'free' ? '10' : '무제한'}
                      </span>
                    </div>
                    {profile?.plan === 'free' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.min(((profile?.usage_count || 0) / 10) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">저장 용량</span>
                      <span className="font-medium">
                        {formatBytes(profile?.storage_used || 0)} / {profile?.plan === 'free' ? '100MB' : profile?.plan === 'pro' ? '10GB' : '100GB'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${Math.min(getStoragePercent(profile?.storage_used || 0, profile?.plan || 'free'), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {profile?.plan !== 'free' && (
                <Card>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 내역</h2>
                  <p className="text-gray-500 text-sm">결제 내역이 없습니다.</p>
                </Card>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">비밀번호 변경</h2>
                <div className="space-y-4 max-w-md">
                  <Input
                    label="현재 비밀번호"
                    type="password"
                    placeholder="현재 비밀번호를 입력하세요"
                  />
                  <Input
                    label="새 비밀번호"
                    type="password"
                    placeholder="새 비밀번호를 입력하세요"
                  />
                  <Input
                    label="새 비밀번호 확인"
                    type="password"
                    placeholder="새 비밀번호를 다시 입력하세요"
                  />
                  <div className="pt-4">
                    <Button>비밀번호 변경</Button>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">연결된 계정</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">Google</span>
                    </div>
                    <Button variant="secondary" size="sm">연결</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <path d="M12 3C7.5 3 3.75 6.15 3.75 10.05c0 2.4 1.5 4.5 3.75 5.85l-.75 3.6 3.9-2.1c.45.075.9.15 1.35.15 4.5 0 8.25-3.15 8.25-7.05S16.5 3 12 3z" fill="#3C1E1E"/>
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">Kakao</span>
                    </div>
                    <Button variant="secondary" size="sm">연결</Button>
                  </div>
                </div>
              </Card>

              <Card className="border-red-200">
                <h2 className="text-lg font-semibold text-red-600 mb-4">위험 구역</h2>
                <p className="text-sm text-gray-600 mb-4">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 취소할 수 없습니다.
                </p>
                <Button variant="secondary" className="text-red-600 border-red-300 hover:bg-red-50">
                  계정 삭제
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getStoragePercent(used: number, plan: string): number {
  const limits: Record<string, number> = {
    free: 100 * 1024 * 1024,
    pro: 10 * 1024 * 1024 * 1024,
    enterprise: 100 * 1024 * 1024 * 1024,
  };
  return (used / limits[plan]) * 100;
}
