'use client';

import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AlertTriangle, Activity, Cpu, Gauge } from 'lucide-react';
import { VoltageDividerResult, VoltageDividerState } from '@/types/voltage-divider';
import { formatPrecision } from '@/lib/resistor-calc';
import { Badge } from '@/components/ui/badge';

interface DividerResultDisplayProps {
  state: VoltageDividerState;
  result: VoltageDividerResult;
}

export const DividerResultDisplay = React.memo(function DividerResultDisplay({
  state,
  result,
}: DividerResultDisplayProps) {
  const shouldReduceMotion = useReducedMotion();

  const r1UnitSym = state.r1Unit === 'kOhm' ? 'kΩ' : state.r1Unit === 'MOhm' ? 'MΩ' : 'Ω';
  const r2UnitSym = state.r2Unit === 'kOhm' ? 'kΩ' : state.r2Unit === 'MOhm' ? 'MΩ' : 'Ω';

  const targetVoutNum = parseFloat(state.vout || '0');
  const actualVoutNum = result.voutVolts ?? 0;
  const errorPct =
    targetVoutNum > 0
      ? Math.abs((actualVoutNum - targetVoutNum) / targetVoutNum) * 100
      : 0;

  const appMode = state.appMode || 'sampling';
  const rth = result.theveninResistanceOhms ?? 0;

  // Sampling mode metrics
  const ratioNum =
    result.voutVolts && result.vinVolts && result.vinVolts > 0
      ? result.voutVolts / result.vinVolts
      : 0;
  const dbAtten = ratioNum > 0 ? (20 * Math.log10(ratioNum)).toFixed(1) : '—';

  return (
    <div className="relative rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 p-5 sm:p-6 shadow-xl transition-all duration-200 overflow-hidden">
      {/* Top subtle hairline glow */}
      <motion.div
        key={`${state.r1}-${state.r2}-${appMode}`}
        initial={{ opacity: 0.2, scaleX: 0.8 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent origin-center"
      />

      {/* Short Circuit Warning Banner */}
      <AnimatePresence>
        {result.isShortCircuit && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, scale: 0.96, marginBottom: 0 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    height: 'auto',
                    scale: 1,
                    marginBottom: 16,
                    x: [0, -8, 8, -5, 5, -2, 0],
                  }
            }
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, scale: 0.96, marginBottom: 0 }}
            transition={{
              x: { duration: 0.36, ease: 'easeInOut' },
              duration: 0.22,
              ease: [0.2, 0, 0, 1],
            }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2.5 rounded-lg border border-red-900/80 bg-red-950/50 p-3 text-xs text-red-300 font-medium shadow-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{result.errorMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Result Display Hero Content: Calculated R1 & R2 */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[11px] font-mono text-zinc-400 font-semibold">
            {appMode === 'biasing'
              ? 'مقاومت‌های بایاس ترانزیستور (R1 و R2)'
              : appMode === 'sampling'
              ? 'مقاومت‌های نمونه‌گیری سیگنال (R1 و R2)'
              : 'مقاومت‌های ساخت ولتاژ رفرنس (R1 و R2)'}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3 my-1 select-all font-mono" dir="ltr">
          {/* R1 Card */}
          <div className="flex items-baseline gap-1.5 bg-zinc-950/80 border border-zinc-800 px-3.5 py-2 rounded-lg shadow-inner">
            <span className="text-zinc-500 text-xs font-bold">R1:</span>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
              {state.r1}
            </span>
            <span className="text-sm font-semibold text-emerald-400">
              {r1UnitSym}
            </span>
          </div>

          <span className="text-zinc-600 font-bold text-lg select-none">&bull;</span>

          {/* R2 Card */}
          <div className="flex items-baseline gap-1.5 bg-zinc-950/80 border border-zinc-800 px-3.5 py-2 rounded-lg shadow-inner">
            <span className="text-zinc-500 text-xs font-bold">R2:</span>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
              {state.r2}
            </span>
            <span className="text-sm font-semibold text-emerald-400">
              {r2UnitSym}
            </span>
          </div>
        </div>

        <div className="mt-2 text-[10px] font-mono text-zinc-500 tracking-wider">
          EIA E24 COMMERCIAL RESISTOR PAIR
        </div>
      </div>

      {/* Engineering Circuit Analysis Grid tailored to Application Mode */}
      {result.isValid && !result.isShortCircuit && (
        <div className="mt-5 pt-4 border-t border-zinc-800/80 space-y-2.5 text-xs">
          {/* Mode 1: Signal & ADC Sampling */}
          {appMode === 'sampling' && (
            <>
              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-sans text-[11px]">ضریب مقیاس سیگنال (K):</span>
                <div className="flex items-center gap-1.5" dir="ltr">
                  <span className="text-emerald-400 font-bold font-mono tabular-nums">{formatPrecision(ratioNum, 2)}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({dbAtten} dB)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-sans text-[11px]">امپدانس خروجی ADC (Rth):</span>
                <div className="flex items-center gap-1.5" dir="ltr">
                  <span className="text-zinc-200 font-semibold font-mono tabular-nums">{result.displayRth} {result.displayRthUnit}</span>
                  <Badge
                    variant={rth <= 10e3 ? 'success' : rth <= 50e3 ? 'subtle' : 'warning'}
                    size="sm"
                    className="font-sans text-[9px] py-0"
                  >
                    {rth <= 10e3 ? 'مستقیم (ADC OK)' : rth <= 50e3 ? 'سرعت پایین' : 'نیاز به بافر'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-sans text-[11px]">جریان مصرفی از منبع سیگنال:</span>
                <span className="text-zinc-200 font-semibold font-mono tabular-nums" dir="ltr">{result.displayCurrent} {result.displayCurrentUnit}</span>
              </div>
            </>
          )}

          {/* Mode 2: Transistor Biasing */}
          {appMode === 'biasing' && (
            <>
              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-sans text-[11px]">ولتاژ بیس مدار باز (Vth_base):</span>
                <span className="text-emerald-400 font-bold font-mono tabular-nums" dir="ltr">
                  {result.displayVout} {result.displayVoutUnit}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-sans text-[11px]">مقاومت معادل بیس (Rth_base):</span>
                <span className="text-zinc-200 font-semibold font-mono tabular-nums" dir="ltr">
                  {result.displayRth} {result.displayRthUnit}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-sans text-[11px]">جریان شاخه مقسم بایاس (Ibias):</span>
                <span className="text-zinc-200 font-semibold font-mono tabular-nums" dir="ltr">
                  {result.displayCurrent} {result.displayCurrentUnit}
                </span>
              </div>
            </>
          )}

          {/* Mode 3: Reference Voltage */}
          {appMode === 'reference' && (
            <>
              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-sans text-[11px]">ولتاژ رفرنس خروجی (Vref):</span>
                <div className="flex items-center gap-1.5" dir="ltr">
                  <span className="text-emerald-400 font-bold font-mono tabular-nums">
                    {result.displayVout} {result.displayVoutUnit}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-sans">
                    (خطا: <span className="font-mono tabular-nums">{formatPrecision(errorPct, 2)}%</span>)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-sans text-[11px]">امپدانس منبع رفرنس (Rout):</span>
                <span className="text-zinc-200 font-semibold font-mono tabular-nums" dir="ltr">
                  {result.displayRth} {result.displayRthUnit}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-sans text-[11px]">توان تلفاتی کل (Power):</span>
                <span className="text-zinc-200 font-semibold font-mono tabular-nums" dir="ltr">{result.displayPowerTotal}</span>
              </div>
            </>
          )}

          {/* Load resistor current if present */}
          {state.hasLoad && (
            <div className="flex items-center justify-between text-emerald-400/90 pt-1 border-t border-zinc-850">
              <span className="font-sans text-[11px]">جریان مقاومت بار (IL):</span>
              <span className="font-semibold font-mono tabular-nums" dir="ltr">{result.displayCurrentLoad}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
