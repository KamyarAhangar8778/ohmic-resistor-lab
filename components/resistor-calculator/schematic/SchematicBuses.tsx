import * as React from 'react';

interface SchematicBusesProps {
  leftBusX: number;
  rightBusX: number;
  topBusY: number;
  bottomBusY: number;
  animateFlow: boolean;
  isShortCircuit: boolean;
}

/**
 * SchematicBuses renders the main horizontal conductors (V+ Rail and Return Rail)
 * and their electron flow animations.
 */
export const SchematicBuses = React.memo(function SchematicBuses({
  leftBusX,
  rightBusX,
  topBusY,
  bottomBusY,
  animateFlow,
  isShortCircuit,
}: SchematicBusesProps) {
  return (
    <>
      {/* Top Bus (V+ Rail) */}
      <line
        x1={leftBusX}
        y1={topBusY}
        x2={rightBusX}
        y2={topBusY}
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Top Bus Animated Current Flow */}
      {animateFlow && !isShortCircuit && (
        <line
          x1={leftBusX}
          y1={topBusY}
          x2={rightBusX}
          y2={topBusY}
          stroke="#6ee7b7"
          strokeWidth="2"
          strokeDasharray="4 8"
          strokeLinecap="round"
          className="electron-top"
          opacity="0.8"
        />
      )}

      {/* Bottom Bus (Return Rail) */}
      <line
        x1={leftBusX}
        y1={bottomBusY}
        x2={rightBusX}
        y2={bottomBusY}
        stroke="#71717a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Bottom Bus Animated Current Flow */}
      {animateFlow && !isShortCircuit && (
        <line
          x1={rightBusX}
          y1={bottomBusY}
          x2={leftBusX}
          y2={bottomBusY}
          stroke="#d4d4d8"
          strokeWidth="2"
          strokeDasharray="4 8"
          strokeLinecap="round"
          className="electron-bottom"
          opacity="0.6"
        />
      )}
    </>
  );
});
