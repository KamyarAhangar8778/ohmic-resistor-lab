'use client';

import * as React from 'react';
import { VoltageDividerState, VoltageDividerResult } from '@/types/voltage-divider';
import { SymbolStandard, SchematicLegendItem } from '../schematic-core/schematic-types';
import { SchematicCard } from '../schematic-core/SchematicCard';
import { SchematicPowerPort } from '../schematic-core/SchematicPowerPort';
import { SchematicGround } from '../schematic-core/SchematicGround';
import { SchematicTerminalPad } from '../schematic-core/SchematicTerminalPad';
import { SchematicResistor } from '../schematic-core/SchematicResistor';
import { SchematicNode } from '../schematic-core/SchematicNode';

interface DividerSchematicProps {
  state: VoltageDividerState;
  result: VoltageDividerResult;
}

const DIVIDER_LEGEND: SchematicLegendItem[] = [
  { label: 'منبع تغذیه VCC', color: '#10b981', shape: 'circle', textColor: 'text-zinc-300' },
  { label: 'پروب خروجی Vout', color: '#34d399', shape: 'circle', textColor: 'text-emerald-400' },
  { label: 'مقاومت‌های R1 / R2', color: '#f59e0b', shape: 'square', textColor: 'text-zinc-300' },
  { label: 'زمین مرجع مدار GND (0V)', color: '#71717a', shape: 'circle', textColor: 'text-zinc-400' },
  { label: 'شارش متناسب جریان (I)', color: '#10b981', shape: 'dash', textColor: 'text-emerald-400' },
];

