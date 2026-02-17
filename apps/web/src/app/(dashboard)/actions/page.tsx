'use client';

import { useState, useMemo } from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle, Filter, Loader2 } from 'lucide-react';
import { Button, Card } from '@repo/ui';
import { formatRelativeTime } from '@repo/utils';
import { trpc } from '@/lib/trpc';

interface Action {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  created_at: string;
  completed_at: string | null;
  analyses: {
    id: string;
    name: string;
  };
}

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'completed' | 'dismissed';
type FilterPriority = 'all' | 'urgent' | 'high' | 'medium' | 'low';

export default function ActionsPage() {
  const { data: actionsData, isLoading: loading, refetch } = trpc.action.list.useQuery({});
  const actions = (actionsData || []) as Action[];

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');

  const updateStatusMutation = trpc.action.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const handleStatusChange = (actionId: string, status: string) => {
    updateStatusMutation.mutate({
      id: actionId,
      status: status as 'pending' | 'in_progress' | 'completed' | 'dismissed',
    });
  };

  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      if (filterStatus !== 'all' && action.status !== filterStatus) return false;
      if (filterPriority !== 'all' && action.priority !== filterPriority) return false;
      return true;
    });
  }, [actions, filterStatus, filterPriority]);

  const stats = useMemo(() => ({
    total: actions.length,
    pending: actions.filter(a => a.status === 'pending').length,
    inProgress: actions.filter(a => a.status === 'in_progress').length,
    completed: actions.filter(a => a.status === 'completed').length,
  }), [actions]);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">액션 아이템</h1>
        <p className="text-gray-500">AI가 추천한 액션을 관리하세요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">전체</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">대기 중</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-500">진행 중</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">완료</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">필터:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">모든 상태</option>
              <option value="pending">대기 중</option>
              <option value="in_progress">진행 중</option>
              <option value="completed">완료</option>
              <option value="dismissed">무시됨</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">모든 우선순위</option>
              <option value="urgent">긴급</option>
              <option value="high">높음</option>
              <option value="medium">중간</option>
              <option value="low">낮음</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Actions List */}
      {filteredActions.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {actions.length === 0
                ? '아직 액션 아이템이 없습니다'
                : '필터 조건에 맞는 액션이 없습니다'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredActions.map((action) => (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <StatusIcon status={action.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <PriorityBadge priority={action.priority} />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>분석: {action.analyses?.name}</span>
                        <span>{formatRelativeTime(action.created_at)}</span>
                        {action.completed_at && (
                          <span className="text-green-600">
                            완료: {formatRelativeTime(action.completed_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  {action.status !== 'completed' && action.status !== 'dismissed' && (
                    <>
                      {action.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStatusChange(action.id, 'in_progress')}
                        >
                          시작
                        </Button>
                      )}
                      {action.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(action.id, 'completed')}
                        >
                          완료
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(action.id, 'dismissed')}
                      >
                        무시
                      </Button>
                    </>
                  )}
                  {(action.status === 'completed' || action.status === 'dismissed') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStatusChange(action.id, 'pending')}
                    >
                      다시 열기
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: Action['status'] }) {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
    case 'in_progress':
      return <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0" />;
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
    case 'dismissed':
      return <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />;
    default:
      return null;
  }
}

function PriorityBadge({ priority }: { priority: Action['priority'] }) {
  const colors = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-700',
  };

  const labels = {
    urgent: '긴급',
    high: '높음',
    medium: '중간',
    low: '낮음',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[priority]}`}>
      {labels[priority]}
    </span>
  );
}
