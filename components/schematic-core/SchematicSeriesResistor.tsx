import * as React from 'react';
import { SymbolStandard } from './schematic-types';

export interface SchematicSeriesResistorProps {
  leftX: number;
  rightX: number;
  y: number;
  tag: string;
  valueText: string;
  metricBadge?: { text: string; color: string; bgColor?: string } | null;
  symbolStandard?: SymbolStandard;
  isHovered?: boolean;
  isShort?: boolean;
  animateFlow?: boolean;
  onHover?: (hovered: boolean) => void;
}

export const SchematicSeriesResistor = React.memo(function SchematicSeriesResistor({
  leftX,
  rightX,
  y,
  tag,
  valueText,
  metricBadge,
  symbolStandard = 'ieee',
  isHovered = false,
  isShort = false,
  animateFlow = false,
  onHover,
}: SchematicSeriesResistorProps) {
  const totalW = rightX - leftX;
  const leadW = Math.max(8, Math.round(totalW * 0.15));
  const rLeftX = leftX + leadW;
  const rRightX = rightX - leadW;
  const bodyW = rRightX - rLeftX;
  const h = bodyW / 6;
  const amp = 9;

  const wireColor = isShort ? '#ef4444' : '#10b981';
  const resistorColor = isShort ? '#ef4444' : isHovered ? '#fbbf24' : '#f59e0b';

  return (
    <g
      className="cursor-pointer transition-all duration-150"
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {/* Hit Target */}
      <rect
        x={leftX}
        y={y - 32}
        width={totalW}
        height={64}
        rx="6"
        fill="#18181b"
        fillOpacity={isHovered ? 0.35 : 0}
        stroke="#27272a"
        strokeWidth="1"
        strokeOpacity={isHovered ? 0.8 : 0}
        pointerEvents="all"
      />

      <g className="pointer-events-none">
        {/* Left Lead */}
        <line x1={leftX} y1={y} x2={rLeftX} y2={y} stroke={wireColor} strokeWidth="2.5" strokeLinecap="round" />

        {/* Resistor Body: IEEE Zigzag vs IEC Box */}
        {symbolStandard === 'ieee' ? (
          <path
            d={`
              M ${rLeftX} ${y}
              L ${rLeftX + h * 0.5} ${y - amp}
              L ${rLeftX + h * 1.5} ${y + amp}
              L ${rLeftX + h * 2.5} ${y - amp}
              L ${rLeftX + h * 3.5} ${y + amp}
              L ${rLeftX + h * 4.5} ${y - amp}
              L ${rLeftX + h * 5.5} ${y + amp}
              L ${rRightX} ${y}
            `}
            fill="none"
            stroke={resistorColor}
            strokeWidth={isHovered ? '2.8' : '2.2'}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={isHovered ? 'url(#amber-glow)' : undefined}
          />
        ) : (
          <rect
            x={rLeftX}
            y={y - 8}
            width={bodyW}
            height={16}
            rx="2"
            fill="#121215"
            stroke={resistorColor}
            strokeWidth={isHovered ? '2.4' : '2'}
          />
        )}

        {/* Right Lead */}
        <line x1={rRightX} y1={y} x2={rightX} y2={y} stroke={wireColor} strokeWidth="2.5" strokeLinecap="round" />

        {/* Animated electron flow */}
        {animateFlow && !isShort && (
          <line
            x1={leftX}
            y1={y}
            x2={rightX}
            y2={y}
            stroke="#a7f3d0"
            strokeWidth="2"
            strokeDasharray="3 6"
            className="electron-top"
            style={{ opacity: 0.8 }}
          />
        )}

        {/* Top Text: Tag & Resistance Value */}
        <text
          x={(leftX + rightX) / 2}
          y={y - 15}
          fill={isHovered ? '#ffffff' : '#f4f4f5'}
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          {tag} ({valueText})
        </text>

        {/* Bottom Metric Badge (Voltage Drop / Power) */}
        {metricBadge && !isShort && (() => {
          const badgeTextWidth = Math.round(metricBadge.text.length * 5.6);
          const badgeW = Math.max(46, badgeTextWidth + 10);
          const badgeX = (leftX + rightX) / 2 - badgeW / 2;
          return (
            <g>
              <rect
                x={badgeX}
                y={y + 14}
                width={badgeW}
                height="16"
                rx="4"
                fill={metricBadge.bgColor || '#121215'}
                stroke="#27272a"
                strokeWidth="1"
              />
              <text
                x={(leftX + rightX) / 2}
                y={y + 25}
                fill={metricBadge.color}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="600"
                textAnchor="middle"
                style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
              >
                {metricBadge.text}
              </text>
            </g>
          );
        })()}
      </g>
    </g>
  );
});
