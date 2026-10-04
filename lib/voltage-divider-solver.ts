import { ResistorUnit } from '@/types/resistor';
import {
  StandardResistorPair,
  PairSortCriterion,
  DividerApplicationMode,
} from '@/types/voltage-divider';
import { formatPrecision } from './resistor-calc';
import { formatCurrent, formatPower, formatResistance } from './voltage-divider-calc';

/**
 * Standard EIA E24 series base multipliers (5% tolerance standard commercial resistors)
 */
export const E24_BASE_VALUES = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
];

// Generate common commercial E24 values from 100 Ω to 1 MΩ
const COMMON_E24_OHMS: readonly number[] = (() => {
  const values: number[] = [];
  const decades = [100, 1e3, 10e3, 100e3, 1e6];
  for (const dec of decades) {
    for (const base of E24_BASE_VALUES) {
      values.push(Math.round(base * dec));
    }
  }
  return values;
})();

/**
 * Decomposes an absolute resistance in Ohms into human-readable value + unit
 */
export function decomposeOhms(ohms: number): { value: string; unit: ResistorUnit } {
  if (ohms >= 1e6) {
    return { value: formatPrecision(ohms / 1e6, 3), unit: 'MOhm' };
  }
  if (ohms >= 1e3) {
    return { value: formatPrecision(ohms / 1e3, 3), unit: 'kOhm' };
  }
  return { value: formatPrecision(ohms, 2), unit: 'Ohm' };
}

// Pre-compute decomposed values for all standard E24 values to avoid repetitive formatting
const E24_DECOMPOSED_MAP = new Map<number, { value: string; unit: ResistorUnit }>();
for (let i = 0; i < COMMON_E24_OHMS.length; i++) {
  const ohms = COMMON_E24_OHMS[i];
  E24_DECOMPOSED_MAP.set(ohms, decomposeOhms(ohms));
}

/**
 * Solves for R1 when Vin, Vout, R2 (and optional RL) are known
 */
export function solveR1(
  vinVolts: number,
  voutVolts: number,
  r2Ohms: number,
  rlOhms?: number | null
): { r1Ohms: number | null; error?: string } {
  if (voutVolts <= 0) {
    return { r1Ohms: null, error: 'ولتاژ خروجی (Vout) باید بزرگتر از صفر باشد.' };
  }
  if (voutVolts >= vinVolts) {
    return {
      r1Ohms: null,
      error: 'در مدار پسیو، ولتاژ خروجی (Vout) باید کمتر از ولتاژ ورودی (Vin) باشد.',
    };
  }
  const r2Effective =
    rlOhms && rlOhms > 0 ? (r2Ohms * rlOhms) / (r2Ohms + rlOhms) : r2Ohms;

  if (r2Effective <= 0) {
    return { r1Ohms: null, error: 'مقاومت موثر R2 باید بزرگتر از صفر باشد.' };
  }

  const r1Ohms = r2Effective * (vinVolts / voutVolts - 1);
  return { r1Ohms };
}

/**
 * Solves for R2 when Vin, Vout, R1 (and optional RL) are known
 */
export function solveR2(
  vinVolts: number,
  voutVolts: number,
  r1Ohms: number,
  rlOhms?: number | null
): { r2Ohms: number | null; error?: string } {
  if (voutVolts <= 0) {
    return { r2Ohms: null, error: 'ولتاژ خروجی (Vout) باید بزرگتر از صفر باشد.' };
  }
  if (voutVolts >= vinVolts) {
    return {
      r2Ohms: null,
      error: 'در مدار پسیو، ولتاژ خروجی (Vout) باید کمتر از ولتاژ ورودی (Vin) باشد.',
    };
  }
  if (r1Ohms <= 0) {
    return { r2Ohms: null, error: 'مقاومت R1 باید بزرگتر از صفر باشد.' };
  }

  const r2Effective = (voutVolts * r1Ohms) / (vinVolts - voutVolts);

  if (!rlOhms || rlOhms <= 0) {
    return { r2Ohms: r2Effective };
  }

  if (rlOhms <= r2Effective) {
    return {
      r2Ohms: null,
      error: 'مقاومت بار (RL) کمتر از مقاومت معادل خروجی است و دستیابی به این ولتاژ ناممکن است.',
    };
  }

  const r2Ohms = (r2Effective * rlOhms) / (rlOhms - r2Effective);
  return { r2Ohms };
}

