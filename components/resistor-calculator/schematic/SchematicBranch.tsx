import * as React from 'react';
import { ResistorItem } from '@/types/resistor';
import { BranchStat, SymbolStandard, UNIT_SYMBOL_MAP } from './schematic-types';

interface SchematicBranchProps {
  item: ResistorItem;
  idx: number;
  branchX: number;
  topBusY: number;
  bottomBusY: number;
  stats: BranchStat;
  isHovered: boolean;
  symbolStandard: SymbolStandard;
  animateFlow: boolean;
  isCircuitShort: boolean;
  onHover: (idx: number | null) => void;
}

/**
 * SchematicBranch renders a single parallel circuit branch including leads,
 * IEEE/IEC resistor symbol, node solder junctions, and metrics labels.
 * Memoized to eliminate redundant SVG tree re-renders across unaffected branches.
 */
export const SchematicBranch = React.memo(function SchematicBranch({
  item,
  idx,
  branchX,
  topBusY,
  bottomBusY,
  stats,
  isHovered,
  symbolStandard,
  animateFlow,
  isCircuitShort,
  onHover,
}: SchematicBranchProps) {
  const isShort = stats.isShort;
  const resUnitSymbol = UNIT_SYMBOL_MAP[item.unit] || item.unit;

  const rTopY = 74;
  const rBottomY = 136;

  const wireColor = isShort
    ? '#ef4444'
    : isHovered
    ? '#34d399'
    : '#10b981';
  const returnColor = isShort
    ? '#ef4444'
    : isHovered
    ? '#a1a1aa'
    : '#71717a';
  const resistorStroke = isShort
    ? '#ef4444'
    : isHovered
    ? '#fbbf24'
    : '#f59e0b';

  const textStartX = branchX + 18;

  return (
    <g
      onMouseEnter={() => onHover(idx)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer transition-all duration-150"
    >
      {/* Generous Hit-Target & Hover Highlight Backing Pill */}
      <rect
        x={branchX - 20}
        y={topBusY - 8}
        width={104}
        height={bottomBusY - topBusY + 16}
        rx="8"
        fill="#18181b"
        fillOpacity={isHovered ? 0.45 : 0}
        stroke="#27272a"
        strokeWidth="1"
        strokeOpacity={isHovered ? 1 : 0}
        pointerEvents="all"
        className="transition-all duration-150"
      />

      {/* Visual Circuit Elements (pointer-events-none to prevent micro-jitter) */}
      <g className="pointer-events-none">
        {/* Top Bus Solder Junction (Node Dot) */}
        <circle
          cx={branchX}
          cy={topBusY}
          r="4"
          fill="#09090b"
          stroke={wireColor}
          strokeWidth="2.5"
          filter={isHovered ? 'url(#emerald-glow)' : undefined}
        />
        <circle cx={branchX} cy={topBusY} r="1.5" fill={wireColor} />

      {/* Top Lead: From Bus to Resistor Top */}
      <line
        x1={branchX}
        y1={topBusY}
        x2={branchX}
        y2={rTopY}
        stroke={wireColor}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Animated Flow Down Top Lead */}
      {animateFlow && !isCircuitShort && stats.hasValue && (
        <line
          x1={branchX}
          y1={topBusY}
          x2={branchX}
          y2={rTopY}
          stroke="#a7f3d0"
          strokeWidth={stats.flowStrokeWidth}
          strokeDasharray="3 6"
          className="electron-down"
          style={{
            animationDuration: `${stats.animDuration.toFixed(2)}s`,
            opacity: stats.flowOpacity,
          }}
        />
      )}

      {/* RESISTOR SYMBOL (IEEE Zigzag or IEC Box) */}
      {symbolStandard === 'ieee' ? (
        <g filter={isHovered ? 'url(#amber-glow)' : undefined}>
          <path
            d={`
              M ${branchX} ${rTopY}
              L ${branchX} ${rTopY + 7}
              L ${branchX - 8.5} ${rTopY + 11}
              L ${branchX + 8.5} ${rTopY + 19}
              L ${branchX - 8.5} ${rTopY + 27}
              L ${branchX + 8.5} ${rTopY + 35}
              L ${branchX - 8.5} ${rTopY + 43}
              L ${branchX + 8.5} ${rTopY + 51}
              L ${branchX} ${rTopY + 55}
              L ${branchX} ${rBottomY}
            `}
            fill="none"
            stroke={resistorStroke}
            strokeWidth={isHovered ? '2.8' : '2.2'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : (
        <g filter={isHovered ? 'url(#amber-glow)' : undefined}>
          <line
            x1={branchX}
            y1={rTopY}
            x2={branchX}
            y2={rTopY + 8}
            stroke={resistorStroke}
            strokeWidth="2"
          />
          <rect
            x={branchX - 10}
            y={rTopY + 8}
            width="20"
            height="46"
            rx="2"
            fill="#121215"
            stroke={resistorStroke}
            strokeWidth={isHovered ? '2.4' : '2'}
          />
          <line
            x1={branchX}
            y1={rTopY + 16}
            x2={branchX}
            y2={rTopY + 46}
            stroke={resistorStroke}
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.4"
          />
          <line
            x1={branchX}
            y1={rTopY + 54}
            x2={branchX}
            y2={rBottomY}
            stroke={resistorStroke}
            strokeWidth="2"
          />
        </g>
      )}

      {/* Bottom Lead: From Resistor Bottom to Bottom Bus */}
      <line
        x1={branchX}
        y1={rBottomY}
        x2={branchX}
        y2={bottomBusY}
        stroke={returnColor}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Animated Flow Down Bottom Lead */}
      {animateFlow && !isCircuitShort && stats.hasValue && (
        <line
          x1={branchX}
          y1={rBottomY}
          x2={branchX}
          y2={bottomBusY}
          stroke="#d4d4d8"
          strokeWidth={stats.flowStrokeWidth}
          strokeDasharray="3 6"
          className="electron-down"
          style={{
            animationDuration: `${stats.animDuration.toFixed(2)}s`,
            opacity: Math.max(0.3, stats.flowOpacity * 0.8),
          }}
        />
      )}

      {/* Bottom Bus Solder Junction (Node Dot) */}
      <circle
        cx={branchX}
        cy={bottomBusY}
        r="4"
        fill="#09090b"
        stroke={returnColor}
        strokeWidth="2.5"
      />
      <circle cx={branchX} cy={bottomBusY} r="1.5" fill={returnColor} />

      {/* TEXT LABELS (Strictly LTR, starting from branchX + 18) */}
      <text
        x={textStartX}
        y={rTopY + 16}
        fill={isHovered ? '#ffffff' : '#f4f4f5'}
        fontSize="12"
        fontWeight="bold"
        fontFamily="monospace"
        textAnchor="start"
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
      >
        R{idx + 1}
      </text>

      <text
        x={textStartX}
        y={rTopY + 33}
        fill={stats.hasValue ? (isShort ? '#ef4444' : '#e4e4e7') : '#71717a'}
        fontSize="11"
        fontWeight={stats.hasValue ? '600' : 'normal'}
        fontFamily="monospace"
        textAnchor="start"
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
      >
        {stats.hasValue ? `${item.value} ${resUnitSymbol}` : `— ${resUnitSymbol}`}
      </text>

      {/* Current Share Percentage Badge */}
      {stats.currentShare && !isShort && (
        <g>
          <rect
            x={textStartX}
            y={rTopY + 42}
            width="58"
            height="18"
            rx="4"
            fill="#121215"
            stroke="#27272a"
            strokeWidth="1"
          />
          <text
            x={textStartX + 6}
            y={rTopY + 54}
            fill="#34d399"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="start"
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
          >
            I: {stats.currentShare}
          </text>
        </g>
      )}

      {/* Short Circuit Warning Label */}
      {isShort && (
        <g>
          <rect
            x={textStartX}
            y={rTopY + 42}
            width="66"
            height="18"
            rx="4"
            fill="#2b0d0d"
            stroke="#ef4444"
            strokeWidth="1"
          />
          <text
            x={textStartX + 5}
            y={rTopY + 54}
            fill="#ef4444"
            fontSize="9.5"
            fontWeight="bold"
            fontFamily="monospace"
            textAnchor="start"
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
          >
            SHORT 0Ω
          </text>
        </g>
      )}
      </g>
    </g>
  );
});
