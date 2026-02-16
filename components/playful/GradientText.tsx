import { cn } from '@/lib/utils';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';

interface GradientTextProps {
  as?: HeadingTag;
  className?: string;
  children: React.ReactNode;
}

export function GradientText({
  as: Tag = 'span',
  className,
  children,
}: GradientTextProps) {
  return <Tag className={cn('gradient-text', className)}>{children}</Tag>;
}
