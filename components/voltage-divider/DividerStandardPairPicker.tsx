'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import {
  Info,
} from 'lucide-react';
import {
  StandardResistorPair,
  PairSortCriterion,
  CurrentFilterOption,
  DividerApplicationMode,
  ResistorSeriesOption,
  TablePageSize,
  PairTableSortKey,
  SortDirection,
} from '@/types/voltage-divider';
import { ResistorUnit } from '@/types/resistor';
import { DividerPairFilterBar } from './DividerPairFilterBar';
import { DividerPairTableRow } from './DividerPairTableRow';
import { TableSortHeader } from './DividerTableSortHeader';

interface DividerStandardPairPickerProps {
  pairs: StandardResistorPair[];
  currentCriterion: PairSortCriterion;
  onChangeCriterion: (criterion: PairSortCriterion) => void;
  appMode: DividerApplicationMode;
  onChangeAppMode: (mode: DividerApplicationMode) => void;
  series: ResistorSeriesOption;
  onChangeSeries: (series: ResistorSeriesOption) => void;
  hasLoad: boolean;
  rlValue?: string;
  rlUnit?: ResistorUnit;
  onApplyPair: (r1: string, r1Unit: ResistorUnit, r2: string, r2Unit: ResistorUnit) => void;
  activeR1?: { value: string; unit: ResistorUnit };
  activeR2?: { value: string; unit: ResistorUnit };
}

