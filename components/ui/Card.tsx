import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ children, className, glass = false, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        'rounded-xl border border-space-700/60 p-4',
        glass
          ? 'bg-space-900/60 backdrop-blur-sm'
          : 'bg-space-900',
        className
      )}
    >
      {children}
    </div>
  );
}

