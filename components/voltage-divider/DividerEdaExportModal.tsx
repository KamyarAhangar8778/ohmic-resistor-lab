'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Download, Layers, X, Code2 } from 'lucide-react';
import { StandardResistorPair, VoltageDividerState } from '@/types/voltage-divider';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DividerEdaExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pair: StandardResistorPair;
  state: VoltageDividerState;
}

type EdaToolTab = 'altium' | 'proteus' | 'multisim' | 'bom';

export const DividerEdaExportModal = React.memo(function DividerEdaExportModal({
  isOpen,
  onClose,
  pair,
  state,
}: DividerEdaExportModalProps) {
  const [activeTab, setActiveTab] = React.useState<EdaToolTab>('altium');
  const [copied, setCopied] = React.useState<boolean>(false);

  const r1Sym = pair.r1Unit === 'kOhm' ? 'k' : pair.r1Unit === 'MOhm' ? 'M' : '';
  const r2Sym = pair.r2Unit === 'kOhm' ? 'k' : pair.r2Unit === 'MOhm' ? 'M' : '';
  const r1ValStr = `${pair.r1Value}${r1Sym}`;
  const r2ValStr = `${pair.r2Value}${r2Sym}`;
  const tolStr = `${pair.tolerancePct ?? (pair.series === 'E96' ? 1 : 5)}%`;

  // Generate tool-specific snippets
  const snippet = React.useMemo(() => {
    switch (activeTab) {
      case 'altium':
        return `; ==========================================
; Altium Designer Component & Netlist Export
; Project: Voltage Divider (${state.appMode})
; Vin: ${state.vin}${state.vinUnit} -> Vout: ${pair.displayVout}V (Tol: ${tolStr})
; ==========================================

[R1]
Designator = "R1"
Comment = "${r1ValStr}"
Description = "Resistor SMD ${r1ValStr} ${tolStr} 0805"
Footprint = "RESC2012X06N_0805"
Value = "${r1ValStr}"
Tolerance = "${tolStr}"
Power = "${pair.powerR1Formatted ?? '125mW'}"

[R2]
Designator = "R2"
Comment = "${r2ValStr}"
Description = "Resistor SMD ${r2ValStr} ${tolStr} 0805"
Footprint = "RESC2012X06N_0805"
Value = "${r2ValStr}"
Tolerance = "${tolStr}"
Power = "${pair.powerR2Formatted ?? '125mW'}"`;

      case 'proteus':
        return `; ==========================================
; Proteus 8 Professional Component Script
; Target Vout: ${pair.displayVout}V | Series: ${pair.series ?? 'E24'} (${tolStr})
; ==========================================

*DEVICE: RESISTOR
*NAME: R1
{VALUE="${r1ValStr}"}
{TOLERANCE="${tolStr}"}
{PACKAGE="RES40"}
{POWER="${pair.powerR1Formatted ?? '0.25W'}"}

*DEVICE: RESISTOR
*NAME: R2
{VALUE="${r2ValStr}"}
{TOLERANCE="${tolStr}"}
{PACKAGE="RES40"}
{POWER="${pair.powerR2Formatted ?? '0.25W'}"}`;

      case 'multisim':
        return `* ==========================================
* NI Multisim / SPICE Subcircuit Netlist
* Circuit: Voltage Divider (${state.appMode})
* Vin: ${state.vin}V | Vout: ${pair.displayVout}V
* ==========================================

.SUBCKT VOLTAGE_DIVIDER VIN VOUT GND
R1 VIN VOUT ${r1ValStr} tol=${tolStr}
R2 VOUT GND  ${r2ValStr} tol=${tolStr}
.ENDS VOLTAGE_DIVIDER`;

      case 'bom':
      default:
        return `Designator,Comment,Value,Tolerance,Package,Application,MaxPower
R1,${r1ValStr},${r1ValStr},${tolStr},SMD 0805,${state.appMode === 'sampling' ? 'ADC Divider High-Side' : state.appMode === 'biasing' ? 'Base Bias Pull-Up' : 'Voltage Reference High-Side'},${pair.powerR1Formatted ?? '—'}
R2,${r2ValStr},${r2ValStr},${tolStr},SMD 0805,${state.appMode === 'sampling' ? 'ADC Divider Low-Side' : state.appMode === 'biasing' ? 'Base Bias Pull-Down' : 'Voltage Reference Low-Side'},${pair.powerR2Formatted ?? '—'}`;
    }
  }, [activeTab, pair, state, r1ValStr, r2ValStr, tolStr]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-xl border border-zinc-750 bg-zinc-950 p-6 shadow-2xl space-y-4 text-zinc-100 font-sans"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                <Code2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  خروجی و کپی سریع برای نرم‌افزارهای EDA
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  R1: {r1ValStr} | R2: {r2ValStr} | Vout: {pair.displayVout}V ({tolStr})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Software Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1 rounded-lg bg-zinc-900/80 border border-zinc-800">
            {(
              [
                { id: 'altium', label: 'Altium Designer' },
                { id: 'proteus', label: 'Proteus 8' },
                { id: 'multisim', label: 'NI Multisim / SPICE' },
                { id: 'bom', label: 'BOM (CSV)' },
              ] as const
            ).map((tab) => {
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer select-none',
                    isSel
                      ? 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Code Snippet Box */}
          <div className="relative rounded-lg border border-zinc-800 bg-zinc-900/90 p-3.5 font-mono text-xs text-zinc-300" dir="ltr">
            <pre className="overflow-x-auto max-h-56 leading-relaxed whitespace-pre font-mono text-[11px] text-emerald-300/90">
              {snippet}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <Badge variant="subtle" className="text-[11px] font-mono text-zinc-400">
              فرمت آماده Import مستقیم در EDA
            </Badge>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                بستن
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>کپی در کلیپ‌بورد</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
