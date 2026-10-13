import {
  FilterState,
  FilterCalculationResult,
  BodePoint,
  StandardFilterPair,
} from '@/types/passive-filter';
import { formatPrecision } from './resistor-calc';

export const RESISTANCE_MULTIPLIERS = {
  Ohm: 1,
  kOhm: 1e3,
  MOhm: 1e6,
} as const;

export const CAPACITANCE_MULTIPLIERS = {
  pF: 1e-12,
  nF: 1e-9,
  uF: 1e-6,
} as const;

export const INDUCTANCE_MULTIPLIERS = {
  uH: 1e-6,
  mH: 1e-3,
  H: 1,
} as const;

export const FREQUENCY_MULTIPLIERS = {
  Hz: 1,
  kHz: 1e3,
  MHz: 1e6,
} as const;

export function formatFrequency(hz: number): { value: string; unit: string } {
  if (isNaN(hz) || !isFinite(hz) || hz <= 0) return { value: '0', unit: 'Hz' };
  if (hz >= 1e6) return { value: formatPrecision(hz / 1e6, 2), unit: 'MHz' };
  if (hz >= 1e3) return { value: formatPrecision(hz / 1e3, 2), unit: 'kHz' };
  return { value: formatPrecision(hz, 2), unit: 'Hz' };
}

export function formatTime(seconds: number): { value: string; unit: string } {
  if (isNaN(seconds) || !isFinite(seconds) || seconds <= 0) return { value: '0', unit: 's' };
  if (seconds >= 1) return { value: formatPrecision(seconds, 2), unit: 's' };
  if (seconds >= 1e-3) return { value: formatPrecision(seconds * 1e3, 2), unit: 'ms' };
  if (seconds >= 1e-6) return { value: formatPrecision(seconds * 1e6, 2), unit: 'µs' };
  return { value: formatPrecision(seconds * 1e9, 2), unit: 'ns' };
}

/**
 * Calculates cutoff frequency, time constant, and frequency response for RC/RL passive filters.
 */
export function calculatePassiveFilter(state: FilterState): FilterCalculationResult {
  const rOhms = parseFloat(state.resistance) * (RESISTANCE_MULTIPLIERS[state.resistanceUnit] ?? 1);
  const vin = parseFloat(state.vinPeak) || 5;

  let reactiveValue = 0;
  if (state.topology === 'rc') {
    reactiveValue = parseFloat(state.capacitance) * (CAPACITANCE_MULTIPLIERS[state.capacitanceUnit] ?? 1e-9);
  } else {
    reactiveValue = parseFloat(state.inductance) * (INDUCTANCE_MULTIPLIERS[state.inductanceUnit] ?? 1e-3);
  }

  const testFreq = parseFloat(state.testFrequency) * (FREQUENCY_MULTIPLIERS[state.testFrequencyUnit] ?? 1e3);

  const emptyResult: FilterCalculationResult = {
    isValid: false,
    cutoffFreqHz: 0,
    displayFc: '—',
    displayFcUnit: 'Hz',
    timeConstantSec: 0,
    displayTau: '—',
    displayTauUnit: 's',
    testFreqHz: testFreq || 1000,
    gainAtTestDb: 0,
    gainAtTestLinear: 0,
    phaseAtTestDeg: 0,
    voutPeak: 0,
    attenuationPct: 0,
    reactanceAtCutoffOhms: 0,
    bodePoints: [],
  };

  if (isNaN(rOhms) || rOhms <= 0 || isNaN(reactiveValue) || reactiveValue <= 0) {
    return { ...emptyResult, errorMsg: 'لطفاً مقادیر مثبت و معتبری برای مقاومت و خازن/سلف وارد کنید.' };
  }

  let fc = 0;
  let tau = 0;

  if (state.topology === 'rc') {
    tau = rOhms * reactiveValue;
    fc = 1 / (2 * Math.PI * tau);
  } else {
    tau = reactiveValue / rOhms;
    fc = rOhms / (2 * Math.PI * reactiveValue);
  }

  const isLowPass = state.type === 'lowpass';
  const ratio = testFreq > 0 && fc > 0 ? testFreq / fc : 1;

  let gainLinear = 0;
  let phaseDeg = 0;

  if (isLowPass) {
    gainLinear = 1 / Math.sqrt(1 + ratio * ratio);
    phaseDeg = -Math.atan(ratio) * (180 / Math.PI);
  } else {
    gainLinear = ratio / Math.sqrt(1 + ratio * ratio);
    phaseDeg = 90 - Math.atan(ratio) * (180 / Math.PI);
  }

  const gainDb = 20 * Math.log10(Math.max(gainLinear, 1e-5));
  const voutPeak = vin * gainLinear;
  const attenuationPct = (1 - gainLinear) * 100;

  // Generate 70 logarithmically distributed Bode points across 4 decades (0.01 fc to 100 fc)
  const bodePoints: BodePoint[] = [];
  const minFreq = fc * 0.01;
  const maxFreq = fc * 100;
  const steps = 70;
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);
  const logStep = (logMax - logMin) / (steps - 1);

  for (let i = 0; i < steps; i++) {
    const f = Math.pow(10, logMin + i * logStep);
    const r = f / fc;
    let gLin = 0;
    let ph = 0;

    if (isLowPass) {
      gLin = 1 / Math.sqrt(1 + r * r);
      ph = -Math.atan(r) * (180 / Math.PI);
    } else {
      gLin = r / Math.sqrt(1 + r * r);
      ph = 90 - Math.atan(r) * (180 / Math.PI);
    }

    const gDb = 20 * Math.log10(Math.max(gLin, 1e-5));
    bodePoints.push({
      freq: f,
      gainDb: parseFloat(gDb.toFixed(2)),
      gainLinear: parseFloat(gLin.toFixed(4)),
      phaseDeg: parseFloat(ph.toFixed(1)),
    });
  }

  const fcFmt = formatFrequency(fc);
  const tauFmt = formatTime(tau);

  return {
    isValid: true,
    cutoffFreqHz: fc,
    displayFc: fcFmt.value,
    displayFcUnit: fcFmt.unit,
    timeConstantSec: tau,
    displayTau: tauFmt.value,
    displayTauUnit: tauFmt.unit,
    testFreqHz: testFreq,
    gainAtTestDb: parseFloat(gainDb.toFixed(2)),
    gainAtTestLinear: parseFloat(gainLinear.toFixed(4)),
    phaseAtTestDeg: parseFloat(phaseDeg.toFixed(1)),
    voutPeak: parseFloat(voutPeak.toFixed(2)),
    attenuationPct: parseFloat(attenuationPct.toFixed(1)),
    reactanceAtCutoffOhms: rOhms, // At fc, Xc = R or Xl = R!
    bodePoints,
  };
}

