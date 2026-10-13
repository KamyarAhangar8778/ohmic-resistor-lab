import * as React from 'react';

export interface SchematicTerminalPadProps {
  cx: number;
  cy: number;
  tag: string;
  sublabel?: string;
  leadToX?: number;
  leadToY?: number;
  color?: string;
  tagColor?: string;
  sublabelColor?: string;
  bgColor?: string;
  borderColor?: string;
  labelPosition?: 'left' | 'right';
  hasAura?: boolean;
  glow?: boolean;
  glowFilterId?: string;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const SchematicTerminalPad = React.memo(function SchematicTerminalPad({
  cx,
  cy,
  tag,
  sublabel,
  leadToX,
  leadToY,
  color = '#10b981',
  tagColor,
  sublabelColor = '#a1a1aa',
  bgColor,
  borderColor,
  labelPosition = 'left',
  hasAura = true,
  glow = false,
  glowFilterId = 'url(#emerald-glow)',
  className,
  onMouseEnter,
  onMouseLeave,
}: SchematicTerminalPadProps) {
  const padBg = bgColor || (color === '#10b981' || color === '#34d399' ? '#10231b' : '#18181b');
  const padBorder = borderColor || (color === '#10b981' || color === '#34d399' ? '#10b981' : '#52525b');
  const titleColor = tagColor || (color === '#10b981' || color === '#34d399' ? '#34d399' : '#a1a1aa');

  const textX = labelPosition === 'left' ? cx - 20 : cx + 20;
  const textAnchor = labelPosition === 'left' ? 'end' : 'start';

  return (
    <g
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Invisible generous hit target */}
      <rect
        x={labelPosition === 'left' ? cx - 80 : cx - 16}
        y={cy - 16}
        width={96}
        height={34}
        rx={6}
        fill="transparent"
        pointerEvents="all"
      />

      <g className="pointer-events-none">
        {/* Terminal Pad Frame */}
        <rect
          x={cx - 14}
          y={cy - 14}
          width="28"
          height="28"
          rx="6"
          fill={padBg}
          stroke={padBorder}
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />

        {/* Pulsing Aura Circle */}
        {hasAura && (
          <circle
            cx={cx}
            cy={cy}
            r="9.5"
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity="0.4"
          >
            <animate
              attributeName="r"
              values="8.5;11.5;8.5"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.15;0.6"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Node Ring */}
        <circle
          cx={cx}
          cy={cy}
          r="6.5"
          fill="#09090b"
          stroke={color}
          strokeWidth="2.5"
          filter={glow ? glowFilterId : undefined}
        />
        {/* Inner Node Core */}
        <circle cx={cx} cy={cy} r="2.5" fill={color} />

        {/* Lead wire to conductor bus */}
        {leadToX !== undefined && leadToY !== undefined && (
          <line
            x1={labelPosition === 'left' ? cx + 7 : cx - 7}
            y1={cy}
            x2={leadToX}
            y2={leadToY}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Terminal Title */}
        <text
          x={textX}
          y={sublabel ? cy - 2 : cy + 4}
          fill={titleColor}
          fontSize="12"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor={textAnchor}
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          {tag}
        </text>

        {/* Optional Secondary Value Label */}
        {sublabel && (
          <text
            x={textX}
            y={cy + 13}
            fill={sublabelColor}
            fontSize="10"
            fontFamily="monospace"
            textAnchor={textAnchor}
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
          >
            {sublabel}
          </text>
        )}
      </g>
    </g>
  );
});
