import { cn } from '@/lib/utils';

interface WaveDividerProps {
  color?: string;
  flip?: boolean;
  className?: string;
}

export function WaveDivider({
  color = 'var(--background)',
  flip = false,
  className,
}: WaveDividerProps) {
  return (
    <div
      className={cn(
        'w-full overflow-hidden leading-[0]',
        flip && 'rotate-180',
        className
      )}
    >
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60L48 52C96 44 192 28 288 24C384 20 480 28 576 40C672 52 768 68 864 72C960 76 1056 68 1152 56C1248 44 1344 28 1392 20L1440 12V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
