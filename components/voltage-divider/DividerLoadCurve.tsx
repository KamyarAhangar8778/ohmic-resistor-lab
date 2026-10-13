'use client';

import * as React from 'react';
import { LineChart, Activity, Info } from 'lucide-react';
import { VoltageDividerState, VoltageDividerResult } from '@/types/voltage-divider';
import { Badge } from '@/components/ui/badge';

interface DividerLoadCurveProps {
  state: VoltageDividerState;
  result: VoltageDividerResult;
}

export function DividerLoadCurve({ state, result }: DividerLoadCurveProps) {
  const vin = result.vinVolts || 5;

  // Calculate R1 and R2 in pure Ohms
  const r1Ohms = React.useMemo(() => {
    const raw = parseFloat(state.r1) || 10;
    if (state.r1Unit === 'kOhm') return raw * 1e3;
    if (state.r1Unit === 'MOhm') return raw * 1e6;
    return raw;
  }, [state.r1, state.r1Unit]);

  const r2Ohms = React.useMemo(() => {
    const raw = parseFloat(state.r2) || 10;
    if (state.r2Unit === 'kOhm') return raw * 1e3;
    if (state.r2Unit === 'MOhm') return raw * 1e6;
    return raw;
  }, [state.r2, state.r2Unit]);

  const rlOhms = React.useMemo(() => {
    if (!state.hasLoad) return null;
    const raw = parseFloat(state.rl) || 100;
    if (state.rlUnit === 'kOhm') return raw * 1e3;
    if (state.rlUnit === 'MOhm') return raw * 1e6;
    return raw;
  }, [state.hasLoad, state.rl, state.rlUnit]);

  // Open-circuit no-load voltage
  const voutNoLoad = (vin * r2Ohms) / (r1Ohms + r2Ohms);
  const voutLoaded = result.voutVolts ?? voutNoLoad;

  const loadDropPercent = voutNoLoad > 0
    ? Math.max(0, ((voutNoLoad - voutLoaded) / voutNoLoad) * 100)
    : 0;

  // Chart Dimensions
  const chartW = 480;
  const chartH = 140;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 26;
  const plotW = chartW - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;

  // Sample 25 points logarithmic from 0.05 * R2 to 20 * R2
  const points = React.useMemo(() => {
    if (r1Ohms <= 0 || r2Ohms <= 0) return [];
    const pts: { rl: number; vout: number; x: number; y: number }[] = [];
    const minLog = Math.log10(r2Ohms * 0.05);
    const maxLog = Math.log10(r2Ohms * 25);

    for (let i = 0; i <= 30; i++) {
      const logVal = minLog + (i / 30) * (maxLog - minLog);
      const rlVal = Math.pow(10, logVal);
      const rEq = (r2Ohms * rlVal) / (r2Ohms + rlVal);
      const v = (vin * rEq) / (r1Ohms + rEq);

      const x = padLeft + (i / 30) * plotW;
      const y = padTop + plotH - (v / Math.max(0.1, voutNoLoad * 1.1)) * plotH;
      pts.push({ rl: rlVal, vout: v, x, y });
    }
    return pts;
  }, [vin, r1Ohms, r2Ohms, voutNoLoad, plotW, plotH, padLeft, padTop]);

  const pathD = React.useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [points]);

  // Current operating point on the curve
  const currentPoint = React.useMemo(() => {
    if (!rlOhms) return null;
    const minLog = Math.log10(r2Ohms * 0.05);
    const maxLog = Math.log10(r2Ohms * 25);
    const currentLog = Math.log10(rlOhms);
    const fraction = Math.max(0, Math.min(1, (currentLog - minLog) / (maxLog - minLog)));
    const x = padLeft + fraction * plotW;
    const y = padTop + plotH - (voutLoaded / Math.max(0.1, voutNoLoad * 1.1)) * plotH;
    return { x, y };
  }, [rlOhms, r2Ohms, voutLoaded, voutNoLoad, plotW, plotH, padLeft, padTop]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-850 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-400">
            <LineChart className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span>رفتار بار و رگولاسیون ولتاژ خروجی</span>
              <Badge variant="subtle" className="text-[10px] font-mono border-zinc-700 bg-zinc-900 text-zinc-300">
                Vout vs. RL
              </Badge>
            </h3>
            <p className="text-[11px] text-zinc-400">
              نمودار تغییرات ولتاژ خروجی بر حسب مقاومت بار متصل‌شده (Load Regulation Curve)
            </p>
          </div>
        </div>

        {/* Load Status Summary */}
        <div className="text-xs font-mono flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span>ولتاژ بی‌باری:</span>
            <strong className="text-white">{voutNoLoad.toFixed(2)} V</strong>
          </div>
          {state.hasLoad && (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">افت ولتاژ ناشی از بار:</span>
              <strong className={loadDropPercent > 5 ? 'text-amber-400' : 'text-emerald-400'}>
                {loadDropPercent.toFixed(1)}%
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* SVG Responsive Plot */}
      <div className="w-full overflow-x-auto scrollbar-thin" dir="ltr">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full h-auto max-h-[160px] min-w-[380px] block"
          style={{ direction: 'ltr' }}
        >
          {/* Chart Background Grid */}
          <rect x={padLeft} y={padTop} width={plotW} height={plotH} fill="#0d0d11" rx="4" />
          <line x1={padLeft} y1={padTop + plotH / 2} x2={padLeft + plotW} y2={padTop + plotH / 2} stroke="#1f1f23" strokeDasharray="3 3" />
          <line x1={padLeft + plotW / 2} y1={padTop} x2={padLeft + plotW / 2} y2={padTop + plotH} stroke="#1f1f23" strokeDasharray="3 3" />

          {/* Theoretical Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Operating Point Indicator (When Load Active) */}
          {currentPoint && (
            <g>
              {/* Vertical Guide to RL point */}
              <line
                x1={currentPoint.x}
                y1={padTop + plotH}
                x2={currentPoint.x}
                y2={currentPoint.y}
                stroke="#34d399"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />
              <circle cx={currentPoint.x} cy={currentPoint.y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx={currentPoint.x} cy={currentPoint.y} r="8" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.5" />
            </g>
          )}

          {/* Axes Labels */}
          <text x={padLeft - 6} y={padTop + 6} fill="#a1a1aa" fontSize="9" fontFamily="monospace" textAnchor="end">
            {voutNoLoad.toFixed(1)}V
          </text>
          <text x={padLeft - 6} y={padTop + plotH} fill="#71717a" fontSize="9" fontFamily="monospace" textAnchor="end">
            0V
          </text>
          <text x={padLeft} y={chartH - 8} fill="#71717a" fontSize="9" fontFamily="monospace">
            بار سنگین (RL کم)
          </text>
          <text x={chartW - padRight} y={chartH - 8} fill="#a1a1aa" fontSize="9" fontFamily="monospace" textAnchor="end">
            بار سبک (RL زیاد → بی‌باری)
          </text>
        </svg>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-900/40 p-2 rounded-lg">
        <Info className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
        <span>
          نکته طراحی: هرچه مقاومت بار ($R_L$) نسبت به $R_2$ بسیار بزرگ‌تر باشد (حداقل ۱۰ تا ۱۰۰ برابر)، افت ولتاژ کمتر بوده و رگولاسیون مدار پایدارتر خواهد بود.
        </span>
      </div>
    </div>
  );
}
