import * as React from 'react';

export interface SchematicGroundProps {
  x: number;
  y: number;
  stemLength?: number;
  variant?: 'earth' | 'signal';
  label?: string;
  sublabel?: string;
  color?: string;
  textColor?: string;
  labelPosition?: 'right' | 'left' | 'bottom';
  hasNodeDot?: boolean;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * SchematicGround renders a professional EDA ground symbol (Earth / Signal GND 0V).
 * Features standard 3-tier descending plates or signal triangle with connection stem.
 * Strictly formatted in LTR orientation.
 */
export const SchematicGround = React.memo(function SchematicGround({
  x,
  y,
  stemLength = 10,
  variant = 'earth',
  label = 'GND',
  sublabel = '0V',
  color = '#71717a',
  textColor = '#a1a1aa',
  labelPosition = 'right',
  hasNodeDot = false,
  className,
  onMouseEnter,
  onMouseLeave,
}: SchematicGroundProps) {
  const gndTopY = y + stemLength;

  return (
    <g
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Generous Hit Target */}
      <rect
        x={x - 24}
        y={y}
        width={48}
        height={stemLength + 22}
        fill="transparent"
        pointerEvents="all"
      />

      <g className="pointer-events-none">
        {/* Optional Node Solder Dot on Rail */}
        {hasNodeDot && (
          <>
            <circle cx={x} cy={y} r="3" fill="#09090b" stroke={color} strokeWidth="2" />
            <circle cx={x} cy={y} r="1.5" fill={color} />
          </>
        )}

        {/* Vertical Conductor Stem from rail (y) to ground plates (gndTopY) */}
        {stemLength > 0 && (
          <line
            x1={x}
            y1={y}
            x2={x}
            y2={gndTopY}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Standard IEEE Earth Ground: 3 descending parallel plates */}
        {variant === 'earth' ? (
          <g>
            {/* Top Plate (22px wide) */}
            <line
              x1={x - 11}
              y1={gndTopY}
              x2={x + 11}
              y2={gndTopY}
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Middle Plate (14px wide) */}
            <line
              x1={x - 7}
              y1={gndTopY + 4}
              x2={x + 7}
              y2={gndTopY + 4}
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Bottom Plate (6px wide) */}
            <line
              x1={x - 3}
              y1={gndTopY + 8}
              x2={x + 3}
              y2={gndTopY + 8}
              stroke={color}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </g>
        ) : (
          /* Signal Ground Triangle (▽) */
          <path
            d={`M ${x - 8} ${gndTopY} L ${x + 8} ${gndTopY} L ${x} ${gndTopY + 8} Z`}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {/* Labels strictly in LTR */}
        {labelPosition === 'right' && (
          <g>
            {label && (
              <text
                x={x + 15}
                y={sublabel ? gndTopY + 2 : gndTopY + 5}
                fill={textColor}
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="start"
                style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
              >
                {label}
              </text>
            )}
            {sublabel && (
              <text
                x={x + 15}
                y={gndTopY + 12}
                fill="#71717a"
                fontSize="9.5"
                fontFamily="monospace"
                textAnchor="start"
                style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
              >
                {sublabel}
              </text>
            )}
          </g>
        )}

        {labelPosition === 'left' && (
          <g>
            {label && (
              <text
                x={x - 15}
                y={sublabel ? gndTopY + 2 : gndTopY + 5}
                fill={textColor}
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="end"
                style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
              >
                {label}
              </text>
            )}
            {sublabel && (
              <text
                x={x - 15}
                y={gndTopY + 12}
                fill="#71717a"
                fontSize="9.5"
                fontFamily="monospace"
                textAnchor="end"
                style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
              >
                {sublabel}
              </text>
            )}
          </g>
        )}

        {labelPosition === 'bottom' && (
          <text
            x={x}
            y={gndTopY + 19}
            fill={textColor}
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
          >
            {sublabel ? `${label} (${sublabel})` : label}
          </text>
        )}
      </g>
    </g>
  );
});
