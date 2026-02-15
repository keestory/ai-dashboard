import * as React from 'react';
import { cn } from '../utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = 'vs 전월',
  trend,
  className,
}: KPICardProps) {
  const determinedTrend = trend || (change ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');

  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    down: {
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    neutral: {
      icon: Minus,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  };

  const { icon: TrendIcon, color, bgColor } = trendConfig[determinedTrend];

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-6',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {change !== undefined && (
          <span className={cn('p-1 rounded', bgColor)}>
            <TrendIcon className={cn('h-4 w-4', color)} />
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      {change !== undefined && (
        <div className="flex items-center text-sm">
          <span className={cn('font-medium', color)}>
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}%
          </span>
          <span className="text-gray-500 ml-1">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
