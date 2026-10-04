'use client';

import * as React from 'react';
import { ResistorUnit } from '@/types/resistor';
import { getResistorColorBands } from '@/lib/resistor-calc';

interface ResistorColorCodeBadgeProps {
  value: string;
  unit: ResistorUnit;
  label?: string;
}

/**
 * Miniature 4-band EIA color code badge for resistors.
 * Styled to perfectly match the ceramic resistor visualizer in DividerParameterRow.
 */
export const ResistorColorCodeBadge = React.memo(function ResistorColorCodeBadge({
  value,
  unit,
  label,
}: ResistorColorCodeBadgeProps) {
  const bands = React.useMemo(() => {
    return getResistorColorBands({
      id: 'preview',
      value,
      unit,
      count: 1,
    });
  }, [value, unit]);

  if (!bands || bands.length < 4) {
    return null;
  }

  const tooltipText = `${label ? label + ': ' : ''}${bands.map((b) => b.nameFa).join(' | ')}`;

  return (
    <div
      className="flex items-center select-none shrink-0"
      title={tooltipText}
    >
      {/* Lead wire left */}
      <div className="w-1.5 h-0.5 bg-zinc-500" />

      {/* Ceramic body */}
      <div className="flex items-center h-3.5 bg-[#d8c3a5] px-1 rounded-xs gap-1 border border-[#b8a082] shadow-xs">
        {bands.map((band, idx) => (
          <span
            key={`${band.name}-${idx}`}
            className="inline-block h-3.5 w-1 rounded-[1px] shadow-xs origin-center"
            style={{ backgroundColor: band.color }}
            title={`${band.nameFa} (${band.name})`}
          />
        ))}
      </div>

      {/* Lead wire right */}
      <div className="w-1.5 h-0.5 bg-zinc-500" />
    </div>
  );
});
