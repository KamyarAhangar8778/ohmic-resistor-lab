'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Zap, Clock, Activity, Gauge, Compass } from 'lucide-react';
import { FilterCalculationResult, FilterState } from '@/types/passive-filter';
import { cn } from '@/lib/utils';

interface FilterResultDisplayProps {
  state: FilterState;
  result: FilterCalculationResult;
}

export const FilterResultDisplay = React.memo(function FilterResultDisplay({
  state,
  result,
}: FilterResultDisplayProps) {
  const [showFormula, setShowFormula] = React.useState(false);

  const isLowPass = state.type === 'lowpass';
  const isRC = state.topology === 'rc';

  return (
    <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 p-4 sm:p-5 shadow-xl space-y-4">
      {/* Top Main Result: Cutoff Frequency Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
        <div>
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            فرکانس قطع محاسباتی مدار (Cutoff Frequency -3dB):
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white tabular-nums">
              {result.displayFc}
            </span>
            <span className="text-base sm:text-lg font-mono font-semibold text-emerald-400">
              {result.displayFcUnit}
            </span>
          </div>
        </div>

        {/* Time Constant Badge / Pill */}
        <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800/90 px-3.5 py-2 rounded-xl shrink-0">
          <Clock className="h-4 w-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-zinc-400">ثابت زمانی (Time Constant τ)</div>
            <div className="text-sm font-mono font-bold text-zinc-100 tabular-nums">
              {result.displayTau} <span className="text-amber-400 text-xs font-normal">{result.displayTauUnit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Operating Metrics at Test Frequency */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Vout at Test Frequency */}
        <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950/60 space-y-1">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Zap className="h-3 w-3 text-cyan-400" />
            <span>دامنه خروجی (Vout)</span>
          </div>
          <div className="text-base font-mono font-bold text-zinc-100 tabular-nums">
            {result.voutPeak} <span className="text-xs font-normal text-zinc-400">Vpk</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            ورودی: {state.vinPeak}V
          </div>
        </div>

        {/* Metric 2: Gain in dB */}
        <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950/60 space-y-1">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Gauge className="h-3 w-3 text-emerald-400" />
            <span>ضریب بهره (Gain)</span>
          </div>
          <div className="text-base font-mono font-bold text-emerald-400 tabular-nums">
            {result.gainAtTestDb} <span className="text-xs font-normal text-zinc-400">dB</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            نسبت: {(result.gainAtTestLinear * 100).toFixed(1)}%
          </div>
        </div>

        {/* Metric 3: Phase Shift */}
        <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950/60 space-y-1">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Compass className="h-3 w-3 text-cyan-400" />
            <span>اختلاف فاز (Phase)</span>
          </div>
          <div className="text-base font-mono font-bold text-cyan-400 tabular-nums">
            {result.phaseAtTestDeg > 0 ? `+${result.phaseAtTestDeg}` : result.phaseAtTestDeg}°
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            {result.phaseAtTestDeg < 0 ? 'فاز پس‌فاز (Lag)' : 'فاز پیش‌فاز (Lead)'}
          </div>
        </div>

        {/* Metric 4: Reactance at Cutoff */}
        <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950/60 space-y-1">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
            <span>امپدانس در fc</span>
          </div>
          <div className="text-base font-mono font-bold text-amber-400 tabular-nums">
            {state.resistance} <span className="text-xs font-normal text-zinc-400">{state.resistanceUnit === 'Ohm' ? 'Ω' : state.resistanceUnit === 'kOhm' ? 'kΩ' : 'MΩ'}</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            {isRC ? 'Xc = R' : 'Xl = R'}
          </div>
        </div>
      </div>

      {/* Expandable Mathematical Formula Accordion */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowFormula((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1 cursor-pointer select-none"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <span>فرمول‌های فیزیک مدار و تابع انتقال فرکانسی</span>
          </span>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200 text-zinc-500', showFormula && 'rotate-180')}
          />
        </button>

        <AnimatePresence>
          {showFormula && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-2 text-xs font-mono text-zinc-300 space-y-2"
            >
              <div className="p-3 bg-zinc-950/90 rounded-lg border border-zinc-800 space-y-2" dir="ltr">
                <div>
                  <span className="text-zinc-500 text-[11px]"># Cutoff Frequency:</span>
                  <div className="text-emerald-400 font-bold">
                    {isRC ? 'fc = 1 / (2 * π * R * C)' : 'fc = R / (2 * π * L)'}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px]"># Time Constant:</span>
                  <div className="text-amber-400 font-bold">
                    {isRC ? 'τ = R * C' : 'τ = L / R'}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px]"># Transfer Function Magnitude:</span>
                  <div className="text-cyan-400 font-bold">
                    {isLowPass ? '|H(f)| = 1 / √(1 + (f / fc)²)' : '|H(f)| = (f / fc) / √(1 + (f / fc)²)'}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px]"># Phase Shift:</span>
                  <div className="text-zinc-300">
                    {isLowPass ? 'Phase(f) = -arctan(f / fc)' : 'Phase(f) = 90° - arctan(f / fc)'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
