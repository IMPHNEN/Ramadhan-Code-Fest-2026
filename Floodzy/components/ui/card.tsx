'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/* --------------------------------- Variants -------------------------------- */
const cardVariants = cva(
  [
    'group relative isolate',
    // base surface
    'bg-card text-card-foreground border border-border/60',
    // shape + shadow
    'rounded-2xl shadow-sm',
    // transitions
    'transition-all duration-300 ease-out will-change-transform',
    // a11y
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
    // focus within for inputs/links di dalam card
    'focus-within:ring-2 focus-within:ring-primary/40',
  ].join(' '),
  {
    variants: {
      variant: {
        default: '',
        glass: [
          'backdrop-blur-xl',
          'bg-white/5 dark:bg-white/5',
          'border-white/15',
          'shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
        ].join(' '),
        elevated: 'shadow-lg hover:shadow-xl border-border/50',
        outline: 'bg-transparent border-2',
        gradient:
          'bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hover: {
        none: '',
        lift: 'hover:-translate-y-0.5 hover:shadow-lg',
        scale: 'hover:scale-[1.015]',
        glow: 'hover:shadow-[0_0_0_3px_rgba(0,0,0,0.02),0_10px_30px_-10px_hsl(var(--primary))] hover:border-primary/40',
      },
      inset: {
        false: '',
        true:
          // inner subtle border
          'before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:content-[""] before:shadow-[inset_0_0_0_1px_hsl(var(--border))] before:opacity-60',
      },
      interactive: {
        false: '',
        true: 'cursor-pointer select-none active:scale-[0.995]',
      },
      rounded: {
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      hover: 'lift',
      inset: false,
      interactive: false,
      rounded: '2xl',
    },
  },
);

/* ---------------------------- Size context (UX) ---------------------------- */
type CardSize = NonNullable<VariantProps<typeof cardVariants>['size']>;
const CardSizeContext = React.createContext<CardSize>('default');
const useCardSize = () => React.useContext(CardSizeContext);

const sectionPaddingBySize: Record<CardSize, string> = {
  sm: 'px-4 py-3',
  default: 'px-6 py-4',
  lg: 'px-8 py-6',
  xl: 'px-10 py-7',
};

/* --------------------------------- Types ---------------------------------- */
type OmittedHTMLDivAttributes = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onDragOver'
  | 'onDragEnter'
  | 'onDragLeave'
  | 'onDrop'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>;

export interface CardProps
  extends OmittedHTMLDivAttributes,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
  /** Animation on mount (default true) */
  animateIn?: boolean;
}

/* --------------------------------- Card ----------------------------------- */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      size = 'default',
      hover,
      inset,
      interactive,
      rounded,
      asChild = false,
      animateIn = true,
      children,
      ...props
    },
    ref,
  ) => {
    const shouldReduce = useReducedMotion();

    // base class
    const classes = cn(
      cardVariants({ variant, size, hover, inset, interactive, rounded }),
      className,
      // subtle gradient aura on hover (modern candy UX)
      'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[""] after:opacity-0 hover:after:opacity-100 after:transition-opacity',
      'after:bg-[radial-gradient(1200px_300px_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]',
    );

    // motion variants
    const initial =
      animateIn && !shouldReduce ? { opacity: 0, y: 6, scale: 0.995 } : {};
    const animate =
      animateIn && !shouldReduce ? { opacity: 1, y: 0, scale: 1 } : {};
    const transition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] };

    if (asChild) {
      // When using asChild (e.g., wrapping a Link), keep classes + a11y
      return (
        <CardSizeContext.Provider value={size}>
          <Slot
            ref={ref as any}
            className={classes}
            {...props}
            // maintain role for non-semantic wrappers
            role={props.role ?? 'region'}
            aria-label={props['aria-label']}
          >
            {children}
          </Slot>
        </CardSizeContext.Provider>
      );
    }

    return (
      <CardSizeContext.Provider value={size}>
        <motion.div
          ref={ref}
          className={classes}
          initial={initial}
          animate={animate}
          transition={transition}
          role={props.role ?? 'region'}
          {...props}
        >
          {children}
        </motion.div>
      </CardSizeContext.Provider>
    );
  },
);
Card.displayName = 'Card';

/* ------------------------------ Subcomponents ----------------------------- */
export interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  bleed?: boolean; // allow edge-to-edge content (media, charts)
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, bleed = false, ...props }, ref) => {
    const size = useCardSize();
    return (
      <div
        ref={ref}
        className={cn(
          bleed ? 'p-0' : sectionPaddingBySize[size],
          'flex flex-col gap-1.5',
          'border-b border-border/50',
          className,
        )}
        {...props}
      />
    );
  },
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const size = useCardSize();
  const titleSize =
    size === 'xl'
      ? 'text-2xl'
      : size === 'lg'
        ? 'text-xl'
        : size === 'sm'
          ? 'text-base'
          : 'text-lg';
  return (
    <h3
      ref={ref}
      className={cn(
        'font-semibold tracking-tight',
        titleSize,
        'text-foreground',
        className,
      )}
      {...props}
    />
  );
});
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-muted-foreground/90 leading-relaxed',
      'text-sm',
      className,
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, bleed = false, ...props }, ref) => {
    const size = useCardSize();
    return (
      <div
        ref={ref}
        className={cn(bleed ? 'p-0' : sectionPaddingBySize[size], className)}
        {...props}
      />
    );
  },
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, bleed = false, ...props }, ref) => {
    const size = useCardSize();
    return (
      <div
        ref={ref}
        className={cn(
          bleed ? 'p-0' : sectionPaddingBySize[size],
          'flex items-center gap-3 border-t border-border/50',
          className,
        )}
        {...props}
      />
    );
  },
);
CardFooter.displayName = 'CardFooter';
