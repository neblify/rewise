'use client';

import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';

interface GradientButtonProps extends ButtonProps {
  animate?: boolean;
}

export function GradientButton({
  className,
  animate = false,
  children,
  ...props
}: GradientButtonProps) {
  return (
    <Button
      variant="gradient"
      className={cn(
        'relative overflow-hidden',
        animate && 'animate-gradient-shift bg-[length:200%_200%]',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
