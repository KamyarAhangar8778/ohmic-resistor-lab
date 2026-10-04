'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Zap, ShieldCheck } from 'lucide-react';
import { SeriesCalculationResult, SeriesVoltageAnalysis } from '@/types/series-resistor';
import { Input } from '@/components/ui/input';

interface SeriesResultDisplayProps {
  result: SeriesCalculationResult;
  voltageAnalysis: SeriesVoltageAnalysis;
  testVoltage: string;
  onChangeTestVoltage: (val: string) => void;
}

export function SeriesResultDisplay({
  result,
  voltageAnalysis,
  testVoltage,
  onChangeTestVoltage,
}: SeriesResultDisplayProps) {
  return (
    <div className="relative rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Short Circuit / Invalid Warning */}
      <AnimatePresence>
        {!result.isValid && result.errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-lg border border-amber-900/70 bg-amber-950/40 p-3 text-xs text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{result.errorMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Equivalent Resistance Hero */}
      <div className="text-center">
        <span className="text-xs font-semibold text-zinc-400">مقاومت معادل کل مدار (Req)</span>
        <div className="flex items-baseline justify-center gap-2 my-2 select-all" dir="ltr">
          <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-white">
            {result.displayValue}
          </span>
          <span className="font-mono text-2xl font-semibold text-emerald-400">
            {result.displayUnit}
          </span>
        </div>
        <div className="text-[11px] font-mono text-zinc-500">
          SERIES EQUIVALENT RESISTANCE
        </div>
      </div>

      {/* Test Voltage Analysis (KVL) */}
      {result.isValid && (
        <div className="space-y-3 pt-4 border-t border-zinc-800/80 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-zinc-300 font-medium">ولتاژ اعمالی به مدار:</span>
            <div className="relative w-28">
              <Input
                type="text"
                inputMode="decimal"
                dir="ltr"
                value={testVoltage}
                onChange={(e) => onChangeTestVoltage(e.target.value.replace(/[^0-9.]/g, ''))}
                className="h-8 text-xs font-mono pl-2 pr-6 bg-zinc-950 text-left border-zinc-800 focus-visible:border-emerald-500/80"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">
                V
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-zinc-400 font-mono text-[11px] bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-850">
            <div>
              <span>جریان عبوری مدار: </span>
              <strong className="text-emerald-400 font-bold" dir="ltr">
                {voltageAnalysis.displayCurrent} {voltageAnalysis.displayCurrentUnit}
              </strong>
            </div>
            <div>
              <span>توان مصرفی کل: </span>
              <strong className="text-amber-400 font-bold" dir="ltr">
                {voltageAnalysis.displayPowerTotal}
              </strong>
            </div>
          </div>

          {/* Individual Voltage Drop Breakdown (KVL) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-zinc-400 font-medium block">
              افت ولتاژ تفکیکی مقاومت‌ها (Kirchhoff Voltage Law):
            </span>
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {voltageAnalysis.resistorDrops.map((drop) => (
                <div
                  key={drop.id}
                  className="flex items-center justify-between p-2 rounded-md bg-zinc-900/60 border border-zinc-850 font-mono text-[11px]"
                >
                  <span className="text-zinc-300 font-semibold">{drop.tag}:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400">افت ولتاژ: {drop.displayVoltageDrop}</span>
                    <span className="text-zinc-500">توان: {drop.displayPower}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
