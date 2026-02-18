import { cn } from '@/lib/utils';

type AccentColor = 'violet' | 'coral' | 'sky' | 'mint' | 'sunshine';

const accentStyles: Record<AccentColor, { bg: string; text: string }> = {
  violet: { bg: 'bg-violet-light', text: 'text-primary' },
  coral: { bg: 'bg-coral-light', text: 'text-coral' },
  sky: { bg: 'bg-sky-light', text: 'text-[#0C7FA8]' },
  mint: { bg: 'bg-mint-light', text: 'text-mint' },
  sunshine: { bg: 'bg-sunshine-light', text: 'text-[#B8860B]' },
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: AccentColor;
  subtext?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  accent = 'violet',
  subtext,
  className,
}: StatCardProps) {
  const style = accentStyles[accent];
  return (
    <div
      className={cn(
        'bg-card p-6 rounded-2xl shadow-sm border-2 border-border transition-all hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
        </div>
        <div className={cn('p-2 rounded-xl', style.bg)}>
          <div className={style.text}>{icon}</div>
        </div>
      </div>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-3 font-medium">
          {subtext}
        </p>
      )}
    </div>
  );
}
