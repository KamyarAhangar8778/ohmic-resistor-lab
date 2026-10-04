'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Activity, Cpu, RotateCcw, ListFilter, ShieldCheck } from 'lucide-react';
import {
  PowerFilterOption,
  CurrentFilterOption,
  DividerApplicationMode,
  TablePageSize,
} from '@/types/voltage-divider';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DividerPairFilterBarProps {
  appMode: DividerApplicationMode;
  onChangeAppMode: (mode: DividerApplicationMode) => void;
  powerFilter: PowerFilterOption;
  onChangePowerFilter: (val: PowerFilterOption) => void;
  currentFilter: CurrentFilterOption;
  onChangeCurrentFilter: (val: CurrentFilterOption) => void;
  pageSize: TablePageSize;
  onChangePageSize: (size: TablePageSize) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  filteredCount: number;
  totalCount: number;
}

const APP_MODES: {
  id: DividerApplicationMode;
  label: string;
  enLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: 'sampling',
    label: 'نمونه‌گیری سیگنال و ADC',
    enLabel: 'ADC Sampling',
    icon: Activity,
    description: 'بهینه‌سازی امپدانس ورودی میکروکنترلر (Rth <= 10k) و ضریب مقیاس سیگنال K',
  },
  {
    id: 'biasing',
    label: 'بایاس ترانزیستور',
    enLabel: 'Transistor Biasing',
    icon: Cpu,
    description: 'محاسبه ولتاژ و مقاومت معادل بیس (Vth, Rth) و پایداری در برابر تغییرات بتا',
  },
  {
    id: 'reference',
    label: 'ساخت ولتاژ رفرنس',
    enLabel: 'Voltage Reference',
    icon: ShieldCheck,
    description: 'تولید ولتاژ رفرنس دقیق با حداقل تلرانس بدترین حالت و ثبات حرارتی',
  },
];

const POWER_OPTIONS: { id: PowerFilterOption; label: string }[] = [
  { id: 'all', label: 'همه توان‌ها' },
  { id: '10mw', label: 'تا ۱۰mW (کم‌حرارت)' },
  { id: '50mw', label: 'تا ۵۰mW' },
  { id: '250mw', label: 'تا ۲۵۰mW (۱/۴W)' },
];

const CURRENT_OPTIONS: { id: CurrentFilterOption; label: string }[] = [
  { id: 'all', label: 'همه جریان‌ها' },
  { id: 'low', label: '< ۱۰۰µA (کم‌مصرف)' },
  { id: 'mid', label: '۱۰۰µA - ۵mA (استاندارد)' },
  { id: 'high', label: '> ۵mA (درایو قوی)' },
];

export const DividerPairFilterBar = React.memo(function DividerPairFilterBar({
  appMode,
  onChangeAppMode,
  powerFilter,
  onChangePowerFilter,
  currentFilter,
  onChangeCurrentFilter,
  pageSize,
  onChangePageSize,
  onResetFilters,
  hasActiveFilters,
  filteredCount,
  totalCount,
}: DividerPairFilterBarProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-3 p-3 rounded-lg border border-zinc-800 bg-zinc-950/70 text-xs">
      {/* Row 1: Primary Application Mode Selector (ADC Sampling, Transistor Biasing, Voltage Reference) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-zinc-850 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg border border-zinc-800 bg-zinc-950">
          {APP_MODES.map((mode) => {
            const isSelected = appMode === mode.id;
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.id}
                type="button"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                onClick={() => onChangeAppMode(mode.id)}
                title={mode.description}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer select-none z-10',
                  isSelected
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                {isSelected && (
                  <motion.span
                    layoutId={shouldReduceMotion ? undefined : 'active-app-mode-pill'}
                    className="absolute inset-0 rounded-md bg-zinc-800 border border-zinc-700/80 shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={cn('h-3.5 w-3.5 transition-colors', isSelected ? 'text-emerald-400' : 'text-zinc-500')} />
                <span>{mode.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Page Size Toggle (10 / 20) */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <div className="flex items-center gap-1.5">
            <ListFilter className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-zinc-400 text-[11px] font-medium">ظرفیت:</span>
            <div className="inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg select-none" dir="ltr">
              {[10, 20].map((size) => {
                const isSelected = pageSize === size;
                return (
                  <motion.button
                    key={size}
                    type="button"
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
                    onClick={() => onChangePageSize(size as TablePageSize)}
                    className={cn(
                      'relative px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 z-10',
                      isSelected
                        ? 'text-emerald-300 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId={shouldReduceMotion ? undefined : 'active-page-size-pill'}
                        className="absolute inset-0 rounded bg-emerald-950 border border-emerald-800/60 shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="font-mono tabular-nums">{size}</span>
                    <span className="font-sans">جفت</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <Badge variant="subtle" className="text-zinc-400 text-[11px]">
            <span>نمایش</span>
            <span className="text-white font-bold font-mono tabular-nums mx-1">{filteredCount}</span>
            <span>از</span>
            <span className="font-mono tabular-nums mr-1">{totalCount}</span>
          </Badge>
        </div>
      </div>

      {/* Row 2: Secondary Filters (Power & Current) & Reset Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        <div className="flex flex-wrap items-center gap-4">
          {/* Power Constraint */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px] font-medium">سقف توان:</span>
            <div
              role="radiogroup"
              aria-label="سقف توان مجاز"
              className="inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg select-none"
              dir="ltr"
            >
              {POWER_OPTIONS.map((opt) => {
                const isSelected = powerFilter === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                    onClick={() => onChangePowerFilter(opt.id)}
                    className={cn(
                      'relative px-2 py-0.5 rounded text-xs font-sans font-medium transition-colors cursor-pointer z-10',
                      isSelected
                        ? 'text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId={shouldReduceMotion ? undefined : 'active-power-pill'}
                        className="absolute inset-0 rounded bg-zinc-800 border border-zinc-700/60 shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span>{opt.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Current Constraint */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px] font-medium">بازه جریان:</span>
            <div
              role="radiogroup"
              aria-label="بازه جریان مدار"
              className="inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg select-none"
              dir="ltr"
            >
              {CURRENT_OPTIONS.map((opt) => {
                const isSelected = currentFilter === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                    onClick={() => onChangeCurrentFilter(opt.id)}
                    className={cn(
                      'relative px-2 py-0.5 rounded text-xs font-sans font-medium transition-colors cursor-pointer z-10',
                      isSelected
                        ? 'text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId={shouldReduceMotion ? undefined : 'active-current-pill'}
                        className="absolute inset-0 rounded bg-zinc-800 border border-zinc-700/60 shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span>{opt.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 active:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
            title="حذف فیلترها و نمایش همه"
          >
            <RotateCcw className="h-3 w-3" />
            <span>بازنشانی فیلترها</span>
          </motion.button>
        )}
      </div>
    </div>
  );
});

