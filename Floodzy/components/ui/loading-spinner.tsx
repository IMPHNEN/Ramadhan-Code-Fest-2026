'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-10 w-10',
    },
    color: {
      default: 'text-primary',
      secondary: 'text-secondary',
      muted: 'text-muted-foreground',
      white: 'text-white',
    },
  },
  defaultVariants: {
    size: 'default',
    color: 'default',
  },
});

export interface LoadingSpinnerProps
  extends VariantProps<typeof spinnerVariants> {
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  className,
  size,
  color,
  text,
}: LoadingSpinnerProps) {
  return (
    <motion.div
      className="flex items-center justify-center space-x-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Loader2 className={cn(spinnerVariants({ size, color }), className)} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </motion.div>
  );
}

export function LoadingSkeleton({
  className,
  ...props
}: Omit<HTMLMotionProps<'div'>, 'ref'>) {
  return (
    <motion.div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      {...props}
    />
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export function LoadingPulse({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn('h-4 w-4 bg-primary rounded-full', className)}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    />
  );
}

export function LoadingWave({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="h-8 w-1 bg-primary rounded-full"
          animate={{
            scaleY: [1, 2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}
