'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  Activity,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import {
  StandardResistorPair,
  PairSortCriterion,
  PairTableSortKey,
  SortDirection,
  PowerFilterOption,
  CurrentFilterOption,
  DividerApplicationMode,
  TablePageSize,
} from '@/types/voltage-divider';
import { ResistorUnit } from '@/types/resistor';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ResistorColorCodeBadge } from './ResistorColorCodeBadge';
import { DividerPairFilterBar } from './DividerPairFilterBar';

interface DividerStandardPairPickerProps {
  pairs: StandardResistorPair[];
  currentCriterion: PairSortCriterion;
  onChangeCriterion: (criterion: PairSortCriterion) => void;
  appMode: DividerApplicationMode;
  onChangeAppMode: (mode: DividerApplicationMode) => void;
  onApplyPair: (r1: string, r1Unit: ResistorUnit, r2: string, r2Unit: ResistorUnit) => void;
  activeR1?: { value: string; unit: ResistorUnit };
  activeR2?: { value: string; unit: ResistorUnit };
}

export const DividerStandardPairPicker = React.memo(function DividerStandardPairPicker({
  pairs,
  appMode,
  onChangeAppMode,
  onApplyPair,
  activeR1,
  activeR2,
}: DividerStandardPairPickerProps) {
  const shouldReduceMotion = useReducedMotion();

  // Table sorting state
  const [sortKey, setSortKey] = React.useState<PairTableSortKey>('error');
  const [sortDir, setSortDir] = React.useState<SortDirection>('asc');

  // Engineering constraints & page size
  const [powerFilter, setPowerFilter] = React.useState<PowerFilterOption>('all');
  const [currentFilter, setCurrentFilter] = React.useState<CurrentFilterOption>('all');
  const [pageSize, setPageSize] = React.useState<TablePageSize>(20);

  const handleSort = (key: PairTableSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Filter pairs according to power and current constraints
  const filteredPairs = React.useMemo(() => {
    return pairs.filter((pair) => {
      // Power filter
      if (powerFilter === '10mw' && pair.powerWatts > 0.01) return false;
      if (powerFilter === '50mw' && pair.powerWatts > 0.05) return false;
      if (powerFilter === '250mw' && pair.powerWatts > 0.25) return false;

      // Current filter
      if (currentFilter === 'low' && pair.currentAmperes >= 100e-6) return false;
      if (currentFilter === 'mid' && (pair.currentAmperes < 100e-6 || pair.currentAmperes > 5e-3)) return false;
      if (currentFilter === 'high' && pair.currentAmperes <= 5e-3) return false;

      return true;
    });
  }, [pairs, powerFilter, currentFilter]);

  // Sort pairs according to selected column header
  const sortedPairs = React.useMemo(() => {
    const list = [...filteredPairs];
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'error':
          comparison = a.errorPercentage - b.errorPercentage;
          break;
        case 'worst_case':
          comparison = a.worstCaseErrorPct - b.worstCaseErrorPct;
          break;
        case 'ratio':
          comparison = a.divisionRatio - b.divisionRatio;
          break;
        case 'vout':
          comparison = a.actualVout - b.actualVout;
          break;
        case 'current':
          comparison = a.currentAmperes - b.currentAmperes;
          break;
        case 'power':
          comparison = a.powerWatts - b.powerWatts;
          break;
        case 'thevenin':
          comparison = a.theveninOhms - b.theveninOhms;
          break;
        case 'r1':
          comparison = a.r1Ohms - b.r1Ohms;
          break;
        case 'score':
        default:
          comparison = a.overallScore - b.overallScore;
          break;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredPairs, sortKey, sortDir]);

  if (!pairs || pairs.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 text-center text-xs text-zinc-400 font-mono">
        مقادیر معتبری برای Vin و Vout وارد کنید تا ۲۰ جفت مقاومت استاندارد تجاری E24 استخراج شوند.
      </div>
    );
  }

  const hasActiveFilters = powerFilter !== 'all' || currentFilter !== 'all';

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 p-5 sm:p-6 shadow-xl transition-all duration-200 overflow-hidden space-y-4"
    >
      {/* Top subtle hairline glow - pulse on mode change */}
      <motion.div
        key={`${appMode}-${pairs.length}`}
        initial={{ opacity: 0.2, scaleX: 0.8 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent origin-center"
      />

      {/* Header with Title and Mode Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            key={appMode}
            initial={shouldReduceMotion ? undefined : { scale: 0.85, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.22 }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700/70 bg-zinc-950 text-emerald-400 shadow-inner"
          >
            {appMode === 'sampling' ? (
              <Activity className="h-4 w-4" />
            ) : appMode === 'biasing' ? (
              <Cpu className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-zinc-100">
                {appMode === 'sampling'
                  ? 'جداول نمونه‌گیری سیگنال و پایش ADC (سری E24)'
                  : appMode === 'biasing'
                  ? 'جداول مقاومت‌های بایاس ترانزیستور BJT/MOSFET'
                  : 'جداول ساخت ولتاژ رفرنس دقیق (سری E24)'}
              </h3>
              {pairs[0]?.isLoaded && (
                <Badge variant="warning" size="sm" className="font-mono">
                  با احتساب بار RL
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {appMode === 'sampling'
                ? 'بهینه‌سازی بر اساس امپدانس سازگار ورودی ADC (حداکثر ۱۰kΩ) و حداقل بارگذاری منبع'
                : appMode === 'biasing'
                ? 'بهینه‌سازی ولتاژ و مقاومت معادل بیس (Vth, Rth) جهت پایداری نقطه کار ترانزیستور'
                : 'بهینه‌سازی حداقل نوسان در بدترین حالت تلرانس ۵٪ و ثبات حرارتی رفرنس'}
            </p>
          </div>
        </div>
      </div>

      {/* Engineering Filter Bar with Application Modes */}
      <DividerPairFilterBar
        appMode={appMode}
        onChangeAppMode={onChangeAppMode}
        powerFilter={powerFilter}
        onChangePowerFilter={setPowerFilter}
        currentFilter={currentFilter}
        onChangeCurrentFilter={setCurrentFilter}
        pageSize={pageSize}
        onChangePageSize={setPageSize}
        onResetFilters={() => {
          setPowerFilter('all');
          setCurrentFilter('all');
        }}
        hasActiveFilters={hasActiveFilters}
        filteredCount={sortedPairs.length}
        totalCount={pairs.length}
      />

      {/* Engineering Data Table Grid Tailored to Application Mode */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/80 shadow-inner">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/70 text-zinc-400 font-medium select-none text-[11px]">
              <th className="py-2.5 px-3 w-12 text-center font-mono">#</th>
              <th
                onClick={() => handleSort('r1')}
                className="py-2.5 px-3 cursor-pointer hover:text-zinc-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>{appMode === 'biasing' ? 'R1 (بالا/Vcc)' : 'R1 (بالا)'}</span>
                  <SortIndicator activeKey={sortKey} currentKey="r1" dir={sortDir} />
                </div>
              </th>
              <th className="py-2.5 px-3">
                <span>{appMode === 'biasing' ? 'R2 (پایین/Gnd)' : 'R2 (پایین)'}</span>
              </th>

              {/* Mode-specific Headers */}
              {appMode === 'sampling' && (
                <>
                  <th
                    onClick={() => handleSort('ratio')}
                    className="py-2.5 px-3 cursor-pointer hover:text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>ضریب مقیاس (K) و خطا</span>
                      <SortIndicator activeKey={sortKey} currentKey="ratio" dir={sortDir} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('thevenin')}
                    className="py-2.5 px-3 cursor-pointer hover:text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>امپدانس ADC (Rth)</span>
                      <SortIndicator activeKey={sortKey} currentKey="thevenin" dir={sortDir} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('current')}
                    className="py-2.5 px-3 cursor-pointer hover:text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>جریان پایش سیگنال</span>
                      <SortIndicator activeKey={sortKey} currentKey="current" dir={sortDir} />
                    </div>
                  </th>
                </>
              )}

              {appMode === 'biasing' && (
                <>
                  <th
                    onClick={() => handleSort('vout')}
                    className="py-2.5 px-3 cursor-pointer hover:text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>ولتاژ بیس (Vth_base)</span>
                      <SortIndicator activeKey={sortKey} currentKey="vout" dir={sortDir} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('thevenin')}
                    className="py-2.5 px-3 cursor-pointer hover:text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>مقاومت بیس (Rth_base)</span>
                      <SortIndicator activeKey={sortKey} currentKey="thevenin" dir={sortDir} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('current')}
                    className="py-2.5 px-3 cursor-pointer hover:text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>جریان مقسم بایاس (Ibias)</span>
                      <SortIndicator activeKey={sortKey} currentKey="current" dir={sortDir} />
                    </div>
                  </th>
                </>
              )}

              {appMode === 'reference' && (
                <>
                  <th
                    onClick={() => handleSort('error')}
                    className="py-2.5 px-3 cursor-pointer hover:text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>ولتاژ رفرنس (Vref)</span>
                      <SortIndicator activeKey={sortKey} currentKey="error" dir={sortDir} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('worst_case')}
                    className="py-2.5 px-3 cursor-pointer hover:text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>تلرانس ۵٪ (بازه Drift)</span>
                      <SortIndicator activeKey={sortKey} currentKey="worst_case" dir={sortDir} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('thevenin')}
                    className="py-2.5 px-3 cursor-pointer hover:text-zinc-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>امپدانس خروجی (Rout)</span>
                      <SortIndicator activeKey={sortKey} currentKey="thevenin" dir={sortDir} />
                    </div>
                  </th>
                </>
              )}

              {/* Power Column */}
              <th
                onClick={() => handleSort('power')}
                className="py-2.5 px-3 cursor-pointer hover:text-zinc-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>توان تلفاتی</span>
                  <SortIndicator activeKey={sortKey} currentKey="power" dir={sortDir} />
                </div>
              </th>

              <th className="py-2.5 px-3 text-center w-28">وضعیت / اعمال</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {sortedPairs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-zinc-500 font-sans text-xs">
                  هیچ جفتی با فیلترهای انتخابی مطابقت ندارد. فیلترها را بازنشانی کنید.
                </td>
              </tr>
            ) : (
              sortedPairs.slice(0, pageSize).map((pair, idx) => {
                const isActive =
                  activeR1?.value === pair.r1Value &&
                  activeR1?.unit === pair.r1Unit &&
                  activeR2?.value === pair.r2Value &&
                  activeR2?.unit === pair.r2Unit;

                const isExact = pair.errorPercentage <= 0.05;
                const r1UnitSym = pair.r1Unit === 'kOhm' ? 'kΩ' : pair.r1Unit === 'MOhm' ? 'MΩ' : 'Ω';
                const r2UnitSym = pair.r2Unit === 'kOhm' ? 'kΩ' : pair.r2Unit === 'MOhm' ? 'MΩ' : 'Ω';

                return (
                  <tr
                    key={`${pair.r1Value}-${pair.r1Unit}-${pair.r2Value}-${pair.r2Unit}`}
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
                          className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md border border-zinc-700/80 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-600 hover:text-white text-zinc-200 text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-[0.97]"
                          title="اعمال این جفت روی مدار و شماتیک"
                        >
                          <Check className="h-3 w-3 text-zinc-400" />
                          <span className="font-sans">اعمال</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Engineering Footer Tip */}
      <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
        <Info className="h-4 w-4 text-zinc-500 shrink-0" />
        <span className="text-[11px] leading-relaxed">
          {appMode === 'sampling'
            ? 'نکته نمونه‌گیری ADC: اگر امپدانس خروجی Rth کمتر از ۱۰kΩ باشد، نیازی به بافر آپ‌امپ نخواهید داشت و خازن داخلی میکروکنترلر در زمان معین شارژ می‌شود.'
            : appMode === 'biasing'
            ? 'نکته بایاس ترانزیستور: جریان مقسم (Ibias) باید حداقل ۱۰ برابر جریان بیس (Ib) باشد تا ولتاژ بیس به تغییرات دمایی و بتا (β) حساس نباشد.'
            : 'نکته ولتاژ رفرنس: رفرنس‌های دقیق را با در نظر گرفتن تلرانس ۵٪ بدترین حالت انتخاب کنید؛ تلفات توان کم از رانش حرارتی مقاومت‌ها جلوگیری می‌کند.'}
        </span>
      </div>
    </motion.div>
  );
});

function SortIndicator({
  activeKey,
  currentKey,
  dir,
}: {
  activeKey: PairTableSortKey;
  currentKey: PairTableSortKey;
  dir: SortDirection;
}) {
  if (activeKey !== currentKey) {
    return <ArrowUpDown className="h-3 w-3 text-zinc-600 opacity-60" />;
  }
  return dir === 'asc' ? (
    <ArrowUp className="h-3 w-3 text-emerald-400" />
  ) : (
    <ArrowDown className="h-3 w-3 text-emerald-400" />
  );
}
