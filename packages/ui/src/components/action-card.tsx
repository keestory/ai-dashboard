import * as React from 'react';
import { cn } from '../utils';
import { Check, Clock, X } from 'lucide-react';

export type ActionPriority = 'urgent' | 'high' | 'medium' | 'low';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed';

export interface ActionCardProps {
  title: string;
  description: string;
  priority: ActionPriority;
  status: ActionStatus;
  dueDate?: string;
  relatedInsight?: string;
  onStatusChange?: (status: ActionStatus) => void;
  className?: string;
}

const priorityConfig = {
  urgent: { label: '긴급', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  high: { label: '높음', bgColor: 'bg-amber-100', textColor: 'text-amber-800' },
  medium: { label: '중간', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  low: { label: '낮음', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
};

const statusConfig = {
  pending: { bgColor: 'bg-white', opacity: '' },
  in_progress: { bgColor: 'bg-blue-50', opacity: '' },
  completed: { bgColor: 'bg-green-50', opacity: '' },
  dismissed: { bgColor: 'bg-gray-50', opacity: 'opacity-50' },
};

export function ActionCard({
  title,
  description,
  priority,
  status,
  dueDate,
  relatedInsight,
  onStatusChange,
  className,
}: ActionCardProps) {
  const priorityCfg = priorityConfig[priority];
  const statusCfg = statusConfig[status];

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 p-4',
        statusCfg.bgColor,
        statusCfg.opacity,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => {
            if (onStatusChange) {
              onStatusChange(status === 'completed' ? 'pending' : 'completed');
            }
          }}
          className={cn(
            'mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
            status === 'completed'
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-gray-300 hover:border-primary-500'
          )}
        >
          {status === 'completed' && <Check className="h-3 w-3 text-white" />}
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded',
                priorityCfg.bgColor,
                priorityCfg.textColor
              )}
            >
              {priorityCfg.label}
            </span>
            <h4
              className={cn(
                'font-semibold text-gray-900',
                status === 'completed' && 'line-through text-gray-500'
              )}
            >
              {title}
            </h4>
          </div>

          {relatedInsight && (
            <p className="text-sm text-gray-500 mb-2">
              관련 인사이트: {relatedInsight}
            </p>
          )}

          <p className="text-sm text-gray-600 mb-3">{description}</p>

          {dueDate && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              기한: {dueDate}
            </div>
          )}

          {status !== 'completed' && status !== 'dismissed' && onStatusChange && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onStatusChange('completed')}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                완료
              </button>
              <button
                onClick={() => onStatusChange('in_progress')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                진행중
              </button>
              <button
                onClick={() => onStatusChange('dismissed')}
                className="text-sm font-medium text-gray-500 hover:text-gray-600"
              >
                무시
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
