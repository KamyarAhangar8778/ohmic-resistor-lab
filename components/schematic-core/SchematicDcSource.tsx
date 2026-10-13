import * as React from 'react';

export interface SchematicDcSourceProps {
  x: number;
  topY: number;
  bottomY: number;
  voltageValue: string;
  voltageUnit: string;
  isHovered?: boolean;
  isShort?: boolean;
  animateFlow?: boolean;
  onHover?: (hovered: boolean) => void;
}

export const SchematicDcSource = React.memo(function SchematicDcSource({
  x,
  topY,
  bottomY,
  voltageValue,
  voltageUnit,
  isHovered = false,
  isShort = false,
  animateFlow = false,
  onHover,
}: SchematicDcSourceProps) {
  const centerY = (topY + bottomY) / 2;
  const radius = 17;
  const wireColor = isShort ? '#ef4444' : '#10b981';
  const returnColor = isShort ? '#ef4444' : '#71717a';

  return (
    <g
      className="cursor-pointer transition-all duration-150"
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {/* Generous Hit Box */}
      <rect
        x={x - 68}
        y={topY - 24}
        width={96}
        height={bottomY - topY + 48}
        rx="8"
        fill="#18181b"
        fillOpacity={isHovered ? 0.35 : 0}
        stroke="#27272a"
        strokeWidth="1"
        strokeOpacity={isHovered ? 0.8 : 0}
        pointerEvents="all"
        className="transition-all duration-150"
      />

      <g className="pointer-events-none">
        {/* Top Lead: From topY to Circle Top */}
        <line
          x1={x}
          y1={topY}
          x2={x}
          y2={centerY - radius}
          stroke={wireColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Animated electron flow down top lead */}
        {animateFlow && !isShort && (
          <line
            x1={x}
            y1={topY}
            x2={x}
            y2={centerY - radius}
            stroke="#a7f3d0"
            strokeWidth="2"
            strokeDasharray="3 6"
            className="electron-down"
            style={{ opacity: 0.8 }}
          />
        )}

        {/* Upward VCC Terminal Symbol at top */}
        <path
          d={`M ${x - 6} ${topY - 2} L ${x} ${topY - 10} L ${x + 6} ${topY - 2}`}
          fill="none"
          stroke={wireColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={isHovered ? 'url(#emerald-glow)' : undefined}
        />
        <text
          x={x}
          y={topY - 14}
          fill={wireColor}
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          VCC
        </text>

        {/* DC Source Circle */}
        <circle
          cx={x}
          cy={centerY}
          r={radius}
          fill="#0c1612"
          stroke={wireColor}
          strokeWidth={isHovered ? '2.8' : '2.2'}
          filter={isHovered ? 'url(#emerald-glow)' : undefined}
        />

        {/* Polarity Markers inside Circle */}
        <text
          x={x}
          y={centerY - 4}
          fill="#34d399"
          fontSize="13"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          +
        </text>
        <text
          x={x}
          y={centerY + 11}
          fill="#a1a1aa"
          fontSize="14"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          -
        </text>

        {/* Source Labels on the Left */}
        <text
          x={x - 24}
          y={centerY - 2}
          fill="#34d399"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="end"
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          Vin
        </text>
        <text
          x={x - 24}
          y={centerY + 11}
          fill="#e4e4e7"
          fontSize="10"
          fontWeight="600"
          fontFamily="monospace"
          textAnchor="end"
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          {voltageValue || '0'} {voltageUnit}
        </text>

        {/* Bottom Lead: From Circle Bottom to bottomY */}
        <line
          x1={x}
          y1={centerY + radius}
          x2={x}
          y2={bottomY}
          stroke={returnColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Downward GND Symbol hanging below bottomY */}
        <line x1={x - 12} y1={bottomY + 1} x2={x + 12} y2={bottomY + 1} stroke="#71717a" strokeWidth="2.2" strokeLinecap="round" />
        <line x1={x - 7} y1={bottomY + 5} x2={x + 7} y2={bottomY + 5} stroke="#71717a" strokeWidth="1.8" strokeLinecap="round" />
        <line x1={x - 3} y1={bottomY + 9} x2={x + 3} y2={bottomY + 9} stroke="#71717a" strokeWidth="1.4" strokeLinecap="round" />
        <text
          x={x}
          y={bottomY + 20}
          fill="#71717a"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          GND (0V)
        </text>
      </g>
    </g>
  );
});
