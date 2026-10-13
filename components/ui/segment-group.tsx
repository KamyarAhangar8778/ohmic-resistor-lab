'use client';

import { SegmentGroup as ArkSegmentGroup } from '@ark-ui/react/segment-group';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SegmentGroupRootProps extends React.ComponentPropsWithoutRef<typeof ArkSegmentGroup.Root> {
  size?: 'sm' | 'md';
}

const SegmentGroupRoot = React.forwardRef<React.ElementRef<typeof ArkSegmentGroup.Root>, SegmentGroupRootProps>(
  ({ className, size = 'sm', ...props }, ref) => (
    <ArkSegmentGroup.Root
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-950/80 p-0.5 select-none relative',
        size === 'md' ? 'p-1' : 'p-0.5',
        className
      )}
      {...props}
    />
  )
);
SegmentGroupRoot.displayName = 'SegmentGroupRoot';

const SegmentGroupItem = React.forwardRef<
  React.ElementRef<typeof ArkSegmentGroup.Item>,
  React.ComponentPropsWithoutRef<typeof ArkSegmentGroup.Item>
>(({ className, ...props }, ref) => (
  <ArkSegmentGroup.Item
    ref={ref}
    className={cn(
      'relative inline-flex items-center justify-center cursor-pointer rounded-md px-2.5 py-1 text-xs font-mono font-medium text-zinc-400 transition-all select-none',
      'hover:text-zinc-200 hover:bg-zinc-900/60',
      'data-[state=checked]:bg-zinc-800 data-[state=checked]:text-zinc-100 data-[state=checked]:shadow-xs data-[state=checked]:border data-[state=checked]:border-zinc-700/60',
      'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400',
      className
    )}
    {...props}
  />
));
SegmentGroupItem.displayName = 'SegmentGroupItem';

export const SegmentGroup = {
  Root: SegmentGroupRoot,
  Item: SegmentGroupItem,
  ItemText: ArkSegmentGroup.ItemText,
  ItemControl: ArkSegmentGroup.ItemControl,
  Indicator: ArkSegmentGroup.Indicator,
};
