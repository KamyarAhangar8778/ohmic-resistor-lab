import * as React from 'react';
import { SymbolStandard, ResistorMetricBadge } from './schematic-types';

export interface SchematicResistorProps {
  x: number;
  topY: number;
  bottomY: number;
  tag: string;
  valueText: string;
  metricBadge?: ResistorMetricBadge | null;
  symbolStandard?: SymbolStandard;
  isHovered?: boolean;
  isShort?: boolean;
  animateFlow?: boolean;
  isDashed?: boolean;
  flowStrokeWidth?: number;
  flowOpacity?: number;
  flowDuration?: number;
  onHover?: (hovered: boolean) => void;
}

export const SchematicResistor = React.memo(function SchematicResistor({
  x,
  topY,
  bottomY,
  tag,
  valueText,
  metricBadge,
  symbolStandard = 'ieee',
  isHovered = false,
  isShort = false,
  animateFlow = false,
  isDashed = false,
  flowStrokeWidth = 2,
  flowOpacity = 0.8,
  flowDuration = 1.3,
  onHover,
}: SchematicResistorProps) {
  const totalH = bottomY - topY;
  // Standard lead spacing: leads take ~10-14px total, body takes remainder
  const leadH = Math.max(5, Math.min(8, Math.round(totalH * 0.12)));
  const rTopY = topY + leadH;
  const rBottomY = bottomY - leadH;
  const bodyH = rBottomY - rTopY;

  // Symmetrical IEEE Zigzag pitch calculation
  const h = bodyH / 6;
  const halfH = h / 2;
  const width = Math.min(8.5, Math.max(6.5, bodyH * 0.17));

  const wireColor = isShort ? '#ef4444' : isHovered ? '#34d399' : '#10b981';
  const returnColor = isShort ? '#ef4444' : isHovered ? '#a1a1aa' : '#71717a';
  const resistorColor = isShort ? '#ef4444' : isHovered ? '#fbbf24' : '#f59e0b';

  const textStartX = x + 18;
  const badgeText = metricBadge?.text || '';
  const badgeWidth = metricBadge?.width ?? Math.max(46, Math.round(badgeText.length * 5.6 + 10));
  const cardBackingWidth = Math.max(104, 38 + badgeWidth + 6);

  return (
    <g
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className="cursor-pointer transition-all duration-150"
    >
      {/* Generous Hit-Target & Hover Backing Pill */}
      <rect
        x={x - 20}
        y={topY - 6}
        width={cardBackingWidth}
        height={totalH + 12}
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
        {/* Top Lead: From topY to rTopY */}
        <line
          x1={x}
          y1={topY}
          x2={x}
          y2={rTopY}
          stroke={wireColor}
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Animated Flow Down Top Lead */}
        {animateFlow && !isShort && (
          <line
            x1={x}
            y1={topY}
            x2={x}
            y2={rTopY}
            stroke="#a7f3d0"
            strokeWidth={flowStrokeWidth}
            strokeDasharray="3 6"
            className="electron-down"
            style={{ animationDuration: `${flowDuration.toFixed(2)}s`, opacity: flowOpacity }}
          />
        )}

        {/* Resistor Body: IEEE Zigzag vs IEC Box */}
        {symbolStandard === 'ieee' ? (
          <g filter={isHovered ? 'url(#amber-glow)' : undefined}>
            <path
              d={`
                M ${x} ${rTopY}
                L ${x - width} ${rTopY + halfH}
                L ${x + width} ${rTopY + halfH + h}
                L ${x - width} ${rTopY + halfH + 2 * h}
                L ${x + width} ${rTopY + halfH + 3 * h}
                L ${x - width} ${rTopY + halfH + 4 * h}
                L ${x + width} ${rTopY + halfH + 5 * h}
                L ${x} ${rBottomY}
              `}
              fill="none"
              stroke={isDashed ? '#34d399' : resistorColor}
              strokeWidth={isHovered ? '2.8' : '2.2'}
              strokeDasharray={isDashed ? '4 2' : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : (
          <g filter={isHovered ? 'url(#amber-glow)' : undefined}>
            <line
              x1={x}
              y1={rTopY}
              x2={x}
              y2={rTopY + 4}
              stroke={resistorColor}
              strokeWidth="2"
            />
            <rect
              x={x - 10}
              y={rTopY + 4}
              width="20"
              height={bodyH - 8}
              rx="2"
              fill="#121215"
              stroke={isDashed ? '#34d399' : resistorColor}
              strokeWidth={isHovered ? '2.4' : '2'}
              strokeDasharray={isDashed ? '3 2' : undefined}
            />
            <line
              x1={x}
              y1={rTopY + 10}
              x2={x}
              y2={rBottomY - 10}
              stroke={resistorColor}
              strokeWidth="1"
              strokeDasharray="2 2"
              strokeOpacity="0.4"
            />
            <line
              x1={x}
              y1={rBottomY - 4}
              x2={x}
              y2={rBottomY}
              stroke={resistorColor}
              strokeWidth="2"
            />
          </g>
        )}

        {/* Bottom Lead: From rBottomY to bottomY */}
        <line
          x1={x}
          y1={rBottomY}
          x2={x}
          y2={bottomY}
          stroke={returnColor}
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Animated Flow Down Bottom Lead */}
        {animateFlow && !isShort && (
          <line
            x1={x}
            y1={rBottomY}
            x2={x}
            y2={bottomY}
            stroke="#d4d4d8"
            strokeWidth={flowStrokeWidth}
            strokeDasharray="3 6"
            className="electron-down"
            style={{
              animationDuration: `${flowDuration.toFixed(2)}s`,
              opacity: Math.max(0.3, flowOpacity * 0.8),
            }}
          />
        )}

        {/* Text Labels (Strictly LTR) */}
        <text
          x={textStartX}
          y={rTopY + 15}
          fill={isHovered ? '#ffffff' : '#f4f4f5'}
          fontSize="12"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="start"
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          {tag}
        </text>

        <text
          x={textStartX}
          y={rTopY + 30}
          fill={isShort ? '#ef4444' : '#e4e4e7'}
          fontSize="11"
          fontWeight="600"
          fontFamily="monospace"
          textAnchor="start"
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          {valueText}
        </text>

        {/* Metric Badge (Power or Current) */}
        {metricBadge && !isShort && (
          <g>
            <rect
              x={textStartX}
              y={rTopY + 36}
              width={badgeWidth}
              height="17"
              rx="4"
              fill={metricBadge.bgColor || '#121215'}
              stroke={metricBadge.borderColor || '#27272a'}
              strokeWidth="1"
            />
            <text
              x={textStartX + 6}
              y={rTopY + 48}
              fill={metricBadge.color || '#fbbf24'}
              fontSize="9.5"
              fontFamily="monospace"
              fontWeight="600"
              textAnchor="start"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
            >
              {metricBadge.text}
            </text>
          </g>
        )}

        {/* Short Circuit Warning Badge */}
        {isShort && (
          <g>
            <rect
              x={textStartX}
              y={rTopY + 36}
              width="72"
              height="17"
              rx="4"
              fill="#2b0d0d"
              stroke="#ef4444"
              strokeWidth="1"
            />
            <text
              x={textStartX + 6}
              y={rTopY + 48}
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
