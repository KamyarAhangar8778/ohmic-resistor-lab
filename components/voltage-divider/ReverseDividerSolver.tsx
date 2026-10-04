'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRightLeft, Check, CheckCircle2 } from 'lucide-react';
import { findBestDividerPairs, DividerPairRecommendation } from '@/lib/e-series';
import { VoltageUnit } from '@/types/voltage-divider';
import { ResistorUnit } from '@/types/resistor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReverseDividerSolverProps {
  vin: string;
  vinUnit: VoltageUnit;
  onApplyPair: (r1: string, r1Unit: ResistorUnit, r2: string, r2Unit: ResistorUnit) => void;
}

export function ReverseDividerSolver({
  vin,
  vinUnit,
  onApplyPair,
}: ReverseDividerSolverProps) {
  const [targetVout, setTargetVout] = React.useState('3.3');
  const [selectedSeries, setSelectedSeries] = React.useState<'E12' | 'E24'>('E24');
  const [appliedIndex, setAppliedIndex] = React.useState<number | null>(null);

  // Convert input Vin to Volts
  const vinVolts = React.useMemo(() => {
    const raw = parseFloat(vin);
    if (isNaN(raw) || raw <= 0) return 5;
    if (vinUnit === 'mV') return raw * 1e-3;
    if (vinUnit === 'kV') return raw * 1e3;
    return raw;
  }, [vin, vinUnit]);

  const targetVolts = parseFloat(targetVout) || 0;

  const recommendations = React.useMemo(() => {
    if (targetVolts <= 0 || targetVolts >= vinVolts) return [];
    return findBestDividerPairs(vinVolts, targetVolts, selectedSeries, 4);
  }, [vinVolts, targetVolts, selectedSeries]);

  const handleApply = (rec: DividerPairRecommendation, idx: number) => {
    onApplyPair(
      rec.r1.displayValue,
      rec.r1.unit as ResistorUnit,
      rec.r2.displayValue,
      rec.r2.unit as ResistorUnit
    );
    setAppliedIndex(idx);
    setTimeout(() => setAppliedIndex(null), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-850 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>طراحی معکوس با مقاومت‌های استاندارد بازار</span>
              <Badge variant="subtle" className="text-[10px] font-mono border-zinc-700 bg-zinc-900 text-zinc-300">
                E-Series Solver
              </Badge>
            </h3>
            <p className="text-[11px] text-zinc-400">
              ولتاژ خروجی دلخواه را وارد کنید تا بهترین مقاومت‌های تجاری موجود در بازار (E12/E24) پیشنهاد شوند.
            </p>
          </div>
        </div>

        {/* E12 vs E24 Toggle */}
        <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs font-mono">
          <button
            type="button"
            onClick={() => setSelectedSeries('E24')}
            className={cn(
              'px-2.5 py-1 rounded-md transition-colors cursor-pointer',
              selectedSeries === 'E24'
                ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            E24 (۵٪)
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeries('E12')}
            className={cn(
              'px-2.5 py-1 rounded-md transition-colors cursor-pointer',
              selectedSeries === 'E12'
                ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            E12 (۱۰٪)
          </button>
        </div>
      </div>

      {/* Target Voltage Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-zinc-400 whitespace-nowrap">ولتاژ خروجی مورد نظر (Vout):</span>
          <div className="relative flex-1">
            <Input
              type="text"
              inputMode="decimal"
              dir="ltr"
              placeholder="مثلاً 3.3 یا 1.8"
              value={targetVout}
              onChange={(e) => setTargetVout(e.target.value.replace(/[^0-9.]/g, ''))}
              className="w-full pl-3 pr-8 font-mono text-sm h-9 bg-zinc-900/90 border-zinc-800 text-left focus-visible:border-emerald-500/80"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">
              V
            </span>
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5 self-center">
          <span>ورودی فعلی:</span>
          <span className="text-zinc-300 font-bold">{vinVolts} V</span>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-2">
        {targetVolts >= vinVolts ? (
          <div className="p-3 rounded-lg border border-amber-900/40 bg-amber-950/20 text-amber-300 text-xs">
            ولتاژ خروجی در مدار تقسیم ولتاژ پسیو باید همیشه کمتر از ولتاژ ورودی ({vinVolts} V) باشد.
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-400 text-xs text-center">
            مقداری معتبر برای خروجی وارد کنید تا جفت‌های پیشنهادی استخراج شوند.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recommendations.map((rec, idx) => {
              const isApplied = appliedIndex === idx;
              const formattedCurrent = rec.currentAmps >= 1e-3
                ? `${(rec.currentAmps * 1e3).toFixed(2)} mA`
                : `${(rec.currentAmps * 1e6).toFixed(1)} µA`;

              return (
                <div
                  key={idx}
                  className="rounded-lg border border-zinc-800/90 bg-zinc-900/50 p-2.5 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-emerald-400 font-bold">
                        R1: {rec.r1.displayValue} {rec.r1.unit}
                      </span>
                      <span className="text-zinc-600">/</span>
                      <span className="text-amber-400 font-bold">
                        R2: {rec.r2.displayValue} {rec.r2.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                      <span>خروجی واقعی: <strong className="text-zinc-200">{rec.actualVout.toFixed(3)} V</strong></span>
                      <span className={cn(
                        'px-1.5 py-0.2 rounded text-[10px] font-bold',
                        rec.errorPercentage <= 1 ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      )}>
                        خطا: {rec.errorPercentage.toFixed(2)}%
                      </span>
                      <span className="text-zinc-500">I: {formattedCurrent}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant={isApplied ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => handleApply(rec, idx)}
                    className={cn(
                      'text-xs font-mono shrink-0 cursor-pointer transition-all',
                      isApplied
                        ? 'bg-emerald-600 text-white'
                        : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    )}
                  >
                    {isApplied ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        <span>اعمال شد</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ArrowRightLeft className="h-3 w-3" />
                        <span>انتخاب</span>
                      </span>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
