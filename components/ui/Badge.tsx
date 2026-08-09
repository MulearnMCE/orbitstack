import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'pro';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-space-700 text-lunar-300 border border-space-600',
  success: 'bg-emerald-900/40 text-emerald-400 border border-emerald-800',
  warning: 'bg-amber-900/40 text-amber-400 border border-amber-800',
  error: 'bg-red-900/40 text-red-400 border border-red-800',
  pro: 'bg-moon-gold/20 text-moon-gold border border-moon-gold/40',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
