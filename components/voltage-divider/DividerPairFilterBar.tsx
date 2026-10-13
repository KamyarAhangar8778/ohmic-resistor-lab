'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Activity, Cpu, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import {
  CurrentFilterOption,
  DividerApplicationMode,
  PairSortCriterion,
  ResistorSeriesOption,
  TablePageSize,
} from '@/types/voltage-divider';
import { ResistorUnit } from '@/types/resistor';
import { cn } from '@/lib/utils';

interface DividerPairFilterBarProps {
  appMode: DividerApplicationMode;
  onChangeAppMode: (mode: DividerApplicationMode) => void;
  series: ResistorSeriesOption;
  onChangeSeries: (series: ResistorSeriesOption) => void;
  criterion: PairSortCriterion;
  onChangeCriterion: (criterion: PairSortCriterion) => void;
  currentFilter: CurrentFilterOption;
  onChangeCurrentFilter: (val: CurrentFilterOption) => void;
  pageSize: TablePageSize;
  onChangePageSize: (size: TablePageSize) => void;
  hasLoad: boolean;
  rlValue?: string;
  rlUnit?: ResistorUnit;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  filteredCount: number;
  totalCount: number;
}

const APP_MODES: {
  id: DividerApplicationMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'sampling',
    label: 'نمونه‌گیری سیگنال و ADC',
    icon: Activity,
  },
  {
    id: 'biasing',
    label: 'بایاس ترانزیستور',
    icon: Cpu,
  },
  {
    id: 'reference',
    label: 'ساخت ولتاژ رفرنس',
    icon: ShieldCheck,
  },
];

const CRITERIA_OPTIONS: { id: PairSortCriterion; label: string }[] = [
  { id: 'overall', label: 'تعادل کلی' },
  { id: 'accuracy', label: 'بیشترین دقت' },
  { id: 'current', label: 'کمترین جریان' },
  { id: 'max_current', label: 'بیشترین جریان خروجی' },
  { id: 'thevenin', label: 'کمترین امپدانس' },
  { id: 'max_thevenin', label: 'بیشترین امپدانس خروجی' },
];

const CURRENT_OPTIONS: { id: CurrentFilterOption; label: string }[] = [
  { id: 'all', label: 'همه جریان‌ها' },
  { id: 'low', label: '< ۱۰۰µA' },
  { id: 'mid', label: '۱۰۰µA - ۵mA' },
  { id: 'high', label: '> ۵mA' },
];

export const DividerPairFilterBar = React.memo(function DividerPairFilterBar({
  appMode,
  onChangeAppMode,
  series,
  onChangeSeries,
  criterion,
  onChangeCriterion,
  currentFilter,
  onChangeCurrentFilter,
  pageSize,
  onChangePageSize,
  hasLoad,
  rlValue,
  rlUnit = 'kOhm',
  onResetFilters,
  hasActiveFilters,
  filteredCount,
  totalCount,
}: DividerPairFilterBarProps) {
  const rlSym = rlUnit === 'kOhm' ? 'kΩ' : rlUnit === 'MOhm' ? 'MΩ' : 'Ω';

  return (
    <div className="space-y-3.5 p-3.5 sm:p-4 rounded-xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 via-zinc-900/40 to-zinc-950/90 text-xs shadow-md">
      {/* Row 1: Application Modes & Resistor Series */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-800/70 pb-3">
        {/* Application Mode Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-lg border border-zinc-800 bg-zinc-950/90 scrollbar-none">
          {APP_MODES.map((mode) => {
            const isSelected = appMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChangeAppMode(mode.id)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none shrink-0',
                  isSelected
                    ? 'text-white font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                )}
              >
                {isSelected && (
                  <motion.span
                    layoutId="active-app-mode-pill"
                    className="absolute inset-0 rounded-md bg-zinc-800 border border-zinc-700/80 -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={cn('h-3.5 w-3.5 transition-colors', isSelected ? 'text-emerald-400' : 'text-zinc-500')} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side: Series Selector & Prominent Load Resistor Telemetry */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Resistor Series (Fixed to E24 5%) */}
          <div className="inline-flex items-center bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg select-none text-xs font-mono text-emerald-300 font-bold" dir="ltr">
            <span>E24 (۵٪)</span>
          </div>

          {/* Prominent Load Status Indicator */}
          {hasLoad ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-600/50 text-emerald-300 text-xs shadow-xs animate-in fade-in duration-200">
              <Zap className="h-3.5 w-3.5 text-emerald-400 animate-pulse shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white">بار متصل:</span>
                <span className="font-mono font-bold text-emerald-300 tabular-nums" dir="ltr">
                  RL = {rlValue} {rlSym}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400/90 bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-700/50 hidden sm:inline-block">
                جبران افت بار فعال
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-zinc-400 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
              <span>خروجی مدار باز (بدون بار RL)</span>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Optimization Criteria, Current Range, Page Size, and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        {/* Left: Criteria & Current Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Criteria Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[11px] font-medium">اولویت:</span>
            <div className="inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg select-none">
              {CRITERIA_OPTIONS.map((opt) => {
                const isSelected = criterion === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeCriterion(opt.id)}
                    className={cn(
                      'relative px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer',
                      isSelected
                        ? 'text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="active-criterion-pill"
                        className="absolute inset-0 rounded bg-zinc-850 border border-zinc-700/60 shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Range Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[11px] font-medium">جریان:</span>
            <div
              role="radiogroup"
              aria-label="بازه جریان مدار"
              className="inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg select-none"
              dir="ltr"
            >
              {CURRENT_OPTIONS.map((opt) => {
                const isSelected = currentFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeCurrentFilter(opt.id)}
                    className={cn(
                      'relative px-2 py-0.5 rounded text-xs font-sans font-medium transition-colors cursor-pointer',
                      isSelected
                        ? 'text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="active-current-pill"
                        className="absolute inset-0 rounded bg-zinc-800 border border-zinc-700/60 shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Page Size & Reset Filter */}
        <div className="flex items-center gap-2">
          {/* Result Count Badge */}
          <span className="text-[11px] text-zinc-400 font-mono">
            {filteredCount} / {totalCount} جفت
          </span>

          {/* Capacity Toggle */}
          <div className="inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg select-none" dir="ltr">
            {[10, 20].map((size) => {
              const isSelected = pageSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChangePageSize(size as TablePageSize)}
                  className={cn(
                    'relative px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1',
                    isSelected
                      ? 'text-emerald-300 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="active-page-size-pill"
                      className="absolute inset-0 rounded bg-emerald-950 border border-emerald-800/60 shadow-xs -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="font-mono tabular-nums">{size}</span>
                  <span className="font-sans">جفت</span>
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 transition-colors cursor-pointer border border-zinc-800"
              title="بازنشانی فیلترها"
            >
              <RotateCcw className="h-3 w-3" />
              <span>بازنشانی</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