export const DividerSchematic = React.memo(function DividerSchematic({
  state,
  result,
}: DividerSchematicProps) {
  const [symbolStandard, setSymbolStandard] = React.useState<SymbolStandard>('ieee');
  const [animateFlow, setAnimateFlow] = React.useState<boolean>(true);
  const [hoveredElement, setHoveredElement] = React.useState<string | null>(null);

  // Exact EDA Layout coordinates matching CircuitSchematic reference
  // Centered vertical voltage divider column
  const divX = 140; // Directly aligns VCC, R1, mid-node, R2, and GND
  const loadX = divX + (state.hasLoad ? 120 : 0); // Optional RL branch
  const voutX = (state.hasLoad ? loadX : divX) + 128; // Output probe terminal X

  // Highly symmetrical, compact vertical geometry (18px leads, exactly 25% shorter)
  const vccY = 56;
  const r1TopY = 74;      // Line 1: vccY (56) -> r1TopY (74) = 18px (-25%)
  const r1BottomY = 122;  // R1 compact body span: 48px
  const midNodeY = 134;   // Line 2 midpoint (Vout junction): 122 -> 134 -> 146 = 24px
  const r2TopY = 146;     // Line 2: r1BottomY (122) -> r2TopY (146) = 24px
  const r2BottomY = 194;  // R2 compact body span: 48px
  const gndY = 212;       // Line 3: r2BottomY (194) -> gndY (212) = 18px (-25%)
  const svgHeight = 236;

  const minWidth = voutX + 90;
  const isShort = result.isShortCircuit;

  const r1UnitText = state.r1Unit === 'Ohm' ? 'Ω' : state.r1Unit === 'kOhm' ? 'kΩ' : 'MΩ';
  const r2UnitText = state.r2Unit === 'Ohm' ? 'Ω' : state.r2Unit === 'kOhm' ? 'kΩ' : 'MΩ';
  const rlUnitText = state.rlUnit === 'Ohm' ? 'Ω' : state.rlUnit === 'kOhm' ? 'kΩ' : 'MΩ';

  return (
    <SchematicCard
      title="شماتیک مداری تقسیم ولتاژ"
      subtitle="نمای اتصالات، پایانه‌ها، پروب خروجی و افت ولتاژ روی شاخه‌ها"
      svgHeight={svgHeight}
      minContentWidth={minWidth}
      symbolStandard={symbolStandard}
      onSymbolStandardChange={setSymbolStandard}
      animateFlow={animateFlow}
      onAnimateFlowChange={setAnimateFlow}
      legendItems={DIVIDER_LEGEND}
    >
      {({ symbolStandard: std, animateFlow: flow }) => (
        <g>
          {/* ================= 1. VCC POWER PORT (DIRECTLY ABOVE R1) ================= */}
          <SchematicPowerPort
            x={divX}
            y={vccY}
            direction="up"
            stemLength={16}
            label="VCC"
            sublabel={`${state.vin || '0'} ${state.vinUnit}`}
            color={isShort ? '#ef4444' : '#10b981'}
            textColor={isShort ? '#ef4444' : '#34d399'}
            sublabelColor="#ffffff"
            glow={hoveredElement === 'vin'}
            onMouseEnter={() => setHoveredElement('vin')}
            onMouseLeave={() => setHoveredElement(null)}
          />

          {/* ================= 2. LINE 1: VCC TO R1 (24px) ================= */}
          <line
            x1={divX}
            y1={vccY}
            x2={divX}
            y2={r1TopY}
            stroke={isShort ? '#ef4444' : '#10b981'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {flow && !isShort && (
            <line
              x1={divX}
              y1={vccY}
              x2={divX}
              y2={r1TopY}
              stroke="#a7f3d0"
              strokeWidth="2"
              strokeDasharray="3 6"
              className="electron-down"
              style={{ opacity: 0.85 }}
            />
          )}

          {/* ================= 3. RESISTOR R1 (HIGH-SIDE, COMPACT 48px) ================= */}
          <SchematicResistor
            x={divX}
            topY={r1TopY}
            bottomY={r1BottomY}
            tag="R1"
            valueText={`${state.r1 || '0'} ${r1UnitText}`}
            metricBadge={
              result.powerR1Watts !== null
                ? { text: `P: ${result.displayPowerR1}`, color: '#fbbf24' }
                : null
            }
            symbolStandard={std}
            isHovered={hoveredElement === 'r1'}
            isShort={isShort}
            animateFlow={flow}
            onHover={(h) => setHoveredElement(h ? 'r1' : null)}
          />

          {/* ================= 4. LINE 2: R1 TO R2 (24px, CENTERED TAP AT midNodeY) ================= */}
          <line
            x1={divX}
            y1={r1BottomY}
            x2={divX}
            y2={r2TopY}
            stroke={isShort ? '#ef4444' : '#10b981'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {flow && !isShort && (
            <line
              x1={divX}
              y1={r1BottomY}
              x2={divX}
              y2={r2TopY}
              stroke="#a7f3d0"
              strokeWidth="2"
              strokeDasharray="3 6"
              className="electron-down"
              style={{ opacity: 0.85 }}
            />
          )}

          {/* Solder junction node tapping Vout */}
          <SchematicNode cx={divX} cy={midNodeY} color="#10b981" glow={true} />

          {/* Horizontal Vout conductor rail: divX to voutX - 7 */}
          <line
            x1={divX}
            y1={midNodeY}
            x2={voutX - 7}
            y2={midNodeY}
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {flow && !isShort && (
            <line
              x1={divX}
              y1={midNodeY}
              x2={voutX - 7}
              y2={midNodeY}
              stroke="#6ee7b7"
              strokeWidth="2"
              strokeDasharray="4 8"
              strokeLinecap="round"
              className="electron-top"
              opacity="0.8"
            />
          )}

          {/* ================= 5. RESISTOR R2 (LOW-SIDE, COMPACT 48px) ================= */}
          <SchematicResistor
            x={divX}
            topY={r2TopY}
            bottomY={r2BottomY}
            tag="R2"
            valueText={`${state.r2 || '0'} ${r2UnitText}`}
            metricBadge={
              result.powerR2Watts !== null
                ? { text: `P: ${result.displayPowerR2}`, color: '#fbbf24' }
                : null
            }
            symbolStandard={std}
            isHovered={hoveredElement === 'r2'}
            isShort={isShort}
            animateFlow={flow}
            onHover={(h) => setHoveredElement(h ? 'r2' : null)}
          />

          {/* ================= 6. LINE 3: R2 TO GND (24px) ================= */}
          <line
            x1={divX}
            y1={r2BottomY}
            x2={divX}
            y2={gndY}
            stroke="#71717a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {flow && !isShort && (
            <line
              x1={divX}
              y1={r2BottomY}
              x2={divX}
              y2={gndY}
              stroke="#d4d4d8"
              strokeWidth="2"
              strokeDasharray="3 6"
              className="electron-down"
              style={{ opacity: 0.6 }}
            />
          )}

          {/* ================= 7. SINGLE GROUND SYMBOL (DIRECTLY UNDER R2) ================= */}
          <SchematicGround
            x={divX}
            y={gndY}
            stemLength={0}
            label="GND"
            sublabel="0V"
            color="#71717a"
            textColor="#a1a1aa"
          />

          {/* ================= 8. OPTIONAL LOAD RESISTOR RL (IN PARALLEL) ================= */}
          {state.hasLoad && (
            <g>
              {/* Solder junction on Vout rail */}
              <SchematicNode cx={loadX} cy={midNodeY} color="#10b981" />

              {/* Vertical Lead into RL top (matches R2 topY) */}
              <line
                x1={loadX}
                y1={midNodeY}
                x2={loadX}
                y2={r2TopY}
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {flow && !isShort && (
                <line
                  x1={loadX}
                  y1={midNodeY}
                  x2={loadX}
                  y2={r2TopY}
                  stroke="#a7f3d0"
                  strokeWidth="2"
                  strokeDasharray="3 6"
                  className="electron-down"
                  style={{ opacity: 0.85 }}
                />
              )}

              <SchematicResistor
                x={loadX}
                topY={r2TopY}
                bottomY={r2BottomY}
                tag="RL"
                valueText={`${state.rl || '0'} ${rlUnitText}`}
                metricBadge={
                  result.powerLoadWatts !== null
                    ? { text: `P: ${result.displayPowerLoad}`, color: '#fbbf24' }
                    : null
                }
                symbolStandard={std}
                isHovered={hoveredElement === 'rl'}
                isShort={isShort}
                animateFlow={flow}
                onHover={(h) => setHoveredElement(h ? 'rl' : null)}
              />

              {/* Vertical Lead from RL bottom to dedicated ground (18px) */}
              <line
                x1={loadX}
                y1={r2BottomY}
                x2={loadX}
                y2={gndY}
                stroke="#71717a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {flow && !isShort && (
                <line
                  x1={loadX}
                  y1={r2BottomY}
                  x2={loadX}
                  y2={gndY}
                  stroke="#d4d4d8"
                  strokeWidth="2"
                  strokeDasharray="3 6"
                  className="electron-down"
                  style={{ opacity: 0.6 }}
                />
              )}

              {/* Dedicated Ground Symbol for RL */}
              <SchematicGround
                x={loadX}
                y={gndY}
                stemLength={0}
                label="GND"
                sublabel="0V"
                color="#71717a"
                textColor="#a1a1aa"
              />
            </g>
          )}

          {/* ================= 9. OUTPUT PROBE TERMINAL (Vout) ================= */}
          <SchematicTerminalPad
            cx={voutX}
            cy={midNodeY}
            leadToX={voutX - 7}
            leadToY={midNodeY}
            tag="Vout"
            sublabel={`${result.displayVout} ${result.displayVoutUnit}`}
            color="#10b981"
            tagColor="#34d399"
            sublabelColor="#ffffff"
            labelPosition="right"
            hasAura={true}
            glow={hoveredElement === 'vout'}
            onMouseEnter={() => setHoveredElement('vout')}
            onMouseLeave={() => setHoveredElement(null)}
          />
        </g>
      )}
    </SchematicCard>
  );
});
