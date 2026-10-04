'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, RotateCcw, Layers, Info } from 'lucide-react';
import { ResistorItem } from '@/types/resistor';
import { calculateSeriesResistance, calculateSeriesVoltageDrops } from '@/lib/series-calc';
import { SeriesSchematic } from './SeriesSchematic';
import { SeriesResultDisplay } from './SeriesResultDisplay';
import { ResistorRow } from '../resistor-calculator/ResistorRow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const DEFAULT_SERIES_ITEMS: ResistorItem[] = [
  { id: '1', value: '100', unit: 'Ohm', count: 1 },
  { id: '2', value: '220', unit: 'Ohm', count: 1 },
  { id: '3', value: '470', unit: 'Ohm', count: 1 },
];

export function SeriesCalculatorView() {
  const [items, setItems] = React.useState<ResistorItem[]>(DEFAULT_SERIES_ITEMS);
  const [testVoltage, setTestVoltage] = React.useState<string>('12');

  const result = React.useMemo(() => {
    return calculateSeriesResistance(items);
  }, [items]);

  const voltageAnalysis = React.useMemo(() => {
    const v = parseFloat(testVoltage) || 0;
    return calculateSeriesVoltageDrops(items, result.totalResistanceOhms || 0, v);
  }, [items, result.totalResistanceOhms, testVoltage]);

  const handleAddResistor = React.useCallback(() => {
    const newItem: ResistorItem = {
      id: String(Date.now()),
      value: '1',
      unit: 'kOhm',
      count: 1,
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  const handleUpdateItem = React.useCallback(
    (id: string, updates: Partial<ResistorItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const handleDeleteItem = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleDuplicateItem = React.useCallback((item: ResistorItem) => {
    const newItem: ResistorItem = {
      ...item,
      id: String(Date.now()),
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  const handleReset = React.useCallback(() => {
    setItems(DEFAULT_SERIES_ITEMS);
    setTestVoltage('12');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="space-y-6"
    >
      {/* Title & Scope Header */}
      <div className="border-b border-zinc-800/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>محاسبه‌گر مقاومت‌های سری</span>
              <Badge variant="subtle" className="text-[11px] font-mono border-emerald-900/50 bg-emerald-950/40 text-emerald-400">
                Series Circuit
              </Badge>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              محاسبه مقاومت معادل کل، افت ولتاژ روی هر شاخه با قانون KVL و جریان مدار در اتصال متوالی
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 ml-1.5" />
              <span>بازنشانی</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Dynamic Series Circuit Schematic */}
      <SeriesSchematic
        items={items}
        result={result}
        voltageAnalysis={voltageAnalysis}
      />

      {/* Main Grid: Inputs Workspace & Output Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Resistor Items */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-zinc-300">مقاومت‌های متوالی مدار</span>
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-0.5 rounded-md">
              {items.length} مقاومت سری
            </span>
          </div>

          {/* List of Resistor Parameter Rows */}
          <div className="space-y-2.5">
            {items.map((item, idx) => (
              <ResistorRow
                key={item.id}
                item={item}
                index={idx}
                canDelete={items.length > 1}
                onChange={handleUpdateItem}
                onDelete={handleDeleteItem}
                onDuplicate={handleDuplicateItem}
              />
            ))}
          </div>

          {/* Add Resistor Button */}
          <div className="pt-1">
            <Button
              type="button"
              variant="solid"
              size="md"
              onClick={handleAddResistor}
              className="w-full justify-center text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm transition-all group cursor-pointer"
            >
              <Plus className="h-4 w-4 ml-1.5 transition-transform duration-200 group-hover:rotate-90" />
              <span>افزودن مقاومت سری جدید</span>
            </Button>
          </div>

          {/* Circuit Theory Hint */}
          <div className="rounded-lg border border-zinc-850/80 bg-zinc-950/40 p-3 flex items-start gap-2.5 text-zinc-400 text-xs leading-relaxed">
            <Info className="h-4 w-4 shrink-0 text-zinc-500 mt-0.5" />
            <div>
              <span className="text-zinc-300 font-medium ml-1">قاعده طلایی مدار سری:</span>
              جریان در تمام مقاومت‌های سری یکسان است (I = I₁ = I₂). ولتاژ کل اعمالی بین مقاومت‌ها به نسبت مقدار اهمی آن‌ها تقسیم می‌شود (V_total = Σ V_i).
            </div>
          </div>
        </div>

        {/* Right Column: Output Readout */}
        <div className="lg:col-span-5 sticky top-6">
          <SeriesResultDisplay
            result={result}
            voltageAnalysis={voltageAnalysis}
            testVoltage={testVoltage}
            onChangeTestVoltage={setTestVoltage}
          />
        </div>
      </div>
    </motion.div>
  );
}
