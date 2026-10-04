'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Zap, Activity, Smartphone } from 'lucide-react';
import { SymbolStandard, SchematicLegendItem } from './schematic-types';
import { SchematicDefs } from './SchematicDefs';
import { cn } from '@/lib/utils';

export interface SchematicCardProps {
  title: string;
  subtitle: string;
  svgHeight?: number;
  minContentWidth?: number;
  symbolStandard: SymbolStandard;
  onSymbolStandardChange: (std: SymbolStandard) => void;
  animateFlow: boolean;
  onAnimateFlowChange: (animate: boolean) => void;
  legendItems: SchematicLegendItem[];
  children: (props: {
    svgWidth: number;
    svgHeight: number;
    symbolStandard: SymbolStandard;
    animateFlow: boolean;
  }) => React.ReactNode;
}

export function SchematicCard({
  title,
  subtitle,
  svgHeight = 220,
  minContentWidth = 460,
  symbolStandard,
  onSymbolStandardChange,
  animateFlow,
  onAnimateFlowChange,
  legendItems,
  children,
}: SchematicCardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(800);
  const [fitToScreen, setFitToScreen] = React.useState<boolean>(false);

  // ResizeObserver for zero-reflow layout responsiveness
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setContainerWidth(el.clientWidth);

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const svgWidth = Math.max(containerWidth || 600, minContentWidth);

  return (
    <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-[#0e0e11] to-[#09090b] shadow-xl overflow-hidden select-none transition-all">
      {/* Precision Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md">
        {/* Left: Identity */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-zinc-100 tracking-tight">
              {title}
            </h2>
            <p className="text-[11px] text-zinc-500 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* IEEE / IEC Toggle */}
          <div className="relative inline-flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[11px] font-mono select-none">
            <button
              type="button"
              onClick={() => onSymbolStandardChange('ieee')}
              className={cn(
                'relative z-10 px-2 py-0.5 rounded transition-colors active:scale-95 cursor-pointer',
                symbolStandard === 'ieee' ? 'text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              )}
              title="استاندارد آمریکایی (زیگزاگ ANSI/IEEE)"
            >
              {symbolStandard === 'ieee' && (
                <motion.span
                  layoutId="schematic-core-std-pill"
                  className="absolute inset-0 rounded bg-zinc-800 border border-zinc-700/60 shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              IEEE
            </button>
            <button
              type="button"
              onClick={() => onSymbolStandardChange('iec')}
              className={cn(
                'relative z-10 px-2 py-0.5 rounded transition-colors active:scale-95 cursor-pointer',
                symbolStandard === 'iec' ? 'text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              )}
              title="استاندارد بین‌المللی (مستطیل IEC)"
            >
              {symbolStandard === 'iec' && (
                <motion.span
                  layoutId="schematic-core-std-pill"
                  className="absolute inset-0 rounded bg-zinc-800 border border-zinc-700/60 shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              IEC
            </button>
          </div>

          {/* Current Flow Animation Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onAnimateFlowChange(!animateFlow)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer select-none',
              animateFlow
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-xs'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            )}
            title="روشن/خاموش کردن انیمیشن شارش جریان"
          >
            <Activity className={cn('h-3.5 w-3.5 transition-colors', animateFlow && 'text-emerald-400')} />
            <span className="hidden sm:inline">شارش جریان</span>
          </motion.button>

          {/* Fit to Screen Toggle for Mobile */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setFitToScreen(!fitToScreen)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer select-none',
              fitToScreen
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-xs'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            )}
            title="تطبیق ابعاد مدار با عرض صفحه در نمایشگرهای کوچک (Fit to Screen)"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{fitToScreen ? 'مقیاس ۱:۱' : 'تطبیق با صفحه'}</span>
          </motion.button>
        </div>
      </div>

      {/* Schematic SVG Stage */}
      <div
        ref={containerRef}
        dir="ltr"
        style={{ direction: 'ltr' }}
        className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800"
      >
        <svg
          style={{
            direction: 'ltr',
            minWidth: fitToScreen ? '100%' : `${minContentWidth}px`,
            width: fitToScreen ? '100%' : 'auto',
          }}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full block"
          height={svgHeight}
          preserveAspectRatio="xMidYMid meet"
          aria-label={title}
        >
          <SchematicDefs />

          {/* Background Grid */}
          <rect width={svgWidth} height={svgHeight} fill="#09090b" />
          <rect width={svgWidth} height={svgHeight} fill="url(#eda-grid)" />

          {/* Top & Bottom Frame Lines */}
          <line x1="0" y1="0" x2={svgWidth} y2="0" stroke="#1f1f23" strokeWidth="1" />
          <line x1="0" y1={svgHeight - 1} x2={svgWidth} y2={svgHeight - 1} stroke="#1f1f23" strokeWidth="1" />

          {/* Child circuit elements */}
          {children({ svgWidth, svgHeight, symbolStandard, animateFlow })}
        </svg>
      </div>

      {/* Footer Legend Bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-zinc-800/60 bg-zinc-950/40 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-3 flex-wrap">
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {item.shape === 'square' ? (
                <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />
              ) : item.shape === 'dash' ? (
                <span className="inline-block h-1.5 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              ) : (
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              )}
              <span className={cn('font-sans', item.textColor || 'text-zinc-300')}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
