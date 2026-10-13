import { ResistorItem, RESISTOR_UNITS, ParallelCalculationResult, ResistorUnit } from '@/types/resistor';

const UNIT_MAP: Record<ResistorUnit, number> = {
  Ohm: 1,
  kOhm: 1e3,
  MOhm: 1e6,
};

// V8 Performance: Cache Intl.NumberFormat instances to prevent repetitive C++/JS bridge allocations
const FORMATTER_CACHE = new Map<number, Intl.NumberFormat>();

function getNumberFormatter(maxDecimals: number): Intl.NumberFormat {
  let fmt = FORMATTER_CACHE.get(maxDecimals);
  if (!fmt) {
    fmt = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals,
      useGrouping: true,
    });
    FORMATTER_CACHE.set(maxDecimals, fmt);
  }
  return fmt;
}

/**
 * Format a number to a clean engineering or decimal string without scientific notation artifacts.
 * Optimized for V8 fast path with integer bypass and cached Intl formatters.
 */
export function formatPrecision(num: number, maxDecimals: number = 2): string {
  if (isNaN(num) || !isFinite(num)) return '0';
  if (num === 0) return '0';
  if (Number.isInteger(num)) return num.toString();
  const effectiveDecimals = Math.min(maxDecimals, 2);
  return getNumberFormatter(effectiveDecimals).format(num);
}

/**
 * Calculates the equivalent parallel resistance of a set of resistor items.
 */
export function calculateParallelResistance(
  items: ResistorItem[]
): ParallelCalculationResult {
  let totalConductance = 0;
  let totalCount = 0;
  let validGroupCount = 0;
  let hasShortCircuit = false;

  for (const item of items) {
    const rawVal = item.value;
    if (rawVal.length === 0) continue;

    const numVal = parseFloat(rawVal);
    if (isNaN(numVal) || numVal < 0) continue;

    const count = item.count > 1 ? (item.count | 0) : 1;
    totalCount += count;
    validGroupCount++;

    const multiplier = UNIT_MAP[item.unit] ?? 1;
    const resistanceOhms = numVal * multiplier;

    if (resistanceOhms === 0) {
      hasShortCircuit = true;
      break;
    }

    const itemConductance = (1 / resistanceOhms) * count;
    totalConductance += itemConductance;
  }

  if (validGroupCount === 0) {
    return {
      isValid: false,
      totalResistanceOhms: null,
      displayValue: '—',
      displayUnit: 'Ω',
      exactOhmsString: '—',
      conductanceSiemens: null,
      totalResistorsCount: 0,
      uniqueValuesCount: 0,
      isShortCircuit: false,
      errorMessage: null,
    };
  }

  if (hasShortCircuit) {
    return {
      isValid: true,
      totalResistanceOhms: 0,
      displayValue: '0',
      displayUnit: 'Ω',
      exactOhmsString: '0.0000 Ω',
      conductanceSiemens: Infinity,
      totalResistorsCount: totalCount,
      uniqueValuesCount: validGroupCount,
      isShortCircuit: true,
      errorMessage: 'اتصال کوتاه (Short Circuit): یکی از مقاومت‌ها ۰ اهم است.',
    };
  }

  if (totalConductance <= 0) {
    return {
      isValid: false,
      totalResistanceOhms: null,
      displayValue: '—',
      displayUnit: 'Ω',
      exactOhmsString: '—',
      conductanceSiemens: 0,
      totalResistorsCount: totalCount,
      uniqueValuesCount: validGroupCount,
      isShortCircuit: false,
      errorMessage: 'مقادیر وارد شده نامعتبر هستند.',
    };
  }

  const reqOhms = 1 / totalConductance;

  // Auto-scale display unit
  let displayValue = '';
  let displayUnit = 'Ω';

  if (reqOhms >= 1e6) {
    const mVal = reqOhms / 1e6;
    displayValue = formatPrecision(mVal, 2);
    displayUnit = 'MΩ';
  } else if (reqOhms >= 1e3) {
    const kVal = reqOhms / 1e3;
    displayValue = formatPrecision(kVal, 2);
    displayUnit = 'kΩ';
  } else {
    displayValue = formatPrecision(reqOhms, 2);
    displayUnit = 'Ω';
  }

  const exactOhmsString = `${formatPrecision(reqOhms, 2)} Ω`;

  return {
    isValid: true,
    totalResistanceOhms: reqOhms,
    displayValue,
    displayUnit,
    exactOhmsString,
    conductanceSiemens: totalConductance,
    totalResistorsCount: totalCount,
    uniqueValuesCount: validGroupCount,
    isShortCircuit: false,
    errorMessage: null,
  };
}

export interface ResistorColorBand {
  color: string;
  name: string;
  nameFa: string;
  textColor?: string;
}

const DIGIT_COLORS: ResistorColorBand[] = [
  { color: '#18181b', name: 'Black', nameFa: 'سیاه', textColor: '#ffffff' },
  { color: '#92400e', name: 'Brown', nameFa: 'قهوه‌ای', textColor: '#ffffff' },
  { color: '#dc2626', name: 'Red', nameFa: 'قرمز', textColor: '#ffffff' },
  { color: '#ea580c', name: 'Orange', nameFa: 'نارنجی', textColor: '#ffffff' },
  { color: '#eab308', name: 'Yellow', nameFa: 'زرد', textColor: '#18181b' },
  { color: '#16a34a', name: 'Green', nameFa: 'سبز', textColor: '#ffffff' },
  { color: '#2563eb', name: 'Blue', nameFa: 'آبی', textColor: '#ffffff' },
  { color: '#9333ea', name: 'Violet', nameFa: 'بنفش', textColor: '#ffffff' },
  { color: '#64748b', name: 'Gray', nameFa: 'خاکستری', textColor: '#ffffff' },
  { color: '#f8fafc', name: 'White', nameFa: 'سفید', textColor: '#18181b' },
];

