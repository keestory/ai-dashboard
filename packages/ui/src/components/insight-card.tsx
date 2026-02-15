import * as React from 'react';
import { cn } from '../utils';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export type InsightType = 'trend' | 'anomaly' | 'pattern' | 'comparison' | 'summary';
export type InsightImportance = 'critical' | 'high' | 'medium' | 'low';

export interface InsightCardProps {
  type: InsightType;
  title: string;
  description: string;
  importance: InsightImportance;
  onDetailClick?: () => void;
  onActionClick?: () => void;
  className?: string;
}

const importanceConfig = {
  critical: {
    icon: AlertCircle,
    label: 'Critical',
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  high: {
    icon: AlertTriangle,
    label: 'High',
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  medium: {
    icon: Info,
    label: 'Medium',
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  low: {
    icon: CheckCircle,
    label: 'Low',
    borderColor: 'border-l-gray-400',
    bgColor: 'bg-gray-50',
    iconColor: 'text-gray-400',
  },
};

export function InsightCard({
  type,
  title,
  description,
  importance,
  onDetailClick,
  onActionClick,
  className,
}: InsightCardProps) {
  const config = importanceConfig[importance];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-4',
        config.borderColor,
        config.bgColor,
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-5 w-5', config.iconColor)} />
        <span className={cn('text-sm font-medium', config.iconColor)}>
          {config.label}
        </span>
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="flex gap-2">
        {onDetailClick && (
          <button
            onClick={onDetailClick}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            자세히 보기
          </button>
        )}
        {onActionClick && (
          <button
            onClick={onActionClick}
            className="text-sm font-medium text-gray-600 hover:text-gray-700"
          >
            액션 보기
          </button>
        )}
      </div>
    </div>
  );
}