// Commercial standard E12 values (capacitors/inductors)
const E12_MULTIPLIERS = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
// Commercial standard E24 values (resistors)
const E24_MULTIPLIERS = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
];

/**
 * Finds optimal commercial E24/E12 component pairs closest to a target cutoff frequency.
 */
export function findStandardFilterPairs(
  targetFcHz: number,
  topology: 'rc' | 'rl' = 'rc',
  maxResults = 5
): StandardFilterPair[] {
  if (targetFcHz <= 0) return [];

  const candidateResistors: number[] = [];
  for (const dec of [1e2, 1e3, 1e4, 1e5]) {
    for (const b of E24_MULTIPLIERS) candidateResistors.push(Math.round(b * dec));
  }

  const results: StandardFilterPair[] = [];

  if (topology === 'rc') {
    // Capacitors in pF, nF, uF range
    const candidateCaps: { val: number; display: string; unit: string }[] = [];
    for (const dec of [1e-11, 1e-10, 1e-9, 1e-8, 1e-7, 1e-6]) {
      for (const b of E12_MULTIPLIERS) {
        const val = b * dec;
        if (val < 1e-11 || val > 1e-5) continue;
        let display = '';
        let unit = '';
        if (val >= 1e-6) {
          display = `${Number((val * 1e6).toFixed(1))}`;
          unit = 'µF';
        } else if (val >= 1e-9) {
          display = `${Number((val * 1e9).toFixed(1))}`;
          unit = 'nF';
        } else {
          display = `${Number((val * 1e12).toFixed(0))}`;
          unit = 'pF';
        }
        candidateCaps.push({ val, display, unit });
      }
    }

    for (const cap of candidateCaps) {
      for (const r of candidateResistors) {
        const actualFc = 1 / (2 * Math.PI * r * cap.val);
        const err = Math.abs((actualFc - targetFcHz) / targetFcHz) * 100;
        if (err <= 8) {
          const rDisp = r >= 1e6 ? `${r / 1e6} MΩ` : r >= 1e3 ? `${r / 1e3} kΩ` : `${r} Ω`;
          const fcFmt = formatFrequency(actualFc);
          results.push({
            resistorOhms: r,
            resistorDisplay: rDisp,
            reactiveOhmsOrValue: cap.val,
            reactiveDisplay: cap.display,
            reactiveUnit: cap.unit,
            actualFc,
            displayActualFc: `${fcFmt.value} ${fcFmt.unit}`,
            errorPct: parseFloat(err.toFixed(1)),
          });
        }
      }
    }
  } else {
    // Inductors in uH, mH range
    const candidateInductors: { val: number; display: string; unit: string }[] = [];
    for (const dec of [1e-6, 1e-5, 1e-4, 1e-3, 1e-2]) {
      for (const b of E12_MULTIPLIERS) {
        const val = b * dec;
        let display = '';
        let unit = '';
        if (val >= 1) {
          display = `${Number(val.toFixed(2))}`;
          unit = 'H';
        } else if (val >= 1e-3) {
          display = `${Number((val * 1e3).toFixed(1))}`;
          unit = 'mH';
        } else {
          display = `${Number((val * 1e6).toFixed(0))}`;
          unit = 'µH';
        }
        candidateInductors.push({ val, display, unit });
      }
    }

    for (const ind of candidateInductors) {
      for (const r of candidateResistors) {
        const actualFc = r / (2 * Math.PI * ind.val);
        const err = Math.abs((actualFc - targetFcHz) / targetFcHz) * 100;
        if (err <= 8) {
          const rDisp = r >= 1e6 ? `${r / 1e6} MΩ` : r >= 1e3 ? `${r / 1e3} kΩ` : `${r} Ω`;
          const fcFmt = formatFrequency(actualFc);
          results.push({
            resistorOhms: r,
            resistorDisplay: rDisp,
            reactiveOhmsOrValue: ind.val,
            reactiveDisplay: ind.display,
            reactiveUnit: ind.unit,
            actualFc,
            displayActualFc: `${fcFmt.value} ${fcFmt.unit}`,
            errorPct: parseFloat(err.toFixed(1)),
          });
        }
      }
    }
  }

  results.sort((a, b) => a.errorPct - b.errorPct);
  return results.slice(0, maxResults);
}
