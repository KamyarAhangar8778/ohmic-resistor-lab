import * as React from 'react';

interface SchematicVccProps {
  x: number;
  y: number;
  label?: string;
  sublabel?: string;
  color?: string;
  glow?: boolean;
}

/**
 * SchematicVcc renders a professional "Supply Rail" VCC terminal.
 * Standard representation: Upward arrow or circle node with supply text.
 */
export const SchematicVcc = React.memo(function SchematicVcc({
  x,
  y,
  label = 'VCC',
  sublabel,
  color = '#10b981',
  glow = false,
}: SchematicVccProps) {
  return (
    <g className="cursor-default">
      {/* Professional Supply Bar (T-Symbol) */}
      <line
        x1={x - 10}
        y1={y}
        x2={x + 10}
        y2={y}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        filter={glow ? 'url(#emerald-glow)' : undefined}
      />
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={y + 10}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Labelling (Professional CAD Style) */}
      <text
        x={x}
        y={y - 8}
        fill={color}
        fontSize="11.5"
        fontWeight="bold"
        fontFamily="monospace"
        textAnchor="middle"
        style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
      >
        {label}
      </text>
      
      {sublabel && (
        <text
          x={x}
          y={y - 27}
          fill="#a1a1aa"
          fontSize="10"
          fontFamily="monospace"
          textAnchor="middle"
          style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
        >
          {sublabel}
        </text>
      )}
    </g>
  );
});
