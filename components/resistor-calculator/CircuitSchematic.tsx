'use client';

import * as React from 'react';
import { ResistorItem, ParallelCalculationResult } from '@/types/resistor';
import {
  SymbolStandard,
  BranchStat,
  UNIT_MULTIPLIER_MAP,
} from './schematic/schematic-types';
import { SchematicCard } from '../schematic-core/SchematicCard';
import { SchematicLegendItem } from '../schematic-core/schematic-types';
import { SchematicTerminals } from './schematic/SchematicTerminals';
import { SchematicBuses } from './schematic/SchematicBuses';
import { SchematicBranch } from './schematic/SchematicBranch';

interface CircuitSchematicProps {
  items: ResistorItem[];
  result: ParallelCalculationResult;
}

const PARALLEL_LEGEND: SchematicLegendItem[] = [
  { label: 'ریل تغذیه A (+)', color: '#10b981', shape: 'circle', textColor: 'text-zinc-300' },
  { label: 'ریل مشترک B (-)', color: '#71717a', shape: 'circle', textColor: 'text-zinc-400' },
  { label: 'شاخه مقاومت', color: '#f59e0b', shape: 'square', textColor: 'text-zinc-300' },
  { label: 'شارش متناسب جریان (I)', color: '#10b981', shape: 'dash', textColor: 'text-emerald-400' },
];

export function CircuitSchematic({ items, result }: CircuitSchematicProps) {
  const [symbolStandard, setSymbolStandard] = React.useState<SymbolStandard>('ieee');
  const [animateFlow, setAnimateFlow] = React.useState<boolean>(true);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const branchCount = items.length;

  // Geometry calculations (strictly LTR EDA coordinates)
  const terminalX = 58;
  const terminalLeadLength = 16;
  const leftBusX = terminalX + terminalLeadLength; // 74
  const firstBranchX = leftBusX + 52; // 126

  const branchSpacing = branchCount <= 2 ? 112 : branchCount <= 4 ? 104 : 96;
  const lastBranchX = firstBranchX + (branchCount - 1) * branchSpacing;
  const rightBusX = lastBranchX;

  const minContentWidth = Math.max(380, lastBranchX + 80);
  const svgHeight = 216;

  const topBusY = 44;
  const bottomBusY = 168;

  // Calculate current share percentage and animation dynamics
  const branchStats: BranchStat[] = React.useMemo(() => {
    const totalG = result.conductanceSiemens;
    const hasValidG = totalG !== null && totalG > 0;

    return items.map((item) => {
      const rawVal = item.value;
      if (rawVal.length === 0) {
        return {
          hasValue: false,
          ohms: null,
          currentShare: null,
          isShort: false,
          animDuration: 1.4,
          flowOpacity: 0.5,
          flowStrokeWidth: 2,
        };
      }

      const num = parseFloat(rawVal);
      if (isNaN(num) || num < 0) {
        return {
          hasValue: false,
          ohms: null,
          currentShare: null,
          isShort: false,
          animDuration: 1.4,
          flowOpacity: 0.5,
          flowStrokeWidth: 2,
        };
      }

      const multiplier = UNIT_MULTIPLIER_MAP[item.unit] ?? 1;
      const ohms = num * multiplier;

      if (ohms === 0) {
        return {
          hasValue: true,
          ohms: 0,
          currentShare: '100%',
          isShort: true,
          animDuration: 0.35,
          flowOpacity: 1,
          flowStrokeWidth: 3,
        };
      }

      if (hasValidG) {
        const branchConductance = 1 / ohms;
        const share = (branchConductance / totalG) * 100;
        const shareRatio = Math.max(0.005, Math.min(1, share / 100));
        const animDuration = Math.max(0.42, Math.min(3.2, 0.45 / Math.pow(shareRatio, 0.45)));
        const flowOpacity = Math.max(0.35, Math.min(0.95, 0.3 + 0.65 * Math.sqrt(shareRatio)));
        const flowStrokeWidth = shareRatio > 0.35 ? 2.5 : shareRatio > 0.1 ? 2.0 : 1.5;

        return {
          hasValue: true,
          ohms,
          currentShare: share < 0.1 ? '<0.1%' : `${share.toFixed(1)}%`,
          isShort: false,
          animDuration,
          flowOpacity,
          flowStrokeWidth,
        };
      }

      return {
        hasValue: true,
        ohms,
        currentShare: null,
        isShort: false,
        animDuration: 1.4,
        flowOpacity: 0.5,
        flowStrokeWidth: 2,
      };
    });
  }, [items, result.conductanceSiemens]);

  const handleHover = React.useCallback((idx: number | null) => {
    setHoveredIndex(idx);
  }, []);

  return (
    <SchematicCard
      title="شماتیک مدار معادل موازی"
      subtitle="نمای اتصالات موازی پایانه‌ها و توزیع جریان الکتریکی"
      svgHeight={svgHeight}
      minContentWidth={minContentWidth}
      symbolStandard={symbolStandard}
      onSymbolStandardChange={setSymbolStandard}
      animateFlow={animateFlow}
      onAnimateFlowChange={setAnimateFlow}
      legendItems={PARALLEL_LEGEND}
    >
      {({ symbolStandard: std, animateFlow: flow }) => (
        <g>
          {/* Terminals (Node A and Node B) */}
          <SchematicTerminals
            terminalX={terminalX}
            leftBusX={leftBusX}
            topBusY={topBusY}
            bottomBusY={bottomBusY}
          />

          {/* Main Conductor Buses (Top V+ and Bottom Return) */}
          <SchematicBuses
            leftBusX={leftBusX}
            rightBusX={rightBusX}
            topBusY={topBusY}
            bottomBusY={bottomBusY}
            animateFlow={flow}
            isShortCircuit={result.isShortCircuit}
          />

          {/* Parallel Branches */}
          {items.map((item, idx) => (
            <SchematicBranch
              key={item.id}
              item={item}
              idx={idx}
              branchX={firstBranchX + idx * branchSpacing}
              topBusY={topBusY}
              bottomBusY={bottomBusY}
              stats={branchStats[idx]}
              isHovered={hoveredIndex === idx}
              symbolStandard={std}
              animateFlow={flow}
              isCircuitShort={result.isShortCircuit}
              onHover={handleHover}
            />
          ))}
        </g>
      )}
    </SchematicCard>
  );
}
