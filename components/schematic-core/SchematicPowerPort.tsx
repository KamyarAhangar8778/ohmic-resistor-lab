import * as React from 'react';

export interface SchematicPowerPortProps {
  x: number;
  y: number;
  stemLength?: number;
  direction?: 'up' | 'left';
  label?: string;
  sublabel?: string;
  symbol?: 'arrow' | 'bar' | 'circle';
  color?: string;
  textColor?: string;
  sublabelColor?: string;
  glow?: boolean;
  glowFilterId?: string;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * SchematicPowerPort renders a professional EDA power rail port (VCC / Vin / VDD).
 * Standardized for electrical engineering schematics (IEEE/IEC/Altium/KiCad style).
 * Strictly formatted in LTR orientation.
 */
export const SchematicPowerPort = React.memo(function SchematicPowerPort({
  x,
  y,
  stemLength = 16,
  direction = 'up',
  label = 'VCC',
  sublabel,
  symbol = 'arrow',
  color = '#10b981',
  textColor = '#34d399',
  sublabelColor = '#a1a1aa',
  glow = false,
  glowFilterId = 'url(#emerald-glow)',
  className,
  onMouseEnter,
  onMouseLeave,
}: SchematicPowerPortProps) {
  if (direction === 'left') {
    // Horizontal power port from the left
    const portX = x - stemLength;
    return (
      <g
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Generous Hit Target */}
        <rect
          x={portX - 60}
          y={y - 18}
          width={stemLength + 64}
          height={36}
          fill="transparent"
          pointerEvents="all"
        />

        <g className="pointer-events-none">
          {/* Conductor Stem */}
          <line
            x1={portX}
            y1={y}
            x2={x}
            y2={y}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Power Symbol Arrow pointing Right into circuit */}
          <path
            d={`M ${portX - 7} ${y - 6} L ${portX} ${y} L ${portX - 7} ${y + 6} Z`}
            fill={color}
            filter={glow ? glowFilterId : undefined}
          />

          {/* Solder junction node */}
          <circle cx={x} cy={y} r="3" fill="#09090b" stroke={color} strokeWidth="2" />
          <circle cx={x} cy={y} r="1.5" fill={color} />

          {/* Labels */}
          <text
            x={portX - 12}
            y={sublabel ? y - 2 : y + 4}
            fill={textColor}
            fontSize="12"
            fontWeight="bold"
            fontFamily="monospace"
            textAnchor="end"
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
          >
            {label}
          </text>
          {sublabel && (
            <text
              x={portX - 12}
              y={y + 12}
              fill={sublabelColor}
              fontSize="10"
              fontFamily="monospace"
              textAnchor="end"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
            >
              {sublabel}
            </text>
          )}
        </g>
      </g>
    );
  }

  // Default: Upward pointing Power Port (EDA Standard: VCC atop circuit)
  const tipY = y - stemLength;
  const arrowSize = 6;

  return (
    <g
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Generous Hit Target */}
      <rect
        x={x - 30}
        y={tipY - 20}
        width={60}
        height={stemLength + 24}
        fill="transparent"
        pointerEvents="all"
      />

      <g className="pointer-events-none">
        {/* Vertical Stem from circuit rail (y) to power port tip (tipY) */}
        <line
          x1={x}
          y1={y}
          x2={x}
          y2={tipY}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Upward Power Arrow Symbol */}
        {symbol === 'arrow' && (
          <path
            d={`M ${x - arrowSize} ${tipY + 2} L ${x} ${tipY - arrowSize} L ${x + arrowSize} ${tipY + 2} Z`}
            fill={color}
            filter={glow ? glowFilterId : undefined}
          />
        )}

        {/* T-Bar Symbol Variant */}
        {symbol === 'bar' && (
          <line
            x1={x - 8}
            y1={tipY}
            x2={x + 8}
            y2={tipY}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* Circle Variant */}
        {symbol === 'circle' && (
          <circle
            cx={x}
            cy={tipY}
            r="4.5"
            fill="#09090b"
            stroke={color}
            strokeWidth="2"
          />
        )}

        {/* Junction Dot on Circuit Rail */}
        <circle cx={x} cy={y} r="3" fill="#09090b" stroke={color} strokeWidth="2" />
        <circle cx={x} cy={y} r="1.5" fill={color} />

        {/* Port Title Label (VCC / Vin) */}
        <text
          x={x}
          y={tipY - 8}
          fill={textColor}
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          {label}
        </text>

        {/* Optional Secondary Voltage Sublabel (e.g., +12.0 V) */}
        {sublabel && (
          <text
            x={x}
            y={tipY - 20}
            fill={sublabelColor || '#ffffff'}
            fontSize="11"
            fontWeight="bold"
            fontFamily="monospace"
            textAnchor="middle"
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
          >
            {sublabel}
          </text>
        )}
      </g>
    </g>
  );
});
