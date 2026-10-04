'use client';

import * as React from 'react';
import { ark } from '@ark-ui/react/factory';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-lg transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-[0.96]',
  {
    variants: {
      variant: {
        solid:
          'bg-zinc-100 text-zinc-950 shadow-xs hover:bg-white active:bg-zinc-200 border border-transparent',
        outline:
          'border border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-850 hover:text-white hover:border-zinc-700 active:bg-zinc-800 shadow-2xs',
        ghost:
          'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 active:bg-zinc-800',
        subtle:
          'bg-zinc-900 border border-zinc-800/60 text-zinc-300 hover:bg-zinc-850 hover:text-white hover:border-zinc-700 active:bg-zinc-800',
        danger:
          'border border-red-950/80 bg-red-950/30 text-red-400 hover:bg-red-950/60 hover:text-red-200 hover:border-red-900 active:bg-red-900/40',
      },
      size: {
        xs: 'h-6 w-6 p-0 text-xs rounded-md',
        sm: 'h-7 w-7 p-0 text-xs rounded-md',
        md: 'h-8 w-8 p-0 text-sm rounded-lg',
        lg: 'h-9 w-9 p-0 text-base rounded-lg',
        xl: 'h-10 w-10 p-0 text-lg rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
);

export interface IconButtonProps
  extends React.ComponentPropsWithoutRef<typeof ark.button>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <ark.button
        ref={ref}
        className={cn(iconButtonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
IconButton.displayName = 'IconButton';