/**
 * Solves for Vin when Vout, R1, R2 (and optional RL) are known
 */
export function solveVin(
  voutVolts: number,
  r1Ohms: number,
  r2Ohms: number,
  rlOhms?: number | null
): { vinVolts: number | null; error?: string } {
  if (voutVolts <= 0) {
    return { vinVolts: null, error: 'ولتاژ خروجی (Vout) باید بزرگتر از صفر باشد.' };
  }
  const r2Effective =
    rlOhms && rlOhms > 0 ? (r2Ohms * rlOhms) / (r2Ohms + rlOhms) : r2Ohms;

  if (r2Effective <= 0) {
    return { vinVolts: null, error: 'مقاومت R2 یا معادل آن باید مثبت باشد.' };
  }

  const vinVolts = voutVolts * ((r1Ohms + r2Effective) / r2Effective);
  return { vinVolts };
}

interface RawCandidate {
  r1: number;
  r2: number;
  actualVout: number;
  errorPct: number;
  worstCaseVoutMin: number;
  worstCaseVoutMax: number;
  worstCaseErrorPct: number;
  divisionRatio: number;
  current: number;
  power: number;
  powerR1: number;
  powerR2: number;
  thevenin: number;
  stiffnessRatio?: number;
  stiffnessStatus: 'excellent' | 'good' | 'poor' | 'unloaded';
  adcSuitability: 'direct' | 'buffered' | 'high_impedance';
  adcSuitabilityLabel: string;
  biasStability: 'stiff' | 'moderate' | 'soft';
  biasStabilityLabel: string;
  domainCategory: 'low_power' | 'general' | 'high_drive';
  domainCategoryLabel: string;
  score: number;
}

// Bounded memoization cache for E24 pair suggestions per criterion and appMode
const PAIR_CACHE = new Map<string, StandardResistorPair[]>();
const MAX_PAIR_CACHE = 64;

/**
 * Finds top optimal commercial E24 resistor pairs tailored to real-world electronics applications:
 * 1. Signal / ADC Voltage Sampling
 * 2. Transistor Voltage-Divider Biasing (BJT / MOSFET)
 * 3. Precision Reference Voltage Generation
 */
