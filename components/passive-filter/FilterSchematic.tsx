'use client';

import * as React from 'react';
import { FilterState, FilterCalculationResult } from '@/types/passive-filter';
import { SymbolStandard, SchematicLegendItem } from '../schematic-core/schematic-types';
import { SchematicCard } from '../schematic-core/SchematicCard';
import { SchematicGround } from '../schematic-core/SchematicGround';
import { SchematicTerminalPad } from '../schematic-core/SchematicTerminalPad';
import { SchematicResistor } from '../schematic-core/SchematicResistor';
import { SchematicNode } from '../schematic-core/SchematicNode';

interface FilterSchematicProps {
  state: FilterState;
  result: FilterCalculationResult;
}

const FILTER_LEGEND: SchematicLegendItem[] = [
  { label: 'سیگنال متناوب Vin', color: '#10b981', shape: 'circle', textColor: 'text-zinc-300' },
  { label: 'پروب خروجی فیلتر Vout', color: '#34d399', shape: 'circle', textColor: 'text-emerald-400' },
  { label: 'المان‌های پسیو (R, C, L)', color: '#f59e0b', shape: 'square', textColor: 'text-zinc-300' },
  { label: 'زمین مرجع مدار GND', color: '#71717a', shape: 'circle', textColor: 'text-zinc-400' },
  { label: 'شارش جریان متناوب (AC)', color: '#10b981', shape: 'dash', textColor: 'text-emerald-400' },
];

