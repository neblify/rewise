import { cn } from '@/lib/utils';

interface SparkleIconProps {
  className?: string;
}

export function SparkleIcon({ className }: SparkleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-5 w-5 animate-sparkle', className)}
    >
      <path
        d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}
