'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  Eye,
  Loader2,
  Mail,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button, Card, Input } from '@repo/ui';
import { useAuth } from '@/contexts/auth-context';
import { trpc } from '@/lib/trpc';

interface WorkspaceMember {
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  profiles: {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
  };
}

export default function WorkspaceSettingsPage() {
  const { user } = useAuth();

  const { data: currentWorkspace, isLoading: loadingWorkspace } = trpc.workspace.getCurrent.useQuery();
  const workspaceId = currentWorkspace?.id;

  const { data: workspaceData, isLoading: loadingDetails, refetch } = trpc.workspace.getById.useQuery(
    { id: workspaceId! },
    { enabled: !!workspaceId }
  );

  const workspace = workspaceData as any;
  const loading = loadingWorkspace || (!!workspaceId && loadingDetails);

  const inviteMutation = trpc.workspace.invite.useMutation({
    onSuccess: () => refetch(),
  });
  const removeMemberMutation = trpc.workspace.removeMember.useMutation({
    onSuccess: () => refetch(),
  });
  const updateRoleMutation = trpc.workspace.updateMemberRole.useMutation({
    onSuccess: () => refetch(),
  });

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !inviteEmail.trim()) return;

    setError('');
    setSuccess('');

    try {
      await inviteMutation.mutateAsync({
        workspaceId: workspace.id,
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setSuccess(`${inviteEmail}님을 초대했습니다.`);
      setInviteEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '초대에 실패했습니다.');
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!workspace) return;
    if (!confirm(`${memberEmail}님을 워크스페이스에서 제거하시겠습니까?`)) return;

    try {
      await removeMemberMutation.mutateAsync({
        workspaceId: workspace.id,
        userId: memberId,
      });
    } catch {
      // silently fail
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    if (!workspace) return;

    try {
      await updateRoleMutation.mutateAsync({
        workspaceId: workspace.id,
        userId: memberId,
        role: newRole,
      });
    } catch {
      // silently fail
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-400" />;
      default:
        return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return '소유자';
      case 'admin':
        return '관리자';
      case 'viewer':
        return '뷰어';
      default:
        return '멤버';
    }
  };

  const isOwner = workspace?.owner_id === user?.id;
  const members = (workspace?.workspace_members || []) as WorkspaceMember[];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            워크스페이스가 없습니다
          </h2>
          <p className="text-gray-500 mb-6">
            첫 번째 분석을 시작하면 자동으로 워크스페이스가 생성됩니다.
          </p>
          <Link href="/analysis/new">
            <Button>분석 시작하기</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">워크스페이스 설정</h1>
          <p className="text-gray-500">{workspace.name}</p>
        </div>
      </div>

      {/* Invite Member */}
      {isOwner && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            팀원 초대
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="이메일 주소 입력"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                  required
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="admin">관리자</option>
                <option value="member">멤버</option>
                <option value="viewer">뷰어</option>
              </select>
            </div>
            <Button type="submit" loading={inviteMutation.isPending}>
              초대하기
            </Button>
          </form>

          <div className="mt-4 text-sm text-gray-500">
            <p><strong>관리자:</strong> 분석 생성/삭제, 멤버 관리 가능</p>
            <p><strong>멤버:</strong> 분석 생성/보기 가능</p>
            <p><strong>뷰어:</strong> 분석 보기만 가능</p>
          </div>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          팀원 ({members.length + 1}명)
        </h2>

        <div className="space-y-3">
          {/* Owner (always first) */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {user?.id === workspace.owner_id ? '나 (소유자)' : '소유자'}
              </p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
              <Crown className="h-4 w-4" />
              소유자
            </span>
          </div>

          {/* Other Members */}
          {members
            .filter(m => m.user_id !== workspace.owner_id)
            .map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {member.profiles?.avatar_url ? (
                    <img
                      src={member.profiles.avatar_url}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    getRoleIcon(member.role)
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {member.profiles?.name || member.profiles?.email}
                  </p>
                  <p className="text-sm text-gray-500">{member.profiles?.email}</p>
                </div>

                {isOwner ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleChangeRole(member.user_id, e.target.value as 'admin' | 'member' | 'viewer')
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="admin">관리자</option>
                      <option value="member">멤버</option>
                      <option value="viewer">뷰어</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveMember(member.user_id, member.profiles?.email)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    {getRoleIcon(member.role)}
                    {getRoleLabel(member.role)}
                  </span>
                )}
              </div>
            ))}
        </div>
      </Card>

      {/* Danger Zone */}
      {isOwner && (
        <Card className="border-red-200">
          <h2 className="text-lg font-semibold text-red-600 mb-4">위험 영역</h2>
          <p className="text-sm text-gray-600 mb-4">
            워크스페이스를 삭제하면 모든 분석, 리포트, 인사이트가 영구적으로 삭제됩니다.
            이 작업은 되돌릴 수 없습니다.
          </p>
          <Button
            variant="secondary"
            onClick={() => alert('워크스페이스 삭제 기능은 추후 지원 예정입니다.')}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            워크스페이스 삭제
          </Button>
        </Card>
      )}
    </div>
  );
}
