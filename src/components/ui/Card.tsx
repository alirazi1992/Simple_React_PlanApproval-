import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
}
export function Card({
  children,
  className = '',
  glass = false
}: CardProps) {
  const baseStyles = 'rounded-2xl p-6';
  const glassStyles = glass ? 'bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg' : 'bg-white border border-gray-200 shadow-sm';
  return <div className={`${baseStyles} ${glassStyles} ${className}`}>
      {children}
    </div>;
}
