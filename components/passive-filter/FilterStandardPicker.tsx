'use client';

import * as React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { StandardFilterPair } from '@/types/passive-filter';
import { Badge } from '@/components/ui/badge';

interface FilterStandardPickerProps {
  pairs: StandardFilterPair[];
  topology: 'rc' | 'rl';
  targetFcDisplay: string;
  onApplyPair: (resistor: string, resUnit: string, reactive: string, reactiveUnit: string) => void;
}

export const FilterStandardPicker = React.memo(function FilterStandardPicker({
  pairs,
  topology,
  targetFcDisplay,
  onApplyPair,
}: FilterStandardPickerProps) {
  const [appliedIdx, setAppliedIdx] = React.useState<number | null>(null);

  const handleApply = (pair: StandardFilterPair, idx: number) => {
    // Parse resistor
    const rOhms = pair.resistorOhms;
    let rVal = `${rOhms}`;
    let rUnit = 'Ohm';
    if (rOhms >= 1e6) {
      rVal = `${rOhms / 1e6}`;
      rUnit = 'MOhm';
    } else if (rOhms >= 1e3) {
      rVal = `${rOhms / 1e3}`;
      rUnit = 'kOhm';
    }

    // Reactive value
    const reactVal = pair.reactiveDisplay;
    const reactUnit = pair.reactiveUnit === 'µF' || pair.reactiveUnit === 'uF' ? 'uF' : pair.reactiveUnit;

    onApplyPair(rVal, rUnit, reactVal, reactUnit);
    setAppliedIdx(idx);
    setTimeout(() => setAppliedIdx(null), 1800);
  };

  if (pairs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-850 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-950/70 border border-emerald-800/40 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>جفت قطعات استاندارد تجاری بازار (E24 + E12)</span>
              <Badge variant="subtle" className="text-[10px] font-mono border-zinc-700 bg-zinc-900 text-zinc-300">
                Commercial Match
              </Badge>
            </h4>
            <p className="text-[11px] text-zinc-400">
              نزدیک‌ترین ترکیب مقاومت و {topology === 'rc' ? 'خازن' : 'سلف'} استاندارد بازار به فرکانس قطع هدف ({targetFcDisplay})
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-medium text-[11px]">
              <th scope="col" className="py-2 px-3">مقاومت R (سری E24)</th>
              <th scope="col" className="py-2 px-3">{topology === 'rc' ? 'خازن C (سری E12)' : 'سلف L (سری E12)'}</th>
              <th scope="col" className="py-2 px-3">فرکانس قطع دقیق</th>
              <th scope="col" className="py-2 px-3">میزان خطا</th>
              <th scope="col" className="py-2 px-3 text-center w-24">اعمال</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850/70 font-mono text-zinc-200">
            {pairs.map((pair, idx) => {
              const isApplied = appliedIdx === idx;
              return (
                <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-zinc-100">{pair.resistorDisplay}</td>
                  <td className="py-2 px-3 text-amber-400 font-semibold">{pair.reactiveDisplay} {pair.reactiveUnit}</td>
                  <td className="py-2 px-3 text-emerald-400 font-bold">{pair.displayActualFc}</td>
                  <td className="py-2 px-3">
                    <span className={pair.errorPct <= 2 ? 'text-emerald-400' : 'text-amber-400'}>
                      {pair.errorPct}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleApply(pair, idx)}
                      className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white transition-colors cursor-pointer text-[11px] font-sans inline-flex items-center gap-1"
                    >
                      {isApplied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">اعمال شد</span>
                        </>
                      ) : (
                        'انتخاب'
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