const GOLD_BAND: ResistorColorBand = { color: '#d97706', name: 'Gold', nameFa: 'طلایی (۵٪)', textColor: '#ffffff' };
const SILVER_BAND: ResistorColorBand = { color: '#94a3b8', name: 'Silver', nameFa: 'نقره‌ای (۱۰٪)', textColor: '#18181b' };

// Bounded memoization cache for resistor color bands (keyed by value_unit)
const COLOR_BAND_CACHE = new Map<string, ResistorColorBand[] | null>();
const MAX_COLOR_CACHE_SIZE = 64;

/**
 * Calculates the standard 4-band EIA color code for a resistor.
 * Optimized for V8 fast path with zero string allocations, pure numeric logarithms,
 * and bounded memoization to reuse arrays across identical resistor inputs.
 */
export function getResistorColorBands(item: ResistorItem): ResistorColorBand[] | null {
  const raw = item.value;
  if (raw.length === 0) return null;

  const cacheKey = `${raw}_${item.unit}`;
  const cached = COLOR_BAND_CACHE.get(cacheKey);
  if (cached !== undefined) return cached;

  const num = parseFloat(raw);
  if (isNaN(num) || num <= 0) {
    if (COLOR_BAND_CACHE.size >= MAX_COLOR_CACHE_SIZE) {
      COLOR_BAND_CACHE.delete(COLOR_BAND_CACHE.keys().next().value!);
    }
    COLOR_BAND_CACHE.set(cacheKey, null);
    return null;
  }

  const multiplier = UNIT_MAP[item.unit] ?? 1;
  const ohms = num * multiplier;
  if (!isFinite(ohms) || ohms < 0.1 || ohms > 99e6) {
    if (COLOR_BAND_CACHE.size >= MAX_COLOR_CACHE_SIZE) {
      COLOR_BAND_CACHE.delete(COLOR_BAND_CACHE.keys().next().value!);
    }
    COLOR_BAND_CACHE.set(cacheKey, null);
    return null;
  }

  // Pure numeric computation of significant digits & exponent (no string allocations)
  let expVal = Math.floor(Math.log10(ohms));
  let normalized = ohms / Math.pow(10, expVal);
  // Round to nearest tenth to eliminate floating point imprecision
  normalized = Math.round(normalized * 10) / 10;
  if (normalized >= 10) {
    normalized /= 10;
    expVal += 1;
  }
  const d1 = Math.floor(normalized);
  const d2 = Math.round((normalized - d1) * 10);

  if (d1 < 1 || d1 > 9 || d2 < 0 || d2 > 9) {
    if (COLOR_BAND_CACHE.size >= MAX_COLOR_CACHE_SIZE) {
      COLOR_BAND_CACHE.delete(COLOR_BAND_CACHE.keys().next().value!);
    }
    COLOR_BAND_CACHE.set(cacheKey, null);
    return null;
  }

  // Multiplier power is expVal - 1
  const multPower = expVal - 1;

  let multBand: ResistorColorBand | null = null;
  if (multPower === -1) {
    multBand = GOLD_BAND;
  } else if (multPower === -2) {
    multBand = SILVER_BAND;
  } else if (multPower >= 0 && multPower <= 9) {
    multBand = DIGIT_COLORS[multPower];
  } else {
    if (COLOR_BAND_CACHE.size >= MAX_COLOR_CACHE_SIZE) {
      COLOR_BAND_CACHE.delete(COLOR_BAND_CACHE.keys().next().value!);
    }
    COLOR_BAND_CACHE.set(cacheKey, null);
    return null;
  }

  const bands: ResistorColorBand[] = [
    DIGIT_COLORS[d1],
    DIGIT_COLORS[d2],
    multBand,
    GOLD_BAND, // Standard 5% tolerance band
  ];

  if (COLOR_BAND_CACHE.size >= MAX_COLOR_CACHE_SIZE) {
    COLOR_BAND_CACHE.delete(COLOR_BAND_CACHE.keys().next().value!);
  }
  COLOR_BAND_CACHE.set(cacheKey, bands);
  return bands;
}

/**
 * Calculates individual branch equivalent resistance when count > 1
 */
export function getBranchResistance(item: ResistorItem): {
  displayValue: string;
  displayUnit: string;
  rawOhms: number;
} | null {
  const raw = item.value;
  if (raw.length === 0) return null;
  const num = parseFloat(raw);
  if (isNaN(num) || num < 0) return null;

  const count = item.count > 1 ? (item.count | 0) : 1;
  const multiplier = UNIT_MAP[item.unit] ?? 1;
  const branchOhms = (num * multiplier) / count;

  if (branchOhms === 0) {
    return { rawOhms: 0, displayValue: '0', displayUnit: 'Ω' };
  }

  let displayValue = '';
  let displayUnit = 'Ω';

  if (branchOhms >= 1e6) {
    displayValue = formatPrecision(branchOhms / 1e6, 3);
    displayUnit = 'MΩ';
  } else if (branchOhms >= 1e3) {
    displayValue = formatPrecision(branchOhms / 1e3, 3);
    displayUnit = 'kΩ';
  } else if (branchOhms >= 1) {
    displayValue = formatPrecision(branchOhms, 3);
    displayUnit = 'Ω';
  } else {
    displayValue = formatPrecision(branchOhms * 1e3, 3);
    displayUnit = 'mΩ';
  }

  return { displayValue, displayUnit, rawOhms: branchOhms };
}

