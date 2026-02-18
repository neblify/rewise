import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

type ShadowColor = 'violet' | 'coral' | 'sky' | 'mint' | 'sunshine';

const shadowMap: Record<ShadowColor, string> = {
  violet: 'shadow-playful',
  coral: 'shadow-playful-coral',
  sky: 'shadow-playful-sky',
  mint: 'shadow-playful-mint',
  sunshine: 'shadow-playful',
};

interface PlayfulCardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadowColor?: ShadowColor;
  hoverable?: boolean;
}

export function PlayfulCard({
  shadowColor = 'violet',
  hoverable = true,
  className,
  children,
  ...props
}: PlayfulCardProps) {
  return (
    <Card
      className={cn(
        shadowMap[shadowColor],
        hoverable && 'hover:-translate-y-1 hover:shadow-lg',
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
