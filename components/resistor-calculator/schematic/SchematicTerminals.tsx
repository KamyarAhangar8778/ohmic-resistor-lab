import * as React from 'react';

interface SchematicTerminalsProps {
  terminalX: number;
  leftBusX: number;
  topBusY: number;
  bottomBusY: number;
}

/**
 * SchematicTerminals renders the input Node A (+) and return Node B (-) terminal pads,
 * leads, and engineering labels.
 * Strictly formatted in LTR orientation with textAnchor="end".
 */
export const SchematicTerminals = React.memo(function SchematicTerminals({
  terminalX,
  leftBusX,
  topBusY,
  bottomBusY,
}: SchematicTerminalsProps) {
  return (
    <>
      {/* Node A (Positive / Input Terminal) */}
      <g className="cursor-default">
        <rect
          x={terminalX - 14}
          y={topBusY - 14}
          width="28"
          height="28"
          rx="6"
          fill="#10231b"
          stroke="#10b981"
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />
        <circle
          cx={terminalX}
          cy={topBusY}
          r="9.5"
          fill="none"
          stroke="#10b981"
          strokeWidth="1"
          className="terminal-aura"
        />
        <circle
          cx={terminalX}
          cy={topBusY}
          r="6.5"
          fill="#09090b"
          stroke="#10b981"
          strokeWidth="2.5"
          filter="url(#emerald-glow)"
        />
        <circle cx={terminalX} cy={topBusY} r="2.5" fill="#34d399" />

        <line
          x1={terminalX + 7}
          y1={topBusY}
          x2={leftBusX}
          y2={topBusY}
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <text
          x={terminalX - 20}
          y={topBusY + 4}
          fill="#34d399"
          fontSize="12"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="end"
          style={{ direction: 'ltr' }}
        >
          A (+)
        </text>
      </g>

      {/* Node B (Return / Ground Terminal) */}
      <g className="cursor-default">
        <rect
          x={terminalX - 14}
          y={bottomBusY - 14}
          width="28"
          height="28"
          rx="6"
          fill="#18181b"
          stroke="#52525b"
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />
        <circle
          cx={terminalX}
          cy={bottomBusY}
          r="6.5"
          fill="#09090b"
          stroke="#71717a"
          strokeWidth="2.5"
        />
        <circle cx={terminalX} cy={bottomBusY} r="2.5" fill="#a1a1aa" />

        <line
          x1={terminalX + 7}
          y1={bottomBusY}
          x2={leftBusX}
          y2={bottomBusY}
          stroke="#71717a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <text
          x={terminalX - 20}
          y={bottomBusY + 4}
          fill="#a1a1aa"
          fontSize="12"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="end"
          style={{ direction: 'ltr' }}
        >
          B (-)
        </text>
      </g>
    </>
  );
});
