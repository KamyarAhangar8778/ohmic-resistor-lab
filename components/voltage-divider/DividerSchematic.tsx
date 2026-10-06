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
  { label: 'زمین مرجع مدار GND', color: '#71717a', shape: 'circle', textColor: 'text-zinc-400' },
  { label: 'شارش جریان (I)', color: '#10b981', shape: 'dash', textColor: 'text-emerald-400' },
];

export const DividerSchematic = React.memo(function DividerSchematic({
  state,
  result,
}: DividerSchematicProps) {
  const [symbolStandard, setSymbolStandard] = React.useState<SymbolStandard>('ieee');
  const [animateFlow, setAnimateFlow] = React.useState<boolean>(true);
  const [hoveredElement, setHoveredElement] = React.useState<string | null>(null);

  const appMode = state.appMode || 'sampling';

  // Centered vertical voltage divider column
  const divX = 130;
  const loadX = divX + (state.hasLoad ? 110 : 0);
  const voutX = (state.hasLoad ? loadX : divX) + 140;

  // Vertical geometry
  const vccY = 56;
  const r1TopY = 74;
  const r1BottomY = 122;
  const midNodeY = 134;
  const r2TopY = 146;
  const r2BottomY = 194;
  const gndY = 212;
  const svgHeight = 240;

  const minWidth = voutX + 100;
  const isShort = result.isShortCircuit;

  const r1UnitText = state.r1Unit === 'Ohm' ? 'Ω' : state.r1Unit === 'kOhm' ? 'kΩ' : 'MΩ';
  const r2UnitText = state.r2Unit === 'Ohm' ? 'Ω' : state.r2Unit === 'kOhm' ? 'kΩ' : 'MΩ';
  const rlUnitText = state.rlUnit === 'Ohm' ? 'Ω' : state.rlUnit === 'kOhm' ? 'kΩ' : 'MΩ';

  return (
    <SchematicCard
      title={
        appMode === 'sampling'
          ? 'شماتیک نمونه‌گیری ورودی ADC میکروکنترلر'
          : appMode === 'biasing'
          ? 'شماتیک بایاس بیس ترانزیستور BJT / MOSFET'
          : 'شماتیک تولید و بافر ولتاژ رفرنس دقیق'
      }
      subtitle="نمای گرافیکی شماتیک مدار، پایانه‌های اتصالات و نقاط تست تعاملی"
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
          {/* ================= 1. VCC POWER PORT ================= */}
          <SchematicPowerPort
            x={divX}
            y={vccY}
            direction="up"
            stemLength={16}
            label={appMode === 'biasing' ? 'VCC' : 'VIN'}
            sublabel={`${state.vin || '0'} ${state.vinUnit}`}
            color={isShort ? '#ef4444' : '#10b981'}
            textColor={isShort ? '#ef4444' : '#34d399'}
            sublabelColor="#ffffff"
            glow={hoveredElement === 'vin'}
            onMouseEnter={() => setHoveredElement('vin')}
            onMouseLeave={() => setHoveredElement(null)}
          />

          {/* ================= 2. LINE: VCC TO R1 ================= */}
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

          {/* ================= 3. RESISTOR R1 ================= */}
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

          {/* ================= 4. LINE: R1 TO R2 ================= */}
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

          {/* Midpoint Solder Node */}
          <SchematicNode cx={divX} cy={midNodeY} color="#10b981" glow={true} />

          {/* ================= 5. RESISTOR R2 ================= */}
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

          {/* ================= 6. LINE: R2 TO GND ================= */}
          <line
            x1={divX}
            y1={r2BottomY}
            x2={divX}
            y2={gndY}
            stroke="#71717a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <SchematicGround
            x={divX}
            y={gndY}
            stemLength={0}
            label="GND"
            sublabel="0V"
            color="#71717a"
            textColor="#a1a1aa"
          />

          {/* ================= 7. OPTIONAL LOAD RESISTOR (RL) IN PARALLEL ================= */}
          {state.hasLoad && (
            <g>
              {/* Solder junction on mid-rail */}
              <SchematicNode cx={loadX} cy={midNodeY} color="#10b981" glow={true} />

              {/* Lead down to RL */}
              <line
                x1={loadX}
                y1={midNodeY}
                x2={loadX}
                y2={r2TopY}
                stroke={isShort ? '#ef4444' : '#10b981'}
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

              {/* RL Component */}
              <SchematicResistor
                x={loadX}
                topY={r2TopY}
                bottomY={r2BottomY}
                tag="RL"
                valueText={`${state.rl || '0'} ${rlUnitText}`}
                metricBadge={
                  result.displayCurrentLoad
                    ? { text: `IL: ${result.displayCurrentLoad}`, color: '#34d399' }
                    : null
                }
                symbolStandard={std}
                isHovered={hoveredElement === 'rl'}
                isShort={isShort}
                animateFlow={flow}
                onHover={(h) => setHoveredElement(h ? 'rl' : null)}
              />

              {/* Return to GND */}
              <line
                x1={loadX}
                y1={r2BottomY}
                x2={loadX}
                y2={gndY}
                stroke="#71717a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
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

          {/* ================= 8. HORIZONTAL RAIL TO OUTPUT ================= */}
          <line
            x1={divX}
            y1={midNodeY}
            x2={voutX - 10}
            y2={midNodeY}
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* ================= 9. OUTPUT PROBE TERMINAL LABEL ================= */}
          <SchematicTerminalPad
            cx={voutX - 10}
            cy={midNodeY}
            leadToX={voutX - 10}
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
