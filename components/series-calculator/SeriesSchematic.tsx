'use client';

import * as React from 'react';
import { ResistorItem } from '@/types/resistor';
import { SeriesCalculationResult, SeriesVoltageAnalysis } from '@/types/series-resistor';
import { SymbolStandard, SchematicLegendItem } from '../schematic-core/schematic-types';
import { SchematicCard } from '../schematic-core/SchematicCard';
import { SchematicSeriesResistor } from '../schematic-core/SchematicSeriesResistor';
import { SchematicTerminalPad } from '../schematic-core/SchematicTerminalPad';
import { SchematicNode } from '../schematic-core/SchematicNode';

interface SeriesSchematicProps {
  items: ResistorItem[];
  result: SeriesCalculationResult;
  voltageAnalysis: SeriesVoltageAnalysis;
}

const SERIES_LEGEND: SchematicLegendItem[] = [
  { label: 'پایانه مثبت ورودی Node A (+)', color: '#10b981', shape: 'circle', textColor: 'text-zinc-300' },
  { label: 'مقاومت‌های سری (Cascade)', color: '#f59e0b', shape: 'square', textColor: 'text-zinc-300' },
  { label: 'پایانه بازگشت Node B (-)', color: '#71717a', shape: 'circle', textColor: 'text-zinc-400' },
  { label: 'جریان مشترک سری (I)', color: '#10b981', shape: 'dash', textColor: 'text-emerald-400' },
];

export function SeriesSchematic({ items, result, voltageAnalysis }: SeriesSchematicProps) {
  const [symbolStandard, setSymbolStandard] = React.useState<SymbolStandard>('ieee');
  const [animateFlow, setAnimateFlow] = React.useState<boolean>(true);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const centerY = 96;
  const startX = 64;
  const resistorWidth = 110;
  const gap = 20;

  const validItems = items.filter((item) => parseFloat(item.value) > 0);
  const totalResistors = Math.max(1, validItems.length);
  const totalLength = totalResistors * resistorWidth + (totalResistors - 1) * gap;
  const endX = startX + 30 + totalLength + 30;
  const svgWidth = Math.max(520, endX + 64);
  const svgHeight = 192;

  return (
    <SchematicCard
      title="شماتیک مداری مقاومت‌های متوالی (Series Chain)"
      subtitle="نمای اتصالات سری، جریان یکسان در طول مدار و افت ولتاژ روی هر شاخه طبق قانون KVL"
      svgHeight={svgHeight}
      minContentWidth={svgWidth}
      symbolStandard={symbolStandard}
      onSymbolStandardChange={setSymbolStandard}
      animateFlow={animateFlow}
      onAnimateFlowChange={setAnimateFlow}
      legendItems={SERIES_LEGEND}
    >
      {({ symbolStandard: std, animateFlow: flow }) => (
        <g>
          {/* Node A (+) Left Terminal */}
          <SchematicTerminalPad
            cx={startX}
            cy={centerY}
            leadToX={startX + 30}
            leadToY={centerY}
            tag="A (+)"
            sublabel="ورودی"
            color="#10b981"
            labelPosition="left"
            hasAura={true}
          />

          {/* Sequential Resistors in Series */}
          {validItems.map((item, idx) => {
            const leftX = startX + 30 + idx * (resistorWidth + gap);
            const rightX = leftX + resistorWidth;
            const drop = voltageAnalysis.resistorDrops.find((d) => d.id === item.id);
            const unitText = item.unit === 'Ohm' ? 'Ω' : item.unit === 'kOhm' ? 'kΩ' : 'MΩ';

            return (
              <g key={item.id}>
                {/* Resistor Component */}
                <SchematicSeriesResistor
                  leftX={leftX}
                  rightX={rightX}
                  y={centerY}
                  tag={`R${idx + 1}`}
                  valueText={`${item.value} ${unitText}`}
                  metricBadge={
                    drop
                      ? {
                          text: `ΔV: ${drop.displayVoltageDrop}`,
                          color: '#fbbf24',
                        }
                      : null
                  }
                  symbolStandard={std}
                  isHovered={hoveredId === item.id}
                  isShort={result.isShortCircuit}
                  animateFlow={flow}
                  onHover={(h) => setHoveredId(h ? item.id : null)}
                />

                {/* Solder junction node between consecutive resistors */}
                {idx < validItems.length - 1 && (
                  <g>
                    <line
                      x1={rightX}
                      y1={centerY}
                      x2={rightX + gap}
                      y2={centerY}
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {flow && !result.isShortCircuit && (
                      <line
                        x1={rightX}
                        y1={centerY}
                        x2={rightX + gap}
                        y2={centerY}
                        stroke="#a7f3d0"
                        strokeWidth="2"
                        strokeDasharray="3 6"
                        className="electron-top"
                        style={{ opacity: 0.8 }}
                      />
                    )}
                    <SchematicNode cx={rightX + gap / 2} cy={centerY} color="#10b981" />
                  </g>
                )}
              </g>
            );
          })}

          {/* Lead wire to Node B */}
          <line
            x1={startX + 30 + totalLength}
            y1={centerY}
            x2={endX}
            y2={centerY}
            stroke="#71717a"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Node B (-) Right Terminal */}
          <SchematicTerminalPad
            cx={endX + 30}
            cy={centerY}
            leadToX={endX}
            leadToY={centerY}
            tag="B (-)"
            sublabel="خروجی"
            color="#71717a"
            tagColor="#a1a1aa"
            labelPosition="right"
            hasAura={false}
          />
        </g>
      )}
    </SchematicCard>
  );
}
