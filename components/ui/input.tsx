'use client';

import * as React from 'react';
import { ark } from '@ark-ui/react/factory';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.ComponentPropsWithoutRef<typeof ark.input> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <ark.input
        type={type}
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 transition-all font-mono tracking-tight',
          'focus-visible:outline-none focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950',
          'disabled:cursor-not-allowed disabled:opacity-40',
          error && 'border-red-800 text-red-200 focus-visible:border-red-600 focus-visible:ring-red-600',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
