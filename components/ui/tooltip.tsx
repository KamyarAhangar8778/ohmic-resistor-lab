'use client';

import { Tooltip as ArkTooltip } from '@ark-ui/react/tooltip';
import * as React from 'react';
import { cn } from '@/lib/utils';

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof ArkTooltip.Content>,
  React.ComponentPropsWithoutRef<typeof ArkTooltip.Content>
>(({ className, ...props }, ref) => (
  <ArkTooltip.Content
    ref={ref}
    className={cn(
      'z-50 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-200 shadow-md animate-in fade-in-0 zoom-in-95',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = 'TooltipContent';

export const Tooltip = {
  Root: ArkTooltip.Root,
  Trigger: ArkTooltip.Trigger,
  Positioner: ArkTooltip.Positioner,
  Content: TooltipContent,
  Arrow: ArkTooltip.Arrow,
  ArrowTip: ArkTooltip.ArrowTip,
};
