'use client';

import * as React from 'react';
import { FilterCalculationResult, BodePoint } from '@/types/passive-filter';
import { formatFrequency } from '@/lib/passive-filter-calc';
import { cn } from '@/lib/utils';

interface FilterBodePlotProps {
  result: FilterCalculationResult;
  testFreqHz: number;
  onSelectFrequency?: (freqHz: number) => void;
}

export const FilterBodePlot = React.memo(function FilterBodePlot({
  result,
  testFreqHz,
}: FilterBodePlotProps) {
  const [activePlot, setActivePlot] = React.useState<'magnitude' | 'phase'>('magnitude');
  const [hoveredPoint, setHoveredPoint] = React.useState<BodePoint | null>(null);

  const { bodePoints, cutoffFreqHz, isValid } = result;

  // SVG viewport dimensions
  const width = 640;
  const height = 240;
  const padLeft = 52;
  const padRight = 36;
  const padTop = 26;
  const padBottom = 34;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  if (!isValid || bodePoints.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-6 text-center text-xs text-zinc-500 font-mono">
        مقادیر نامعتبر برای فیلتر — برای رسم دیاگرام بُد مقادیر معتبر وارد کنید.
      </div>
    );
  }

  // Frequency range in log10
  const minFreq = bodePoints[0].freq;
  const maxFreq = bodePoints[bodePoints.length - 1].freq;
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);

  const freqToX = (f: number) => {
    const logF = Math.log10(Math.max(f, minFreq));
    const normalized = (logF - logMin) / (logMax - logMin);
    return padLeft + normalized * plotWidth;
  };

  // Magnitude Y range: 0 dB to -40 dB
  const minDb = -40;
  const maxDb = 0;
  const dbToY = (db: number) => {
    const clamped = Math.max(minDb, Math.min(maxDb, db));
    const normalized = (clamped - minDb) / (maxDb - minDb);
    return padTop + (1 - normalized) * plotHeight;
  };

  // Phase Y range: -90 deg to +90 deg
  const minPhase = -90;
  const maxPhase = 90;
  const phaseToY = (ph: number) => {
    const clamped = Math.max(minPhase, Math.min(maxPhase, ph));
    const normalized = (clamped - minPhase) / (maxPhase - minPhase);
    return padTop + (1 - normalized) * plotHeight;
  };

  // Build SVG path strings
  const magPath = bodePoints.reduce((acc, pt, idx) => {
    const x = freqToX(pt.freq);
    const y = dbToY(pt.gainDb);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const phasePath = bodePoints.reduce((acc, pt, idx) => {
    const x = freqToX(pt.freq);
    const y = phaseToY(pt.phaseDeg);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Grid decades (integers of log10)
  const decadeTicks: { freq: number; label: string; x: number }[] = [];
  const startDecade = Math.ceil(logMin);
  const endDecade = Math.floor(logMax);
  for (let d = startDecade; d <= endDecade; d++) {
    const f = Math.pow(10, d);
    decadeTicks.push({
      freq: f,
      label: formatFrequency(f).value + formatFrequency(f).unit,
      x: freqToX(f),
    });
  }

  // Key marker coordinates
  const fcX = freqToX(cutoffFreqHz);
  const testX = freqToX(testFreqHz);
  const testY = activePlot === 'magnitude' ? dbToY(result.gainAtTestDb) : phaseToY(result.phaseAtTestDeg);
  const cutY = dbToY(-3.01);

  const isLowPass = bodePoints[0].gainDb > bodePoints[bodePoints.length - 1].gainDb;

  return (
    <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 p-4 sm:p-5 shadow-xl space-y-3">
      {/* Header and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span>دیاگرام بُد پاسخ فرکانسی (Bode Plot)</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              -20 dB/decade
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            تحلیل لاگاریتمی دامنه بر حسب دسی‌بل و تغییر فاز در گستره ۴ دهه فرکانسی
          </p>
        </div>

        {/* Magnitude vs Phase Toggle */}
        <div className="inline-flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg text-xs font-mono">
          <button
            type="button"
            onClick={() => setActivePlot('magnitude')}
            className={cn(
              'px-3 py-1 rounded-md transition-colors cursor-pointer',
              activePlot === 'magnitude'
                ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            دامنه (dB)
          </button>
          <button
            type="button"
            onClick={() => setActivePlot('phase')}
            className={cn(
              'px-3 py-1 rounded-md transition-colors cursor-pointer',
              activePlot === 'phase'
                ? 'bg-zinc-800 text-cyan-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            فاز (Phase °)
          </button>
        </div>
      </div>

      {/* Vector SVG Canvas */}
      <div className="overflow-x-auto" dir="ltr">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px] select-none block"
          style={{ direction: 'ltr' }}
        >
          {/* Background Grid */}
          <rect x={padLeft} y={padTop} width={plotWidth} height={plotHeight} fill="#09090b" stroke="#27272a" strokeWidth="1" />

          {/* Horizontal dB or Phase Grid lines */}
          {activePlot === 'magnitude' ? (
            [-10, -20, -30, -40].map((db) => {
              const y = dbToY(db);
              return (
                <g key={db}>
                  <line x1={padLeft} y1={y} x2={padLeft + plotWidth} y2={y} stroke="#18181b" strokeWidth="1" strokeDasharray="2 4" />
                  <text x={padLeft - 8} y={y + 3.5} fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="end">
                    {db} dB
                  </text>
                </g>
              );
            })
          ) : (
            [-90, -45, 0, 45, 90].map((ph) => {
              const y = phaseToY(ph);
              return (
                <g key={ph}>
                  <line x1={padLeft} y1={y} x2={padLeft + plotWidth} y2={y} stroke="#18181b" strokeWidth="1" strokeDasharray="2 4" />
                  <text x={padLeft - 8} y={y + 3.5} fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="end">
                    {ph > 0 ? `+${ph}` : ph}°
                  </text>
                </g>
              );
            })
          )}

          {/* Vertical Frequency Decade Grid Lines */}
          {decadeTicks.map((tick) => (
            <g key={tick.freq}>
              <line x1={tick.x} y1={padTop} x2={tick.x} y2={padTop + plotHeight} stroke="#18181b" strokeWidth="1" strokeDasharray="2 4" />
              <text x={tick.x} y={padTop + plotHeight + 16} fill="#71717a" fontSize="10" fontFamily="monospace" textAnchor="middle">
                {tick.label}
              </text>
            </g>
          ))}

          {/* -3dB Cutoff Threshold Line (Magnitude Mode) */}
          {activePlot === 'magnitude' && (
            <g>
              <line
                x1={padLeft}
                y1={cutY}
                x2={padLeft + plotWidth}
                y2={cutY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.75"
              />
              <text x={padLeft + plotWidth - 4} y={cutY - 5} fill="#fbbf24" fontSize="9.5" fontFamily="monospace" textAnchor="end">
                -3.0 dB Cutoff Level
              </text>
            </g>
          )}

          {/* Cutoff Frequency Vertical Line (fc) */}
          <line
            x1={fcX}
            y1={padTop}
            x2={fcX}
            y2={padTop + plotHeight}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <circle cx={fcX} cy={activePlot === 'magnitude' ? cutY : phaseToY(isLowPass ? -45 : 45)} r="4" fill="#f59e0b" />
          <text x={fcX + 6} y={padTop + 14} fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold">
            fc: {result.displayFc} {result.displayFcUnit}
          </text>

          {/* Main Response Curve */}
          <path
            d={activePlot === 'magnitude' ? magPath : phasePath}
            fill="none"
            stroke={activePlot === 'magnitude' ? '#10b981' : '#22d3ee'}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Operating Test Frequency Line & Marker (fin) */}
          <line
            x1={testX}
            y1={padTop}
            x2={testX}
            y2={padTop + plotHeight}
            stroke="#06b6d4"
            strokeWidth="2"
          />
          <circle cx={testX} cy={testY} r="5.5" fill="#06b6d4" stroke="#0e0e11" strokeWidth="2" />
          <text x={testX + 6} y={testY - 8} fill="#22d3ee" fontSize="10.5" fontFamily="monospace" fontWeight="bold">
            {formatFrequency(testFreqHz).value} {formatFrequency(testFreqHz).unit} ({result.gainAtTestDb} dB)
          </text>

          {/* Hover interactive invisible hit bars across points */}
          {bodePoints.map((pt) => {
            const px = freqToX(pt.freq);
            return (
              <rect
                key={pt.freq}
                x={px - 4}
                y={padTop}
                width={8}
                height={plotHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* Real-time Cursor Readout Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 font-mono bg-zinc-950/80 px-3 py-2 rounded-lg border border-zinc-800/80">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
            <span>فرکانس قطع (fc): <strong className="text-zinc-100">{result.displayFc} {result.displayFcUnit}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
            <span>فرکانس تست (fin): <strong className="text-zinc-100">{formatFrequency(testFreqHz).value} {formatFrequency(testFreqHz).unit}</strong></span>
          </span>
        </div>
        {hoveredPoint ? (
          <div className="text-emerald-400">
            هاور: {formatFrequency(hoveredPoint.freq).value} {formatFrequency(hoveredPoint.freq).unit} | {hoveredPoint.gainDb} dB | {hoveredPoint.phaseDeg}°
          </div>
        ) : (
          <div className="text-zinc-500">
            تضعیف در تست: <strong className="text-zinc-200">{result.attenuationPct}%</strong> (افت {Math.abs(result.gainAtTestDb)} dB)
          </div>
        )}
      </div>
    </div>
  );
});
