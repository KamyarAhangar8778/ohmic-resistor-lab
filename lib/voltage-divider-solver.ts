import { ResistorUnit } from '@/types/resistor';
import { formatPrecision } from './resistor-calc';

export { findBestE24Pairs } from './voltage-divider-pair-finder';

/**
 * Standard EIA E24 series base multipliers (5% tolerance standard commercial resistors)
 */
export const E24_BASE_VALUES = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
];

/**
 * Standard EIA E96 series base multipliers (1% precision commercial resistors)
 */
export const E96_BASE_VALUES = [
  1.00, 1.02, 1.05, 1.07, 1.10, 1.13, 1.15, 1.18, 1.21, 1.24, 1.27, 1.30,
  1.33, 1.37, 1.40, 1.43, 1.47, 1.50, 1.54, 1.58, 1.62, 1.65, 1.69, 1.74,
  1.78, 1.82, 1.87, 1.91, 1.96, 2.00, 2.05, 2.10, 2.15, 2.21, 2.26, 2.32,
  2.37, 2.43, 2.49, 2.55, 2.61, 2.67, 2.74, 2.80, 2.87, 2.94, 3.01, 3.09,
  3.16, 3.24, 3.32, 3.40, 3.48, 3.57, 3.65, 3.74, 3.83, 3.92, 4.02, 4.12,
  4.22, 4.32, 4.42, 4.53, 4.64, 4.75, 4.87, 4.99, 5.11, 5.23, 5.36, 5.49,
  5.62, 5.76, 5.90, 6.04, 6.19, 6.34, 6.49, 6.65, 6.81, 6.98, 7.15, 7.32,
  7.50, 7.68, 7.87, 8.06, 8.25, 8.45, 8.66, 8.87, 9.09, 9.31, 9.53, 9.76,
];

// Generate common commercial E24 values from 100 Ω to 1 MΩ
export const COMMON_E24_OHMS: readonly number[] = (() => {
  const values: number[] = [];
  const decades = [100, 1e3, 10e3, 100e3, 1e6];
  for (const dec of decades) {
    for (const base of E24_BASE_VALUES) {
      values.push(Math.round(base * dec));
    }
  }
  return values;
})();

// Generate precision commercial E96 values from 100 Ω to 1 MΩ
export const COMMON_E96_OHMS: readonly number[] = (() => {
  const values: number[] = [];
  const decades = [100, 1e3, 10e3, 100e3, 1e6];
  for (const dec of decades) {
    for (const base of E96_BASE_VALUES) {
      values.push(Math.round(base * dec * 10) / 10);
    }
  }
  return values;
})();

/**
 * Decomposes an absolute resistance in Ohms into human-readable value + unit
 */
export function decomposeOhms(ohms: number): { value: string; unit: ResistorUnit } {
  if (ohms >= 1e6) {
    return { value: formatPrecision(ohms / 1e6, 2), unit: 'MOhm' };
  }
  if (ohms >= 1e3) {
    return { value: formatPrecision(ohms / 1e3, 2), unit: 'kOhm' };
  }
  return { value: formatPrecision(ohms, 2), unit: 'Ohm' };
}

// Pre-compute decomposed values for standard values to avoid repetitive formatting
export const OHMS_DECOMPOSED_MAP = new Map<number, { value: string; unit: ResistorUnit }>();
for (let i = 0; i < COMMON_E24_OHMS.length; i++) {
  const ohms = COMMON_E24_OHMS[i];
  OHMS_DECOMPOSED_MAP.set(ohms, decomposeOhms(ohms));
}
for (let i = 0; i < COMMON_E96_OHMS.length; i++) {
  const ohms = COMMON_E96_OHMS[i];
  if (!OHMS_DECOMPOSED_MAP.has(ohms)) {
    OHMS_DECOMPOSED_MAP.set(ohms, decomposeOhms(ohms));
  }
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

