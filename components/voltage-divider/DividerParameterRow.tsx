'use client';

import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Trash2 } from 'lucide-react';
import { ResistorUnit, RESISTOR_UNITS } from '@/types/resistor';
import { VoltageUnit, VOLTAGE_UNITS } from '@/types/voltage-divider';
import { getResistorColorBands } from '@/lib/resistor-calc';
import { Input } from '@/components/ui/input';
import { IconButton } from '@/components/ui/icon-button';
import { cn, sanitizeNumericInput } from '@/lib/utils';

interface DividerParameterRowProps {
  id: string;
  label: string;
  tag: string;
  value: string;
  unit: string;
  unitType: 'voltage' | 'resistor';
  placeholder?: string;
  canDelete?: boolean;
  onDelete?: () => void;
  onChangeValue: (val: string) => void;
  onChangeUnit: (unit: string) => void;
  showColorCode?: boolean;
  isCalculated?: boolean;
  calculatedBadgeText?: string;
}

export const DividerParameterRow = React.memo(function DividerParameterRow({
  id,
  label,
  tag,
  value,
  unit,
  unitType,
  placeholder = '10 یا 4.7',
  canDelete = false,
  onDelete,
  onChangeValue,
  onChangeUnit,
  showColorCode = true,
  isCalculated = false,
  calculatedBadgeText = 'محاسبه‌شده',
}: DividerParameterRowProps) {
  const shouldReduceMotion = useReducedMotion();

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCalculated) return;
    const clean = sanitizeNumericInput(e.target.value);
    onChangeValue(clean);
  };

  const handleClear = () => {
    if (isCalculated) return;
    onChangeValue('');
  };

  const colorBands = React.useMemo(() => {
    if (!showColorCode || unitType !== 'resistor') return null;
    return getResistorColorBands({
      id,
      value,
      unit: unit as ResistorUnit,
      count: 1,
    });
  }, [showColorCode, unitType, id, value, unit]);

  return (
    <motion.div
      layout={!shouldReduceMotion}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -6, marginBottom: 0 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto', y: 0, marginBottom: 10 }}
      exit={
        shouldReduceMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              height: 0,
              y: -4,
              marginBottom: 0,
              transition: { duration: 0.18, ease: [0.3, 0, 1, 1], opacity: { duration: 0.14 } },
            }
      }
      transition={{
        layout: { duration: 0.28, ease: [0.2, 0, 0, 1] },
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="overflow-hidden shrink-0 w-full"
    >
      <div className={cn(
        "group relative rounded-xl border p-3.5 sm:p-4 transition-all duration-200",
        isCalculated
          ? "border-emerald-600/70 bg-gradient-to-b from-emerald-950/20 to-zinc-950/70 shadow-emerald-950/20 shadow-lg"
          : "border-zinc-800/90 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-950/40"
      )}>
        {/* Top subtle glow bar */}
        <div className={cn(
          "absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent to-transparent",
          isCalculated ? "via-emerald-500/60" : "via-zinc-700/40"
        )} />

        {/* Main Interactive Controls Bar matching ResistorRow */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3.5">
          {/* Tag Identification & Label */}
          <div className="flex items-center justify-between lg:justify-start gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex h-8 w-11 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold shadow-inner select-none",
                  isCalculated
                    ? "border-emerald-500/60 bg-emerald-950/70 text-emerald-300"
                    : "border-zinc-700/70 bg-zinc-950 text-zinc-200"
                )}
              >
                {tag}
              </motion.div>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium", isCalculated ? "text-emerald-300 font-semibold" : "text-zinc-400")}>
                  {label}
                </span>
                {isCalculated && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-400">
                    {calculatedBadgeText}
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Delete Action */}
            {canDelete && onDelete && !isCalculated && (
              <div className="lg:hidden">
                <IconButton
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={onDelete}
                  title="حذف المان"
                  className="text-zinc-400 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            )}
          </div>

          {/* Value Input */}
          <div className="flex-1 min-w-[140px]">
            <div className="relative">
              <Input
                type="text"
                inputMode="decimal"
                dir="ltr"
                placeholder={placeholder}
                value={value}
                readOnly={isCalculated}
                onChange={handleValueChange}
                className={cn(
                  "w-full pl-3 pr-8 font-mono text-sm h-10 text-left transition-colors",
                  isCalculated
                    ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200 cursor-default font-bold"
                    : "bg-zinc-950/90 border-zinc-800 text-zinc-100 focus-visible:border-emerald-500/80 focus-visible:ring-emerald-500/20"
                )}
              />
              {!isCalculated && value ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-zinc-200 transition-colors rounded cursor-pointer"
                  title="پاک کردن مقدار"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              ) : null}
            </div>
          </div>

          {/* Unit Selector matching ResistorRow */}
          <div
            role="radiogroup"
            aria-label="انتخاب مقیاس"
            className="shrink-0 inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg select-none relative"
            dir="ltr"
          >
            {unitType === 'voltage'
              ? VOLTAGE_UNITS.map((u) => {
                  const isSelected = unit === u.value;
                  return (
                    <button
                      key={u.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onChangeUnit(u.value)}
                      className={cn(
                        'relative inline-flex items-center justify-center cursor-pointer rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-colors select-none z-10 active:scale-95',
                        isSelected ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                      )}
                      title={u.label}
                    >
                      {isSelected && (
                        <motion.span
                          layoutId={shouldReduceMotion ? undefined : `unit-pill-${id}`}
                          className="absolute inset-0 rounded-md bg-zinc-800 border border-zinc-700/60 shadow-xs -z-10"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span>{u.symbol}</span>
                    </button>
                  );
                })
              : RESISTOR_UNITS.map((u) => {
                  const isSelected = unit === u.value;
                  return (
                    <button
                      key={u.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onChangeUnit(u.value)}
                      className={cn(
                        'relative inline-flex items-center justify-center cursor-pointer rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-colors select-none z-10 active:scale-95',
                        isSelected ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                      )}
                      title={u.label}
                    >
                      {isSelected && (
                        <motion.span
                          layoutId={shouldReduceMotion ? undefined : `unit-pill-${id}`}
                          className="absolute inset-0 rounded-md bg-zinc-800 border border-zinc-700/60 shadow-xs -z-10"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span>{u.symbol}</span>
                    </button>
                  );
                })}
          </div>

          {/* Desktop Delete Action */}
          {canDelete && onDelete && (
            <div className="hidden lg:flex items-center shrink-0">
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                <IconButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  title="حذف مقاومت بار"
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </motion.div>
            </div>
          )}
        </div>

        {/* Mini Resistor Color Code Visualizer */}
        <AnimatePresence>
          {colorBands && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-end text-xs">
                <div
                  className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800/80 px-2 py-1 rounded-md shadow-xs"
                  title="کد رنگی استاندارد مقاومت (EIA 4-Band)"
                >
                  <span className="text-[10px] text-zinc-400 font-medium">کد رنگ:</span>
                  <div className="flex items-center">
                    <div className="w-1.5 h-0.5 bg-zinc-500" />
                    <div className="flex items-center h-3.5 bg-[#d8c3a5] px-1 rounded-xs gap-1 border border-[#b8a082] shadow-xs">
                      {colorBands.map((band, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: idx * 0.03, duration: 0.15 }}
                          className="inline-block h-3.5 w-1 rounded-[1px] shadow-xs origin-center"
                          style={{ backgroundColor: band.color }}
                          title={`${band.nameFa} (${band.name})`}
                        />
                      ))}
                    </div>
                    <div className="w-1.5 h-0.5 bg-zinc-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});
