import * as React from 'react';

interface SchematicNodeProps {
  cx: number;
  cy: number;
  color?: string;
  radius?: number;
  innerRadius?: number;
  glow?: boolean;
  glowFilterId?: string;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const SchematicNode = React.memo(function SchematicNode({
  cx,
  cy,
  color = '#10b981',
  radius = 4,
  innerRadius = 1.5,
  glow = false,
  glowFilterId = 'url(#emerald-glow)',
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: SchematicNodeProps) {
  return (
    <g
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="#09090b"
        stroke={color}
        strokeWidth="2.5"
        filter={glow ? glowFilterId : undefined}
      />
      <circle cx={cx} cy={cy} r={innerRadius} fill={color} />
    </g>
  );
});