export const FilterSchematic = React.memo(function FilterSchematic({
  state,
  result,
}: FilterSchematicProps) {
  const [symbolStandard, setSymbolStandard] = React.useState<SymbolStandard>('ieee');
  const [animateFlow, setAnimateFlow] = React.useState<boolean>(true);
  const [hoveredElement, setHoveredElement] = React.useState<string | null>(null);

  const isLowPass = state.type === 'lowpass';
  const isRC = state.topology === 'rc';

  // Geometry layout coordinates
  const vinX = 60;
  const seriesX1 = 110;
  const seriesX2 = 210;
  const nodeX = 260;
  const voutX = 370;
  const gndY = 200;
  const lineY = 80;
  const shuntTopY = 100;
  const shuntBottomY = 160;

  const wireColor = '#10b981';
  const returnColor = '#71717a';

  const rUnitText = state.resistanceUnit === 'Ohm' ? 'Ω' : state.resistanceUnit === 'kOhm' ? 'kΩ' : 'MΩ';
  const cText = `${state.capacitance} ${state.capacitanceUnit}`;
  const lText = `${state.inductance} ${state.inductanceUnit}`;

  return (
    <SchematicCard
      title={
        isLowPass
          ? `شماتیک فیلتر پایین‌گذر پسیو (${isRC ? 'RC Low-Pass' : 'RL Low-Pass'})`
          : `شماتیک فیلتر بالا‌گذر پسیو (${isRC ? 'RC High-Pass' : 'RL High-Pass'})`
      }
      subtitle="نمای اتصالات المان‌های پسیو، پایانه ورودی سیگنال AC و خروجی تضعیف‌شده"
      svgHeight={240}
      minContentWidth={440}
      symbolStandard={symbolStandard}
      onSymbolStandardChange={setSymbolStandard}
      animateFlow={animateFlow}
      onAnimateFlowChange={setAnimateFlow}
      legendItems={FILTER_LEGEND}
    >
      {({ symbolStandard: std, animateFlow: flow }) => (
        <g>
          {/* ================= 1. AC INPUT TERMINAL ================= */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => setHoveredElement('vin')}
            onMouseLeave={() => setHoveredElement(null)}
          >
            <circle
              cx={vinX}
              cy={lineY}
              r="7"
              fill="#09090b"
              stroke={wireColor}
              strokeWidth="2"
            />
            {/* Live AC Sine Wave Icon inside Terminal */}
            <path
              d={`M ${vinX - 4} ${lineY} Q ${vinX - 2} ${lineY - 3} ${vinX} ${lineY} T ${vinX + 4} ${lineY}`}
              fill="none"
              stroke={wireColor}
              strokeWidth="1.5"
            />
            <text
              x={vinX - 24}
              y={lineY - 14}
              fill="#34d399"
              fontSize="12"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="start"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
            >
              VIN (AC)
            </text>
            <text
              x={vinX - 24}
              y={lineY + 24}
              fill="#a1a1aa"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="start"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
            >
              {state.vinPeak}Vpk
            </text>
          </g>

          {/* Line Vin to Series Component */}
          <line x1={vinX + 8} y1={lineY} x2={seriesX1} y2={lineY} stroke={wireColor} strokeWidth="2.5" strokeLinecap="round" />
          {flow && (
            <line
              x1={vinX + 8}
              y1={lineY}
              x2={seriesX1}
              y2={lineY}
              stroke="#a7f3d0"
              strokeWidth="2"
              strokeDasharray="3 6"
              className="electron-flow"
            />
          )}

          {/* ================= 2. SERIES COMPONENT ================= */}
          {/* In RC: Low-pass has R series, High-pass has C series */}
          {/* In RL: Low-pass has L series, High-pass has R series */}
          {(isRC && isLowPass) || (!isRC && !isLowPass) ? (
            /* Series Resistor */
            <g
              transform={`translate(${seriesX1 + 10}, ${lineY - 45}) rotate(90, 40, 45)`}
              className="cursor-pointer"
            >
              <SchematicResistor
                x={40}
                topY={5}
                bottomY={85}
                tag="R"
                valueText={`${state.resistance} ${rUnitText}`}
                symbolStandard={std}
                isHovered={hoveredElement === 'r'}
                animateFlow={flow}
                onHover={(h) => setHoveredElement(h ? 'r' : null)}
              />
            </g>
          ) : isRC && !isLowPass ? (
            /* Series Capacitor */
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredElement('c')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <line x1={seriesX1} y1={lineY} x2={156} y2={lineY} stroke={wireColor} strokeWidth="2" />
              <line x1={156} y1={lineY - 14} x2={156} y2={lineY + 14} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={164} y1={lineY - 14} x2={164} y2={lineY + 14} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={164} y1={lineY} x2={seriesX2} y2={lineY} stroke={wireColor} strokeWidth="2" />
              <text
                x={140}
                y={lineY - 20}
                fill="#fbbf24"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
                style={{ direction: 'ltr' }}
              >
                C ({cText})
              </text>
            </g>
          ) : (
            /* Series Inductor (RL Low-Pass) */
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredElement('l')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <line x1={seriesX1} y1={lineY} x2={135} y2={lineY} stroke={wireColor} strokeWidth="2" />
              {/* 3 Inductor Coils */}
              <path
                d="M 135 80 A 7 7 0 0 1 149 80 A 7 7 0 0 1 163 80 A 7 7 0 0 1 177 80 A 7 7 0 0 1 191 80"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line x1={191} y1={lineY} x2={seriesX2} y2={lineY} stroke={wireColor} strokeWidth="2" />
              <text
                x={145}
                y={lineY - 18}
                fill="#fbbf24"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
                style={{ direction: 'ltr' }}
              >
                L ({lText})
              </text>
            </g>
          )}

          {/* Line from Series to Node */}
          <line x1={seriesX2} y1={lineY} x2={nodeX} y2={lineY} stroke={wireColor} strokeWidth="2.5" strokeLinecap="round" />
          {flow && (
            <line
              x1={seriesX2}
              y1={lineY}
              x2={nodeX}
              y2={lineY}
              stroke="#a7f3d0"
              strokeWidth="2"
              strokeDasharray="3 6"
              className="electron-flow"
            />
          )}

          {/* ================= 3. CENTRAL JUNCTION NODE ================= */}
          <SchematicNode cx={nodeX} cy={lineY} color={wireColor} glow={hoveredElement === 'vout'} />

          {/* Line to Output Probe */}
          <line x1={nodeX} y1={lineY} x2={voutX} y2={lineY} stroke={wireColor} strokeWidth="2.5" strokeLinecap="round" />
          {flow && (
            <line
              x1={nodeX}
              y1={lineY}
              x2={voutX}
              y2={lineY}
              stroke="#a7f3d0"
              strokeWidth="2"
              strokeDasharray="3 6"
              className="electron-flow"
            />
          )}

          {/* ================= 4. OUTPUT PROBE TERMINAL ================= */}
          <SchematicTerminalPad
            cx={voutX}
            cy={lineY}
            tag="Vout"
            sublabel={`${result.voutPeak}Vpk (${result.gainAtTestDb}dB)`}
            color="#34d399"
            tagColor="#34d399"
            labelPosition="right"
            glow={hoveredElement === 'vout'}
            onMouseEnter={() => setHoveredElement('vout')}
            onMouseLeave={() => setHoveredElement(null)}
          />

          {/* ================= 5. SHUNT COMPONENT (TO GROUND) ================= */}
          <line x1={nodeX} y1={lineY} x2={nodeX} y2={shuntTopY} stroke={wireColor} strokeWidth="2" />
          {flow && (
            <line
              x1={nodeX}
              y1={lineY}
              x2={nodeX}
              y2={shuntTopY}
              stroke="#a7f3d0"
              strokeWidth="1.5"
              strokeDasharray="3 6"
              className="electron-down"
            />
          )}

          {/* In RC Low-pass: Shunt is C. In RC High-pass: Shunt is R. */}
          {/* In RL Low-pass: Shunt is R. In RL High-pass: Shunt is L. */}
          {isRC && isLowPass ? (
            /* Shunt Capacitor */
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredElement('c')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <line x1={nodeX} y1={shuntTopY} x2={nodeX} y2={124} stroke={wireColor} strokeWidth="2" />
              <line x1={nodeX - 14} y1={124} x2={nodeX + 14} y2={124} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={nodeX - 14} y1={132} x2={nodeX + 14} y2={132} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1={nodeX} y1={132} x2={nodeX} y2={shuntBottomY} stroke={returnColor} strokeWidth="2" />
              <text
                x={nodeX + 22}
                y={132}
                fill="#fbbf24"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
                style={{ direction: 'ltr' }}
              >
                C: {cText}
              </text>
            </g>
          ) : (!isRC && isLowPass) || (isRC && !isLowPass) ? (
            /* Shunt Resistor */
            <SchematicResistor
              x={nodeX}
              topY={shuntTopY}
              bottomY={shuntBottomY}
              tag="R"
              valueText={`${state.resistance} ${rUnitText}`}
              symbolStandard={std}
              isHovered={hoveredElement === 'r'}
              animateFlow={flow}
              onHover={(h) => setHoveredElement(h ? 'r' : null)}
            />
          ) : (
            /* Shunt Inductor (RL High-Pass) */
            <g
              className="cursor-pointer"
              onMouseEnter={() => setHoveredElement('l')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <line x1={nodeX} y1={shuntTopY} x2={nodeX} y2={108} stroke={wireColor} strokeWidth="2" />
              <path
                d="M 260 108 A 7 7 0 0 1 260 122 A 7 7 0 0 1 260 136 A 7 7 0 0 1 260 150"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line x1={nodeX} y1={150} x2={nodeX} y2={shuntBottomY} stroke={returnColor} strokeWidth="2" />
              <text
                x={nodeX + 22}
                y={132}
                fill="#fbbf24"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
                style={{ direction: 'ltr' }}
              >
                L: {lText}
              </text>
            </g>
          )}

          {/* Line Shunt to Ground */}
          <line x1={nodeX} y1={shuntBottomY} x2={nodeX} y2={gndY} stroke={returnColor} strokeWidth="2" />
          <SchematicGround x={nodeX} y={gndY} color={returnColor} />
        </g>
      )}
    </SchematicCard>
  );
});
