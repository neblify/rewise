import { cn } from '@/lib/utils';
import { GradientText } from './GradientText';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  gradient?: boolean;
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  emoji,
  gradient = false,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
        {emoji && <span>{emoji}</span>}
        {gradient ? (
          <GradientText as="span" className="text-3xl font-bold">
            {title}
          </GradientText>
        ) : (
          title
        )}
      </h1>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
