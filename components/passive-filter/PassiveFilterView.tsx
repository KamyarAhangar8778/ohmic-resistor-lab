'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Activity, Sliders, Waves, Layers } from 'lucide-react';
import { FilterState, FilterTopology, FilterType, ResistanceUnit, CapacitanceUnit, InductanceUnit, FrequencyUnit } from '@/types/passive-filter';
import { calculatePassiveFilter, findStandardFilterPairs } from '@/lib/passive-filter-calc';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FilterSchematic } from './FilterSchematic';
import { FilterBodePlot } from './FilterBodePlot';
import { FilterResultDisplay } from './FilterResultDisplay';
import { FilterStandardPicker } from './FilterStandardPicker';
import { cn, sanitizeNumericInput } from '@/lib/utils';

const DEFAULT_FILTER_STATE: FilterState = {
  topology: 'rc',
  type: 'lowpass',
  resistance: '10',
  resistanceUnit: 'kOhm',
  capacitance: '100',
  capacitanceUnit: 'nF',
  inductance: '10',
  inductanceUnit: 'mH',
  testFrequency: '1',
  testFrequencyUnit: 'kHz',
  vinPeak: '5',
};

export function PassiveFilterView() {
  const [state, setState] = React.useState<FilterState>(DEFAULT_FILTER_STATE);

  const result = React.useMemo(() => {
    return calculatePassiveFilter(state);
  }, [state]);

  const standardPairs = React.useMemo(() => {
    if (!result.isValid || result.cutoffFreqHz <= 0) return [];
    return findStandardFilterPairs(result.cutoffFreqHz, state.topology, 5);
  }, [result.isValid, result.cutoffFreqHz, state.topology]);

  const updateField = React.useCallback(
    <K extends keyof FilterState>(field: K, value: FilterState[K]) => {
      setState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleApplyStandardPair = React.useCallback(
    (resistor: string, resUnit: string, reactive: string, reactiveUnit: string) => {
      setState((prev) => ({
        ...prev,
        resistance: resistor,
        resistanceUnit: resUnit as ResistanceUnit,
        ...(prev.topology === 'rc'
          ? { capacitance: reactive, capacitanceUnit: reactiveUnit as CapacitanceUnit }
          : { inductance: reactive, inductanceUnit: reactiveUnit as InductanceUnit }),
      }));
    },
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="space-y-6"
    >
      {/* Title & Mode Header */}
      <div className="border-b border-zinc-800/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>آزمایشگاه فیلترهای پسیو فرکانسی</span>
              <Badge variant="subtle" className="text-[11px] font-mono border-emerald-900/50 bg-emerald-950/40 text-emerald-400">
                RC / RL Filter
              </Badge>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              طراحی و تحلیل فرکانس قطع (-3dB)، ثابت زمانی، دیاگرام بُد (Bode Plot) و پاسخ دامنه‌ای فیلترهای پسیو
            </p>
          </div>

          {/* Top Filter Configuration Switches */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Low-pass vs High-pass Selector */}
            <div className="inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg text-xs font-mono">
              <button
                type="button"
                onClick={() => updateField('type', 'lowpass')}
                className={cn(
                  'px-3 py-1.5 rounded-md transition-colors cursor-pointer',
                  state.type === 'lowpass' ? 'bg-zinc-800 text-white font-semibold shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                پایین‌گذر (Low-Pass)
              </button>
              <button
                type="button"
                onClick={() => updateField('type', 'highpass')}
                className={cn(
                  'px-3 py-1.5 rounded-md transition-colors cursor-pointer',
                  state.type === 'highpass' ? 'bg-zinc-800 text-white font-semibold shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                بالا‌گذر (High-Pass)
              </button>
            </div>

            {/* Topology Selector: RC vs RL */}
            <div className="inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg text-xs font-mono">
              <button
                type="button"
                onClick={() => updateField('topology', 'rc')}
                className={cn(
                  'px-3 py-1.5 rounded-md transition-colors cursor-pointer',
                  state.topology === 'rc' ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                شبکه RC
              </button>
              <button
                type="button"
                onClick={() => updateField('topology', 'rl')}
                className={cn(
                  'px-3 py-1.5 rounded-md transition-colors cursor-pointer',
                  state.topology === 'rl' ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                شبکه RL
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Component Inputs & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Resistor Input */}
        <div className="rounded-xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 p-3.5 space-y-2">
          <label className="text-xs text-zinc-400 font-medium block">مقاومت فیلتر (R)</label>
          <div className="flex items-center gap-1.5">
            <Input
              type="text"
              inputMode="decimal"
              dir="ltr"
              value={state.resistance}
              onChange={(e) => updateField('resistance', sanitizeNumericInput(e.target.value))}
              placeholder="10"
              className="font-mono text-sm h-9 flex-1"
            />
            <select
              value={state.resistanceUnit}
              onChange={(e) => updateField('resistanceUnit', e.target.value as ResistanceUnit)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-md h-9 px-2 font-mono cursor-pointer"
            >
              <option value="Ohm">Ω</option>
              <option value="kOhm">kΩ</option>
              <option value="MOhm">MΩ</option>
            </select>
          </div>
        </div>

        {/* Capacitor or Inductor Input */}
        <div className="rounded-xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 p-3.5 space-y-2">
          <label className="text-xs text-zinc-400 font-medium block">
            {state.topology === 'rc' ? 'خازن فیلتر (C)' : 'سلف فیلتر (L)'}
          </label>
          <div className="flex items-center gap-1.5">
            <Input
              type="text"
              inputMode="decimal"
              dir="ltr"
              value={state.topology === 'rc' ? state.capacitance : state.inductance}
              onChange={(e) =>
                state.topology === 'rc'
                  ? updateField('capacitance', sanitizeNumericInput(e.target.value))
                  : updateField('inductance', sanitizeNumericInput(e.target.value))
              }
              placeholder="100"
              className="font-mono text-sm h-9 flex-1"
            />
            {state.topology === 'rc' ? (
              <select
                value={state.capacitanceUnit}
                onChange={(e) => updateField('capacitanceUnit', e.target.value as CapacitanceUnit)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-md h-9 px-2 font-mono cursor-pointer"
              >
                <option value="pF">pF</option>
                <option value="nF">nF</option>
                <option value="uF">µF</option>
              </select>
            ) : (
              <select
                value={state.inductanceUnit}
                onChange={(e) => updateField('inductanceUnit', e.target.value as InductanceUnit)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-md h-9 px-2 font-mono cursor-pointer"
              >
                <option value="uH">µH</option>
                <option value="mH">mH</option>
                <option value="H">H</option>
              </select>
            )}
          </div>
        </div>

        {/* Test Frequency Input */}
        <div className="rounded-xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 p-3.5 space-y-2">
          <label className="text-xs text-zinc-400 font-medium block">فرکانس سیگنال تست (fin)</label>
          <div className="flex items-center gap-1.5">
            <Input
              type="text"
              inputMode="decimal"
              dir="ltr"
              value={state.testFrequency}
              onChange={(e) => updateField('testFrequency', sanitizeNumericInput(e.target.value))}
              placeholder="1"
              className="font-mono text-sm h-9 flex-1"
            />
            <select
              value={state.testFrequencyUnit}
              onChange={(e) => updateField('testFrequencyUnit', e.target.value as FrequencyUnit)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-md h-9 px-2 font-mono cursor-pointer"
            >
              <option value="Hz">Hz</option>
              <option value="kHz">kHz</option>
              <option value="MHz">MHz</option>
            </select>
          </div>
        </div>

        {/* Input Voltage Peak */}
        <div className="rounded-xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 p-3.5 space-y-2">
          <label className="text-xs text-zinc-400 font-medium block">دامنه ورودی (Vin Peak)</label>
          <div className="flex items-center gap-1.5">
            <Input
              type="text"
              inputMode="decimal"
              dir="ltr"
              value={state.vinPeak}
              onChange={(e) => updateField('vinPeak', sanitizeNumericInput(e.target.value))}
              placeholder="5"
              className="font-mono text-sm h-9 flex-1"
            />
            <span className="inline-flex items-center justify-center bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs rounded-md h-9 px-3 font-mono">
              Vpk
            </span>
          </div>
        </div>
      </div>

      {/* Main Analysis Display: Hero Metrics Card */}
      <FilterResultDisplay state={state} result={result} />

      {/* Circuit Schematic & Interactive SVG */}
      <FilterSchematic state={state} result={result} />

      {/* Bode Diagram Frequency Response Plot */}
      <FilterBodePlot result={result} testFreqHz={result.testFreqHz} />

      {/* Standard Commercial Component Recommendations */}
      <FilterStandardPicker
        pairs={standardPairs}
        topology={state.topology}
        targetFcDisplay={`${result.displayFc} ${result.displayFcUnit}`}
        onApplyPair={handleApplyStandardPair}
      />
    </motion.div>
  );
}