export function findBestE24Pairs(
  vinVolts: number,
  targetVoutVolts: number,
  criterion: PairSortCriterion = 'overall',
  maxResults = 20,
  rlOhms?: number | null,
  appMode: DividerApplicationMode = 'sampling'
): StandardResistorPair[] {
  if (vinVolts <= 0 || targetVoutVolts <= 0 || targetVoutVolts >= vinVolts) {
    return [];
  }

  const hasLoad = typeof rlOhms === 'number' && rlOhms > 0;
  const cacheKey = `${vinVolts}_${targetVoutVolts}_${criterion}_${maxResults}_${rlOhms ?? 0}_${appMode}`;
  const cached = PAIR_CACHE.get(cacheKey);
  if (cached !== undefined) return cached;

  const len = COMMON_E24_OHMS.length;
  const candidates: RawCandidate[] = [];

  for (let i = 0; i < len; i++) {
    const r1 = COMMON_E24_OHMS[i];
    for (let j = 0; j < len; j++) {
      const r2 = COMMON_E24_OHMS[j];

      let actualVout: number;
      let current: number;
      let thevenin: number;
      let powerR1: number;
      let powerR2: number;
      let power: number;
      let stiffnessRatio: number | undefined;
      let stiffnessStatus: 'excellent' | 'good' | 'poor' | 'unloaded' = 'unloaded';

      // Worst-case calculations (E24 5% tolerance drift)
      let wcVoutMin: number;
      let wcVoutMax: number;

      if (hasLoad && rlOhms) {
        const r2Eff = (r2 * rlOhms) / (r2 + rlOhms);
        const sum = r1 + r2Eff;
        if (sum <= 0) continue;
        current = vinVolts / sum;
        actualVout = vinVolts * (r2Eff / sum);
        const vR1 = vinVolts - actualVout;
        powerR1 = (vR1 * vR1) / r1;
        powerR2 = (actualVout * actualVout) / r2;
        power = powerR1 + powerR2;
        thevenin = (r1 * r2) / (r1 + r2);

        // Circuit Stiffness: ratio of Load resistance to Thevenin output impedance
        stiffnessRatio = rlOhms / (thevenin > 0 ? thevenin : 1);
        if (stiffnessRatio >= 50) {
          stiffnessStatus = 'excellent';
        } else if (stiffnessRatio >= 10) {
          stiffnessStatus = 'good';
        } else {
          stiffnessStatus = 'poor';
        }

        // Worst-case (R1 +5%, R2 -5% for min; R1 -5%, R2 +5% for max)
        const r1Max = r1 * 1.05;
        const r1Min = r1 * 0.95;
        const r2Min = r2 * 0.95;
        const r2Max = r2 * 1.05;
        const r2EffMin = (r2Min * rlOhms) / (r2Min + rlOhms);
        const r2EffMax = (r2Max * rlOhms) / (r2Max + rlOhms);
        wcVoutMin = vinVolts * (r2EffMin / (r1Max + r2EffMin));
        wcVoutMax = vinVolts * (r2EffMax / (r1Min + r2EffMax));
      } else {
        const sum = r1 + r2;
        current = vinVolts / sum;
        actualVout = vinVolts * (r2 / sum);
        const vR1 = vinVolts - actualVout;
        powerR1 = (vR1 * vR1) / r1;
        powerR2 = (actualVout * actualVout) / r2;
        power = powerR1 + powerR2;
        thevenin = (r1 * r2) / sum;

        // Worst-case without load
        const r1Max = r1 * 1.05;
        const r1Min = r1 * 0.95;
        const r2Min = r2 * 0.95;
        const r2Max = r2 * 1.05;
        wcVoutMin = vinVolts * (r2Min / (r1Max + r2Min));
        wcVoutMax = vinVolts * (r2Max / (r1Min + r2Max));
      }

      // Filter practical range: 1 µA to 100 mA
      if (current < 1e-6 || current > 100e-3) continue;

      const errorPct = Math.abs((actualVout - targetVoutVolts) / targetVoutVolts) * 100;
      if (errorPct > 8.0) continue;

      const wcErrMin = Math.abs((wcVoutMin - targetVoutVolts) / targetVoutVolts) * 100;
      const wcErrMax = Math.abs((wcVoutMax - targetVoutVolts) / targetVoutVolts) * 100;
      const worstCaseErrorPct = Math.max(wcErrMin, wcErrMax);
      const divisionRatio = actualVout / vinVolts;

      // 1. ADC Suitability Analysis (Based on MCU ADC input impedance standards: STM32 <= 10k, AVR <= 10k)
      let adcSuitability: 'direct' | 'buffered' | 'high_impedance';
      let adcSuitabilityLabel: string;
      if (thevenin <= 10e3) {
        adcSuitability = 'direct';
        adcSuitabilityLabel = 'سازگار مستقیم (بدون بافر)';
      } else if (thevenin <= 50e3) {
        adcSuitability = 'buffered';
        adcSuitabilityLabel = 'نیاز به خازن نویزگیر / فرکانس کم';
      } else {
        adcSuitability = 'high_impedance';
        adcSuitabilityLabel = 'امپدانس بالا (نیازمند بافر Op-Amp)';
      }

      // 2. Transistor Biasing Stability Analysis (Stiff vs Soft)
      let biasStability: 'stiff' | 'moderate' | 'soft';
      let biasStabilityLabel: string;
      if (thevenin <= 20e3 && current >= 0.8e-3) {
        biasStability = 'stiff';
        biasStabilityLabel = 'بایاس سفت و پایدار (Stiff)';
      } else if (thevenin <= 80e3 && current >= 0.15e-3) {
        biasStability = 'moderate';
        biasStabilityLabel = 'بایاس متوسط (Moderate)';
      } else {
        biasStability = 'soft';
        biasStabilityLabel = 'بایاس حساس به تغییرات بتا (Soft)';
      }

      // Domain categorization
      let domainCategory: 'low_power' | 'general' | 'high_drive';
      let domainCategoryLabel: string;
      if (current < 100e-6) {
        domainCategory = 'low_power';
        domainCategoryLabel = 'کم‌مصرف (سنسور/باتری)';
      } else if (current <= 2.5e-3) {
        domainCategory = 'general';
        domainCategoryLabel = 'عمومی (سیگنال/ADC)';
      } else {
        domainCategory = 'high_drive';
        domainCategoryLabel = 'درایو قوی (بایاس)';
      }

      // Tailored Multi-objective Composite Score based on Application Mode:
      const normalizedPower = power * 1e3; // mW
      let stiffnessPenalty = 0;
      if (hasLoad && stiffnessRatio !== undefined && stiffnessRatio < 10) {
        stiffnessPenalty = ((10 - stiffnessRatio) / 10) * 3.0;
      }

      let score = 0;
      if (appMode === 'sampling') {
        // Sampling Mode: prioritizes low Rth (ADC impedance <= 10k), ratio precision, low signal loading
        const rthPenalty = thevenin > 10e3 ? Math.log10(thevenin / 10e3) * 2.0 : 0;
        score =
          errorPct * 3.5 +
          worstCaseErrorPct * 1.5 +
          rthPenalty +
          normalizedPower * 0.04 +
          stiffnessPenalty;
      } else if (appMode === 'biasing') {
        // Biasing Mode: prioritizes base voltage stability, stiff divider current (~1-2mA), power limits
        const rthPenalty = thevenin > 25e3 ? Math.log10(thevenin / 25e3) * 2.5 : 0;
        const currentDiff = Math.abs(Math.log10(current / 1.5e-3));
        score =
          errorPct * 2.5 +
          rthPenalty +
          currentDiff * 2.0 +
          normalizedPower * 0.08 +
          stiffnessPenalty;
      } else {
        // Reference Mode: prioritizes absolute voltage accuracy, minimal worst-case drift, thermal stability
        score =
          errorPct * 4.0 +
          worstCaseErrorPct * 3.0 +
          normalizedPower * 0.06 +
          stiffnessPenalty;
      }

      candidates.push({
        r1,
        r2,
        actualVout,
        errorPct,
        worstCaseVoutMin: wcVoutMin,
        worstCaseVoutMax: wcVoutMax,
        worstCaseErrorPct,
        divisionRatio,
        current,
        power,
        powerR1,
        powerR2,
        thevenin,
        stiffnessRatio,
        stiffnessStatus,
        adcSuitability,
        adcSuitabilityLabel,
        biasStability,
        biasStabilityLabel,
        domainCategory,
        domainCategoryLabel,
        score,
      });
    }
  }

  // Sort according to requested user criterion
  candidates.sort((a, b) => {
    switch (criterion) {
      case 'accuracy': {
        const errDiff = a.errorPct - b.errorPct;
        return Math.abs(errDiff) > 0.001 ? errDiff : a.score - b.score;
      }
      case 'power': {
        const pwrDiff = a.power - b.power;
        return Math.abs(pwrDiff) > 1e-6 ? pwrDiff : a.errorPct - b.errorPct;
      }
      case 'current': {
        const curA = Math.abs(a.current - 1e-3);
        const curB = Math.abs(b.current - 1e-3);
        return Math.abs(curA - curB) > 1e-5 ? curA - curB : a.errorPct - b.errorPct;
      }
      case 'thevenin': {
        const thDiff = a.thevenin - b.thevenin;
        return Math.abs(thDiff) > 1 ? thDiff : a.errorPct - b.errorPct;
      }
      case 'overall':
      default: {
        return a.score - b.score;
      }
    }
  });

  // Clustered & Decade Diversity Selection: Avoid flooding with identical ratios
  const selected: RawCandidate[] = [];
  const ratioCounts = new Map<string, number>();

  for (let c = 0; c < candidates.length; c++) {
    const cand = candidates[c];
    const ratioKey = (cand.r1 / cand.r2).toPrecision(3);
    const count = ratioCounts.get(ratioKey) ?? 0;
    // Allow at most 2 pairs of the same ratio across decades
    if (count >= 2) continue;

    ratioCounts.set(ratioKey, count + 1);
    selected.push(cand);
    if (selected.length >= maxResults) break;
  }

  // Fallback in case diversity filtered too strictly
  if (selected.length < maxResults) {
    for (let c = 0; c < candidates.length; c++) {
      const cand = candidates[c];
      if (!selected.includes(cand)) {
        selected.push(cand);
        if (selected.length >= maxResults) break;
      }
    }
  }

  const count = selected.length;
  const results: StandardResistorPair[] = new Array(count);

  for (let k = 0; k < count; k++) {
    const cand = selected[k];
    const r1Dec = E24_DECOMPOSED_MAP.get(cand.r1) ?? decomposeOhms(cand.r1);
    const r2Dec = E24_DECOMPOSED_MAP.get(cand.r2) ?? decomposeOhms(cand.r2);
    const curFmt = formatCurrent(cand.current);
    const rthFmt = formatResistance(cand.thevenin);

    let badge: string | undefined;
    if (cand.errorPct === 0) {
      badge = 'دقیق‌ترین (۰٪ خطا)';
    } else if (appMode === 'sampling' && cand.thevenin <= 10e3 && k === 0) {
      badge = 'ایده‌آل ADC (امپدانس کم)';
    } else if (appMode === 'biasing' && cand.biasStability === 'stiff' && k === 0) {
      badge = 'بایاس سفت و پایدار';
    } else if (appMode === 'reference' && cand.worstCaseErrorPct <= 5.2 && k === 0) {
      badge = 'رفرنس کم‌نوسان';
    } else if (criterion === 'power' && k === 0) {
      badge = 'کم‌مصرف‌ترین';
    } else if (criterion === 'thevenin' && k === 0) {
      badge = 'کمترین امپدانس';
    } else if (criterion === 'overall' && k === 0) {
      badge = 'بهترین تعادل کلی';
    }

    results[k] = {
      r1Value: r1Dec.value,
      r1Unit: r1Dec.unit,
      r2Value: r2Dec.value,
      r2Unit: r2Dec.unit,
      r1Ohms: cand.r1,
      r2Ohms: cand.r2,
      actualVout: cand.actualVout,
      displayVout: formatPrecision(cand.actualVout, 2),
      errorPercentage: parseFloat(cand.errorPct.toFixed(2)),
      worstCaseVoutMin: cand.worstCaseVoutMin,
      worstCaseVoutMax: cand.worstCaseVoutMax,
      worstCaseVoutMinFormatted: formatPrecision(cand.worstCaseVoutMin, 2),
      worstCaseVoutMaxFormatted: formatPrecision(cand.worstCaseVoutMax, 2),
      worstCaseErrorPct: parseFloat(cand.worstCaseErrorPct.toFixed(2)),
      divisionRatio: cand.divisionRatio,
      divisionRatioFormatted: formatPrecision(cand.divisionRatio, 2),
      currentAmperes: cand.current,
      currentFormatted: `${curFmt.value} ${curFmt.unit}`,
      powerWatts: cand.power,
      powerFormatted: formatPower(cand.power),
      powerR1Watts: cand.powerR1,
      powerR1Formatted: formatPower(cand.powerR1),
      powerR2Watts: cand.powerR2,
      powerR2Formatted: formatPower(cand.powerR2),
      theveninOhms: cand.thevenin,
      theveninFormatted: `${rthFmt.value} ${rthFmt.unit}`,
      stiffnessRatio: cand.stiffnessRatio ? parseFloat(cand.stiffnessRatio.toFixed(2)) : undefined,
      stiffnessStatus: cand.stiffnessStatus,
      adcSuitability: cand.adcSuitability,
      adcSuitabilityLabel: cand.adcSuitabilityLabel,
      biasStability: cand.biasStability,
      biasStabilityLabel: cand.biasStabilityLabel,
      domainCategory: cand.domainCategory,
      domainCategoryLabel: cand.domainCategoryLabel,
      overallScore: cand.score,
      badge,
      isLoaded: hasLoad,
    };
  }

  if (PAIR_CACHE.size >= MAX_PAIR_CACHE) {
    PAIR_CACHE.delete(PAIR_CACHE.keys().next().value!);
  }
  PAIR_CACHE.set(cacheKey, results);

  return results;
}

