'use client';

import * as React from 'react';
import { ark } from '@ark-ui/react/factory';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors border select-none',
  {
    variants: {
      variant: {
        solid: 'border-transparent bg-zinc-100 text-zinc-950 font-semibold',
        subtle: 'border-zinc-800 bg-zinc-900/80 text-zinc-300',
        outline: 'border-zinc-800 bg-transparent text-zinc-400',
        success: 'border-emerald-900/50 bg-emerald-950/40 text-emerald-400',
        warning: 'border-amber-900/50 bg-amber-950/40 text-amber-400',
        danger: 'border-red-900/50 bg-red-950/40 text-red-400',
      },
      size: {
        sm: 'text-[10px] px-1.5 py-0.5',
        md: 'text-xs px-2 py-0.5',
        lg: 'text-sm px-2.5 py-1',
      },
    },
    defaultVariants: {
      variant: 'subtle',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<typeof ark.span>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <ark.span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
