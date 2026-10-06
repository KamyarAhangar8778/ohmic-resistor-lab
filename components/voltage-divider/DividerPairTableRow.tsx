'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { StandardResistorPair, DividerApplicationMode } from '@/types/voltage-divider';
import { ResistorUnit } from '@/types/resistor';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ResistorColorCodeBadge } from './ResistorColorCodeBadge';

interface DividerPairTableRowProps {
  pair: StandardResistorPair;
  idx: number;
  isActive: boolean;
  appMode: DividerApplicationMode;
  onApplyPair: (r1: string, r1Unit: ResistorUnit, r2: string, r2Unit: ResistorUnit) => void;
}

export const DividerPairTableRow = React.memo(function DividerPairTableRow({
  pair,
  idx,
  isActive,
  appMode,
  onApplyPair,
}: DividerPairTableRowProps) {
  const isExact = pair.errorPercentage <= 0.05;
  const r1UnitSym = pair.r1Unit === 'kOhm' ? 'kΩ' : pair.r1Unit === 'MOhm' ? 'MΩ' : 'Ω';
  const r2UnitSym = pair.r2Unit === 'kOhm' ? 'kΩ' : pair.r2Unit === 'MOhm' ? 'MΩ' : 'Ω';

  return (
    <tr
      className={cn(
        'transition-colors duration-150 text-[11px]',
        isActive
          ? 'bg-emerald-950/25 border-r-2 border-emerald-500'
          : 'hover:bg-zinc-850/40'
      )}
    >
      {/* Rank & Badge */}
      <td className="py-2 px-3 text-center">
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold font-mono transition-colors',
              isActive
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-300'
            )}
          >
            {idx + 1}
          </span>
          {pair.badge && (
            <span className="text-[9px] font-sans text-zinc-500 truncate max-w-[76px]">
              {pair.badge}
            </span>
          )}
        </div>
      </td>

      {/* Resistor R1 with Color Code */}
      <td className="py-2 px-3 text-white">
        <div className="flex items-center gap-2" dir="ltr">
          <div className="inline-flex items-baseline gap-1 bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded-md shadow-inner">
            <span className="text-zinc-500 text-[10px] font-bold font-mono">R1:</span>
            <span className="font-bold text-xs text-white tabular-nums font-mono">{pair.r1Value}</span>
            <span className="text-[11px] font-semibold text-emerald-400 font-mono">{r1UnitSym}</span>
          </div>
          <ResistorColorCodeBadge value={pair.r1Value} unit={pair.r1Unit} label="R1" />
        </div>
      </td>

      {/* Resistor R2 with Color Code */}
      <td className="py-2 px-3 text-white">
        <div className="flex items-center gap-2" dir="ltr">
          <div className="inline-flex items-baseline gap-1 bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded-md shadow-inner">
            <span className="text-zinc-500 text-[10px] font-bold font-mono">R2:</span>
            <span className="font-bold text-xs text-white tabular-nums font-mono">{pair.r2Value}</span>
            <span className="text-[11px] font-semibold text-emerald-400 font-mono">{r2UnitSym}</span>
          </div>
          <ResistorColorCodeBadge value={pair.r2Value} unit={pair.r2Unit} label="R2" />
        </div>
      </td>

      {/* Mode 1: ADC Sampling Columns */}
      {appMode === 'sampling' && (
        <>
          <td className="py-2 px-3" dir="ltr">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="font-bold text-zinc-100">K: {pair.divisionRatioFormatted}</span>
              <Badge
                variant={isExact ? 'success' : pair.errorPercentage < 1.5 ? 'subtle' : 'warning'}
                size="sm"
                className="text-[9px] py-0 font-sans"
              >
                {isExact ? 'خطا ۰٪' : <span className="font-mono tabular-nums" dir="ltr">±{pair.errorPercentage}%</span>}
              </Badge>
            </div>
          </td>
          <td className="py-2 px-3" dir="ltr">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="font-medium text-zinc-200 tabular-nums">{pair.theveninFormatted}</span>
              <Badge
                variant={pair.adcSuitability === 'direct' ? 'success' : pair.adcSuitability === 'buffered' ? 'subtle' : 'warning'}
                size="sm"
                className="font-sans text-[9px] py-0"
              >
                {pair.adcSuitability === 'direct' ? 'مستقیم (ADC)' : pair.adcSuitability === 'buffered' ? 'بای‌پاس' : 'بافر'}
              </Badge>
            </div>
          </td>
          <td className="py-2 px-3 text-zinc-300 font-mono tabular-nums" dir="ltr">
            <span>{pair.currentFormatted}</span>
          </td>
        </>
      )}

      {/* Mode 2: Transistor Biasing Columns */}
      {appMode === 'biasing' && (
        <>
          <td className="py-2 px-3" dir="ltr">
            <span className="font-bold text-emerald-400 font-mono tabular-nums">{pair.displayVout} V</span>
          </td>
          <td className="py-2 px-3" dir="ltr">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="font-medium text-zinc-200 tabular-nums">{pair.theveninFormatted}</span>
              <Badge
                variant={pair.biasStability === 'stiff' ? 'success' : pair.biasStability === 'moderate' ? 'subtle' : 'warning'}
                size="sm"
                className="font-sans text-[9px] py-0"
              >
                {pair.biasStability === 'stiff' ? 'سفت (Stiff)' : pair.biasStability === 'moderate' ? 'متوسط' : 'نرم'}
              </Badge>
            </div>
          </td>
          <td className="py-2 px-3 text-zinc-300 font-mono tabular-nums" dir="ltr">
            <span>{pair.currentFormatted}</span>
          </td>
        </>
      )}

      {/* Mode 3: Reference Voltage Columns */}
      {appMode === 'reference' && (
        <>
          <td className="py-2 px-3" dir="ltr">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="font-bold text-zinc-100 tabular-nums">{pair.displayVout} V</span>
              <Badge
                variant={isExact ? 'success' : pair.errorPercentage < 1.5 ? 'subtle' : 'warning'}
                size="sm"
                className="text-[9px] py-0 font-sans"
              >
                {isExact ? 'خطا ۰٪' : <span className="font-mono tabular-nums" dir="ltr">±{pair.errorPercentage}%</span>}
              </Badge>
            </div>
          </td>
          <td className="py-2 px-3 font-mono text-zinc-300 tabular-nums" dir="ltr">
            <span className="text-[10px] text-zinc-200 font-medium">
              {pair.worstCaseVoutMinFormatted} - {pair.worstCaseVoutMaxFormatted} V
            </span>
          </td>
          <td className="py-2 px-3 text-zinc-300 font-mono tabular-nums" dir="ltr">
            <span>{pair.theveninFormatted}</span>
          </td>
        </>
      )}

      {/* Power Dissipation */}
      <td className="py-2 px-3 text-zinc-300 font-mono tabular-nums" dir="ltr">
        <div className="flex flex-col text-[10px]">
          <span className="font-semibold text-zinc-200">{pair.powerFormatted}</span>
          {(pair.powerR1Formatted || pair.powerR2Formatted) && (
            <span className="text-[9px] text-zinc-500">
              P1: {pair.powerR1Formatted} | P2: {pair.powerR2Formatted}
            </span>
          )}
        </div>
      </td>

      {/* Action Button */}
      <td className="py-2 px-3 text-center">
        {isActive ? (
          <div className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-xs select-none">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-sans">در مدار</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onApplyPair(pair.r1Value, pair.r1Unit, pair.r2Value, pair.r2Unit)}
            aria-label={`اعمال جفت مقاومت R1=${pair.r1Value}${r1UnitSym} و R2=${pair.r2Value}${r2UnitSym}`}
            className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md border border-zinc-700/80 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-600 hover:text-white text-zinc-200 text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-[0.97] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            title="اعمال این جفت روی مدار و شماتیک"
          >
            <Check className="h-3 w-3 text-zinc-400" />
            <span className="font-sans">اعمال</span>
          </button>
        )}
      </td>
    </tr>
  );
});
