import type { ReactNode } from 'react';
import { Card } from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red';
}
export function StatsCard({
  title,
  value,
  icon,
  trend,
  color = 'blue'
}: StatsCardProps) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  };
  return <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>}
        </div>
        <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </Card>;
}