export const DividerStandardPairPicker = React.memo(function DividerStandardPairPicker({
  pairs,
  currentCriterion,
  onChangeCriterion,
  appMode,
  onChangeAppMode,
  series,
  onChangeSeries,
  hasLoad,
  rlValue,
  rlUnit,
  onApplyPair,
  activeR1,
  activeR2,
}: DividerStandardPairPickerProps) {
  // Engineering constraints & page size
  const [currentFilter, setCurrentFilter] = React.useState<CurrentFilterOption>('all');
  const [pageSize, setPageSize] = React.useState<TablePageSize>(20);

  // Filter pairs according to current constraints
  const filteredPairs = React.useMemo(() => {
    return pairs.filter((pair) => {
      // Current filter
      if (currentFilter === 'low' && pair.currentAmperes >= 100e-6) return false;
      if (currentFilter === 'mid' && (pair.currentAmperes < 100e-6 || pair.currentAmperes > 5e-3)) return false;
      if (currentFilter === 'high' && pair.currentAmperes <= 5e-3) return false;

      return true;
    });
  }, [pairs, currentFilter]);

  // Atomic sort state to eliminate state desync and React StrictMode double-call side effects
  const [sortState, setSortState] = React.useState<{ key: PairTableSortKey; dir: SortDirection }>({
    key: 'score',
    dir: 'asc',
  });

  const handleSort = React.useCallback((key: PairTableSortKey) => {
    setSortState((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Sort pairs according to selected column and direction with stable tie-breaker
  const sortedPairs = React.useMemo(() => {
    const indexed = filteredPairs.map((pair, originalIdx) => ({ pair, originalIdx }));

    indexed.sort((a, b) => {
      let diff = 0;
      switch (sortState.key) {
        case 'r1':
          diff = a.pair.r1Ohms - b.pair.r1Ohms;
          break;
        case 'r2':
          diff = a.pair.r2Ohms - b.pair.r2Ohms;
          break;
        case 'error':
          diff = a.pair.errorPercentage - b.pair.errorPercentage;
          break;
        case 'vout':
          diff = a.pair.actualVout - b.pair.actualVout;
          break;
        case 'ratio':
          diff = a.pair.divisionRatio - b.pair.divisionRatio;
          break;
        case 'thevenin':
          diff = a.pair.theveninOhms - b.pair.theveninOhms;
          break;
        case 'current':
          diff = a.pair.currentAmperes - b.pair.currentAmperes;
          break;
        case 'power':
          diff = a.pair.powerWatts - b.pair.powerWatts;
          break;
        case 'worst_case':
          diff = a.pair.worstCaseErrorPct - b.pair.worstCaseErrorPct;
          break;
        case 'score':
        default:
          diff = a.originalIdx - b.originalIdx;
          break;
      }
      if (Math.abs(diff) < 1e-9) {
        diff = a.pair.errorPercentage - b.pair.errorPercentage;
        if (Math.abs(diff) < 1e-9) {
          diff = a.originalIdx - b.originalIdx;
        }
      }
      return sortState.dir === 'asc' ? diff : -diff;
    });

    return indexed.map((item) => item.pair);
  }, [filteredPairs, sortState]);

  if (!pairs || pairs.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 text-center text-xs text-zinc-400 font-mono">
        مقادیر معتبری برای Vin و Vout وارد کنید تا ۲۰ جفت مقاومت استاندارد تجاری E24 استخراج شوند.
      </div>
    );
  }

  const hasActiveFilters = currentFilter !== 'all';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
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

      {/* Engineering Filter Bar with Application Modes */}
      <DividerPairFilterBar
        appMode={appMode}
        onChangeAppMode={onChangeAppMode}
        series={series}
        onChangeSeries={onChangeSeries}
        criterion={currentCriterion}
        onChangeCriterion={onChangeCriterion}
        currentFilter={currentFilter}
        onChangeCurrentFilter={setCurrentFilter}
        pageSize={pageSize}
        onChangePageSize={setPageSize}
        hasLoad={hasLoad}
        rlValue={rlValue}
        rlUnit={rlUnit}
        onResetFilters={() => {
          setCurrentFilter('all');
        }}
        hasActiveFilters={hasActiveFilters}
        filteredCount={sortedPairs.length}
        totalCount={pairs.length}
      />

      {/* Engineering Data Table Grid Tailored to Application Mode */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/80 shadow-inner">
        <table className="w-full text-right border-collapse text-xs">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-medium select-none sticky top-0 backdrop-blur-xs z-10">
            <tr>
              <TableSortHeader
                label="#"
                columnKey="score"
                sortKey={sortState.key}
                sortDir={sortState.dir}
                onSort={handleSort}
                align="center"
                className="w-12 font-mono text-[11px]"
              />
              <TableSortHeader
                label="مقاومت R1"
                columnKey="r1"
                sortKey={sortState.key}
                sortDir={sortState.dir}
                onSort={handleSort}
              />
              <TableSortHeader
                label="مقاومت R2"
                columnKey="r2"
                sortKey={sortState.key}
                sortDir={sortState.dir}
                onSort={handleSort}
              />
              {appMode === 'sampling' && (
                <>
                  <TableSortHeader
                    label="نسبت تقسیم و خطا"
                    columnKey="error"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="امپدانس خروجی (Rth)"
                    columnKey="thevenin"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="جریان مدار (I)"
                    columnKey="current"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                </>
              )}
              {appMode === 'biasing' && (
                <>
                  <TableSortHeader
                    label="ولتاژ بیس (Vout)"
                    columnKey="vout"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="مقاومت بیس (Rth)"
                    columnKey="thevenin"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="جریان شاخه (Ibias)"
                    columnKey="current"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                </>
              )}
              {appMode === 'reference' && (
                <>
                  <TableSortHeader
                    label="ولتاژ رفرنس (Vout)"
                    columnKey="vout"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="بازه نوسان (تلرانس ۵٪)"
                    columnKey="worst_case"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="امپدانس معادل (Rth)"
                    columnKey="thevenin"
                    sortKey={sortState.key}
                    sortDir={sortState.dir}
                    onSort={handleSort}
                  />
                </>
              )}
              <th scope="col" className="py-2.5 px-3 text-center w-20">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {sortedPairs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-zinc-500 font-sans text-xs">
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

                return (
                  <DividerPairTableRow
                    key={`${pair.r1Value}-${pair.r1Unit}-${pair.r2Value}-${pair.r2Unit}`}
                    pair={pair}
                    idx={idx}
                    isActive={isActive}
                    appMode={appMode}
                    onApplyPair={onApplyPair}
                  />
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
            : 'نکته ولتاژ رفرنس: رفرنس‌های دقیق را با در نظر گرفتن تلرانس ۵٪ بدترین حالت انتخاب کنید؛ جریان مصرفی کم از گرم شدن مقاومت‌ها و رانش دمایی مدار جلوگیری می‌کند.'}
        </span>
      </div>
    </motion.div>
  );
});

