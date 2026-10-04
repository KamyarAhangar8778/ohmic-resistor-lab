'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Info } from 'lucide-react';
import { ResistorItem } from '@/types/resistor';
import { calculateParallelResistance } from '@/lib/resistor-calc';
import { ResistorRow } from './ResistorRow';
import { ResultDisplay } from './ResultDisplay';
import { CircuitSchematic } from './CircuitSchematic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DEFAULT_ITEMS: ResistorItem[] = [
  { id: '1', value: '100', unit: 'Ohm', count: 1 },
  { id: '2', value: '100', unit: 'Ohm', count: 1 },
  { id: '3', value: '100', unit: 'Ohm', count: 1 },
];

export function ResistorCalculatorView() {
  const [items, setItems] = React.useState<ResistorItem[]>(DEFAULT_ITEMS);
  const listContainerRef = React.useRef<HTMLDivElement>(null);

  const result = React.useMemo(() => {
    return calculateParallelResistance(items);
  }, [items]);

  const idCounterRef = React.useRef(10);
  const getNextId = React.useCallback(() => {
    idCounterRef.current += 1;
    return `resistor-${idCounterRef.current}`;
  }, []);

  const scrollToBottom = React.useCallback(() => {
    setTimeout(() => {
      if (listContainerRef.current) {
        listContainerRef.current.scrollTo({
          top: listContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 60);
  }, []);

  const handleItemChange = React.useCallback((id: string, updates: Partial<ResistorItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const handleAddItem = React.useCallback(() => {
    const nextId = getNextId();
    setItems((prev) => [...prev, { id: nextId, value: '', unit: 'Ohm', count: 1 }]);
    scrollToBottom();
  }, [getNextId, scrollToBottom]);

  const handleDeleteItem = React.useCallback((id: string) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const handleDuplicateItem = React.useCallback((itemToDup: ResistorItem) => {
    const nextId = getNextId();
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === itemToDup.id);
      const clone = { ...itemToDup, id: nextId };
      if (idx === -1) return [...prev, clone];
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
    scrollToBottom();
  }, [getNextId, scrollToBottom]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="space-y-6"
    >
      {/* Title & Scope Header */}
      <div className="border-b border-zinc-800/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>محاسبه‌گر مقاومت موازی</span>
              <Badge variant="subtle" className="text-[11px] font-mono border-emerald-900/50 bg-emerald-950/40 text-emerald-400">
                Parallel Network
              </Badge>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              مقدار و تعداد مقاومت‌ها را در هر شاخه وارد کنید تا مقاومت معادل فوراً محاسبه شود.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Parallel Circuit Schematic */}
      <CircuitSchematic items={items} result={result} />

      {/* Main Grid: Resistor List & Output Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Resistor List (Interactive Workspace) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Workspace Subheader with Active Count */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-zinc-300">شاخه‌های ورودی مدار</span>
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={items.length}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  className="font-mono font-bold text-xs inline-block"
                >
                  {items.length}
                </motion.span>
              </AnimatePresence>
              <span>شاخه فعال</span>
            </span>
          </div>

          {/* Resistors List with Scrollable Area, Hidden Scrollbar, and Bottom Fade */}
          <div className="relative">
            <div
              ref={listContainerRef}
              className="flex flex-col relative max-h-[270px] overflow-y-auto overflow-x-hidden p-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <AnimatePresence initial={false}>
                {items.map((item, index) => (
                  <ResistorRow
                    key={item.id}
                    item={item}
                    index={index}
                    canDelete={items.length > 1}
                    onChange={handleItemChange}
                    onDelete={handleDeleteItem}
                    onDuplicate={handleDuplicateItem}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom Fade Gradient for Scrollable List */}
            <AnimatePresence>
              {items.length > 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute bottom-0 inset-x-0 h-9 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent rounded-b-xl"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Add Branch Area with Tactile Micro-interaction */}
          <div className="pt-1">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="solid"
                size="md"
                onClick={handleAddItem}
                className="w-full justify-center text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm transition-all group"
              >
                <Plus className="h-4 w-4 ml-1.5 transition-transform duration-200 group-hover:rotate-90" />
                <span>افزودن شاخه جدید</span>
              </Button>
            </motion.div>
          </div>

          {/* Helpful Circuit Theory Hint */}
          <div className="rounded-lg border border-zinc-850/80 bg-zinc-950/40 p-3 flex items-start gap-2.5 text-zinc-400 text-xs leading-relaxed">
            <Info className="h-4 w-4 shrink-0 text-zinc-500 mt-0.5" />
            <div>
              <span className="text-zinc-300 font-medium ml-1">قاعده طلایی مدار موازی:</span>
              مقاومت معادل در مدار موازی همواره از کوچک‌ترین مقاومت موجود در مدار کمتر است. همچنین هر شاخه جریان مستقل خود را عبور می‌دهد.
            </div>
          </div>
        </div>

        {/* Right Column: Result Output */}
        <div className="lg:col-span-5 sticky top-6">
          <ResultDisplay result={result} />
        </div>
      </div>
    </motion.div>
  );
}
