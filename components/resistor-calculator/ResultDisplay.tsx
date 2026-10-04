'use client';

import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { ParallelCalculationResult } from '@/types/resistor';

interface ResultDisplayProps {
  result: ParallelCalculationResult;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 p-5 sm:p-6 shadow-xl transition-all duration-200 overflow-hidden">
      {/* Top subtle hairline glow - Secondary feedback pulse when calculation updates */}
      <motion.div
        key={result.displayValue}
        initial={{ opacity: 0.2, scaleX: 0.8 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent origin-center"
      />

      {/* Short Circuit Warning Banner with Corporate Error Shake Pattern */}
      <AnimatePresence>
        {result.isShortCircuit && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, scale: 0.96, marginBottom: 0 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    height: 'auto',
                    scale: 1,
                    marginBottom: 16,
                    x: [0, -8, 8, -5, 5, -2, 0],
                  }
            }
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, scale: 0.96, marginBottom: 0 }}
            transition={{
              x: { duration: 0.36, ease: 'easeInOut' },
              duration: 0.22,
              ease: [0.2, 0, 0, 1],
            }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2.5 rounded-lg border border-red-900/80 bg-red-950/50 p-3 text-xs text-red-300 font-medium shadow-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{result.errorMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Result Display Content */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline justify-center gap-2 my-2 select-all" dir="ltr">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={result.displayValue}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0.3, y: -6, scale: 0.98 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 tabular-nums"
            >
              {result.displayValue}
            </motion.span>
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            <motion.span
              key={result.displayUnit}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0.4, scale: 0.92 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-2xl font-semibold text-emerald-400"
            >
              {result.displayUnit}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="mt-2 text-[11px] font-mono text-zinc-500 tracking-wider">
          PARALLEL EQUIVALENT
        </div>
      </div>
    </div>
  );
}
