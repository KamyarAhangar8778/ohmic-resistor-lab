'use client';

import * as React from 'react';
import { ark } from '@ark-ui/react/factory';
import { cn } from '@/lib/utils';

const CardRoot = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ark.div>>(
  ({ className, ...props }, ref) => (
    <ark.div
      ref={ref}
      className={cn(
        'rounded-xl border border-zinc-800/80 bg-zinc-900/40 text-zinc-100 shadow-xs backdrop-blur-xs relative overflow-hidden',
        className
      )}
      {...props}
    />
  )
);
CardRoot.displayName = 'CardRoot';

const CardHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ark.div>>(
  ({ className, ...props }, ref) => (
    <ark.div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<typeof ark.h3>>(
  ({ className, ...props }, ref) => (
    <ark.h3
      ref={ref}
      className={cn(
        'text-base font-semibold leading-none tracking-tight text-zinc-100',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<typeof ark.p>>(
  ({ className, ...props }, ref) => (
    <ark.p
      ref={ref}
      className={cn('text-xs text-zinc-400 leading-relaxed', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardBody = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ark.div>>(
  ({ className, ...props }, ref) => (
    <ark.div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardBody.displayName = 'CardBody';

const CardFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ark.div>>(
  ({ className, ...props }, ref) => (
    <ark.div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Body: CardBody,
  Footer: CardFooter,
};
