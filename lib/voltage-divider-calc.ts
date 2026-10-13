import { ResistorUnit } from '@/types/resistor';
import {
  VoltageDividerState,
  VoltageDividerResult,
  VoltageUnit,
  DividerPreset,
} from '@/types/voltage-divider';
import { formatPrecision } from './resistor-calc';
import {
  solveR1,
  solveR2,
  solveVin,
  findBestE24Pairs,
} from './voltage-divider-solver';

export const RESISTOR_UNIT_MAP: Record<ResistorUnit, number> = {
  Ohm: 1,
  kOhm: 1e3,
  MOhm: 1e6,
};

export const VOLTAGE_UNIT_MAP: Record<VoltageUnit, number> = {
  V: 1,
  mV: 1e-3,
  kV: 1e3,
};

export { formatCurrent, formatPower, formatResistance } from './voltage-divider-format';
import { formatCurrent, formatPower, formatResistance } from './voltage-divider-format';

/**
 * Calculates voltage divider output, quiescent currents, power dissipation,
 * and Thevenin equivalent resistance.
 */
export function calculateVoltageDivider(state: VoltageDividerState): VoltageDividerResult {
  const vinNum = parseFloat(state.vin);
  const r1Num = parseFloat(state.r1);
  const r2Num = parseFloat(state.r2);

  const emptyResult: VoltageDividerResult = {
    isValid: false,
    vinVolts: null,
    voutVolts: null,
    displayVout: '—',
    displayVoutUnit: 'V',
    ratio: null,
    ratioPercentage: '—',
    dbAttenuation: null,
    currentTotalAmperes: null,
    displayCurrent: '—',
    displayCurrentUnit: 'mA',
    currentLoadAmperes: null,
    displayCurrentLoad: '—',
    powerR1Watts: null,
    displayPowerR1: '—',
    powerR2Watts: null,
    displayPowerR2: '—',
    powerLoadWatts: null,
    displayPowerLoad: '—',
    powerTotalWatts: null,
    displayPowerTotal: '—',
    theveninResistanceOhms: null,
    displayRth: '—',
    displayRthUnit: 'Ω',
    isShortCircuit: false,
    errorMessage: null,
    solvedField: undefined,
    solvedValueFormatted: undefined,
    solvedValue: undefined,
    solvedResistorUnit: undefined,
    suggestedPairs: undefined,
  };

  const solveMode = state.solveMode || 'vout';

  let rlOhms: number | null = null;
  if (state.hasLoad) {
    const rlNum = parseFloat(state.rl);
    if (!isNaN(rlNum) && rlNum >= 0) {
      rlOhms = rlNum * (RESISTOR_UNIT_MAP[state.rlUnit] ?? 1);
    }
  }

  let vinVolts = parseFloat(state.vin) * (VOLTAGE_UNIT_MAP[state.vinUnit] ?? 1);
  let voutTargetVolts = parseFloat(state.vout || '0') * (VOLTAGE_UNIT_MAP[state.voutUnit || 'V'] ?? 1);
  let r1Ohms = parseFloat(state.r1) * (RESISTOR_UNIT_MAP[state.r1Unit] ?? 1);
  let r2Ohms = parseFloat(state.r2) * (RESISTOR_UNIT_MAP[state.r2Unit] ?? 1);

  let solvedField: 'vout' | 'r1' | 'r2' | 'vin' | 'pair' = solveMode;
  let solvedValueFormatted: string | undefined;
  let solvedValue: string | undefined;
  let solvedResistorUnit: ResistorUnit | undefined;
  let suggestedPairs: ReturnType<typeof findBestE24Pairs> | undefined;

  if (solveMode === 'r1') {
    if (isNaN(vinVolts) || isNaN(voutTargetVolts) || isNaN(r2Ohms)) {
      return emptyResult;
    }
    const sol = solveR1(vinVolts, voutTargetVolts, r2Ohms, rlOhms);
    if (sol.error || sol.r1Ohms === null) {
      return { ...emptyResult, errorMessage: sol.error || 'محاسبه R1 امکان‌پذیر نیست.' };
    }
    r1Ohms = sol.r1Ohms;
    const r1Fmt = formatResistance(r1Ohms);
    solvedValue = r1Fmt.value;
    solvedResistorUnit = r1Fmt.unit === 'kΩ' ? 'kOhm' : r1Fmt.unit === 'MΩ' ? 'MOhm' : 'Ohm';
    solvedValueFormatted = `${r1Fmt.value} ${r1Fmt.unit}`;
  } else if (solveMode === 'r2') {
    if (isNaN(vinVolts) || isNaN(voutTargetVolts) || isNaN(r1Ohms)) {
      return emptyResult;
    }
    const sol = solveR2(vinVolts, voutTargetVolts, r1Ohms, rlOhms);
    if (sol.error || sol.r2Ohms === null) {
      return { ...emptyResult, errorMessage: sol.error || 'محاسبه R2 امکان‌پذیر نیست.' };
    }
    r2Ohms = sol.r2Ohms;
    const r2Fmt = formatResistance(r2Ohms);
    solvedValue = r2Fmt.value;
    solvedResistorUnit = r2Fmt.unit === 'kΩ' ? 'kOhm' : r2Fmt.unit === 'MΩ' ? 'MOhm' : 'Ohm';
    solvedValueFormatted = `${r2Fmt.value} ${r2Fmt.unit}`;
  } else if (solveMode === 'vin') {
    if (isNaN(voutTargetVolts) || isNaN(r1Ohms) || isNaN(r2Ohms)) {
      return emptyResult;
    }
    const sol = solveVin(voutTargetVolts, r1Ohms, r2Ohms, rlOhms);
    if (sol.error || sol.vinVolts === null) {
      return { ...emptyResult, errorMessage: sol.error || 'محاسبه Vin امکان‌پذیر نیست.' };
    }
    vinVolts = sol.vinVolts;
    solvedValue = formatPrecision(vinVolts, 2);
    solvedValueFormatted = `${solvedValue} V`;
  } else if (solveMode === 'pair') {
    if (isNaN(vinVolts) || isNaN(voutTargetVolts) || vinVolts <= 0 || voutTargetVolts <= 0) {
      return emptyResult;
    }
    if (voutTargetVolts >= vinVolts) {
      return { ...emptyResult, errorMessage: 'در مدار پسیو، Vout باید کمتر از Vin باشد.' };
    }
    suggestedPairs = findBestE24Pairs(vinVolts, voutTargetVolts, 'overall', 10);
    if (suggestedPairs.length > 0) {
      const best = suggestedPairs[0];
      r1Ohms = parseFloat(best.r1Value) * (RESISTOR_UNIT_MAP[best.r1Unit] ?? 1);
      r2Ohms = parseFloat(best.r2Value) * (RESISTOR_UNIT_MAP[best.r2Unit] ?? 1);
      const r1Sym = best.r1Unit === 'kOhm' ? 'kΩ' : best.r1Unit === 'MOhm' ? 'MΩ' : 'Ω';
      const r2Sym = best.r2Unit === 'kOhm' ? 'kΩ' : best.r2Unit === 'MOhm' ? 'MΩ' : 'Ω';
      solvedValueFormatted = `R1: ${best.r1Value} ${r1Sym} | R2: ${best.r2Value} ${r2Sym}`;
    }
  } else {
    // Standard vout solve mode
    if (isNaN(vinVolts) || isNaN(r1Ohms) || isNaN(r2Ohms) || r1Ohms < 0 || r2Ohms < 0) {
      return emptyResult;
    }
  }

  let r2Equivalent = r2Ohms;
  if (state.hasLoad && rlOhms !== null) {
    if (rlOhms === 0 || r2Ohms === 0) {
      r2Equivalent = 0;
    } else {
      r2Equivalent = (r2Ohms * rlOhms) / (r2Ohms + rlOhms);
    }
  }

  const totalOhms = r1Ohms + r2Equivalent;

  // Short circuit check
  if (totalOhms === 0) {
    return {
      ...emptyResult,
      isValid: true,
      vinVolts,
      voutVolts: 0,
      displayVout: '0.00',
      displayVoutUnit: 'V',
      isShortCircuit: true,
      errorMessage: 'اتصال کوتاه (Short Circuit): مجموع مقاومت‌های مدار صفر است!',
    };
  }

  // Vout calculation
  const voutVolts = totalOhms > 0 ? vinVolts * (r2Equivalent / totalOhms) : 0;
  const ratio = totalOhms > 0 ? r2Equivalent / totalOhms : 0;
  const ratioPct = `${formatPrecision(ratio * 100, 2)}%`;

  let dbAttenuation: string | null = null;
  if (vinVolts > 0 && voutVolts > 0) {
    const db = 20 * Math.log10(voutVolts / vinVolts);
    dbAttenuation = `${formatPrecision(db, 2)} dB`;
  } else if (voutVolts === 0) {
    dbAttenuation = '-∞ dB';
  }

  // Currents
  const currentTotalAmperes = totalOhms > 0 ? vinVolts / totalOhms : 0;
  const currentFormatted = formatCurrent(currentTotalAmperes);

  let currentLoadAmperes: number | null = null;
  let displayCurrentLoad = '—';
  if (state.hasLoad && rlOhms !== null && rlOhms > 0) {
    currentLoadAmperes = voutVolts / rlOhms;
    const cLoadFmt = formatCurrent(currentLoadAmperes);
    displayCurrentLoad = `${cLoadFmt.value} ${cLoadFmt.unit}`;
  }

  // Power on each component
  const vr1 = vinVolts - voutVolts;
  const powerR1Watts = r1Ohms > 0 ? (vr1 * vr1) / r1Ohms : 0;
  const powerR2Watts = r2Ohms > 0 ? (voutVolts * voutVolts) / r2Ohms : 0;
  let powerLoadWatts: number | null = null;
  if (state.hasLoad && rlOhms !== null) {
    powerLoadWatts = rlOhms > 0 ? (voutVolts * voutVolts) / rlOhms : 0;
  }
  const powerTotalWatts = powerR1Watts + powerR2Watts + (powerLoadWatts ?? 0);

  // Thevenin equivalent resistance: Rth = R1 || R2
  const rthOhms = r1Ohms + r2Ohms > 0 ? (r1Ohms * r2Ohms) / (r1Ohms + r2Ohms) : 0;
  const rthFormatted = formatResistance(rthOhms);

  // Auto-scale Vout display
  let displayVout = formatPrecision(voutVolts, 2);
  let displayVoutUnit = 'V';
  if (Math.abs(voutVolts) >= 1000) {
    displayVout = formatPrecision(voutVolts / 1000, 2);
    displayVoutUnit = 'kV';
  } else if (Math.abs(voutVolts) < 0.1 && Math.abs(voutVolts) > 0) {
    displayVout = formatPrecision(voutVolts * 1000, 2);
    displayVoutUnit = 'mV';
  }

  // Load sag and unloaded Vout calculations
  const sumUnloaded = r1Ohms + r2Ohms;
  const voutNoLoad = sumUnloaded > 0 ? vinVolts * (r2Ohms / sumUnloaded) : 0;
  const loadSag = state.hasLoad && rlOhms !== null ? Math.max(0, voutNoLoad - voutVolts) : 0;
  const loadSagPct = state.hasLoad && rlOhms !== null && voutNoLoad > 0
    ? `${formatPrecision((loadSag / voutNoLoad) * 100, 1)}%`
    : '۰٪';
  const r2EffectiveFmt = formatResistance(r2Equivalent);

  return {
    isValid: true,
    vinVolts,
    voutVolts,
    displayVout,
    displayVoutUnit,
    ratio,
    ratioPercentage: ratioPct,
    dbAttenuation,
    currentTotalAmperes,
    displayCurrent: currentFormatted.value,
    displayCurrentUnit: currentFormatted.unit,
    currentLoadAmperes,
    displayCurrentLoad,
    powerR1Watts,
    displayPowerR1: formatPower(powerR1Watts),
    powerR2Watts,
    displayPowerR2: formatPower(powerR2Watts),
    powerLoadWatts,
    displayPowerLoad: powerLoadWatts !== null ? formatPower(powerLoadWatts) : '—',
    powerTotalWatts,
    displayPowerTotal: formatPower(powerTotalWatts),
    theveninResistanceOhms: rthOhms,
    displayRth: rthFormatted.value,
    displayRthUnit: rthFormatted.unit,
    isShortCircuit: false,
    errorMessage: null,
    solvedField,
    solvedValueFormatted,
    solvedValue,
    solvedResistorUnit,
    suggestedPairs,
    voutNoLoadVolts: state.hasLoad ? voutNoLoad : null,
    displayVoutNoLoad: formatPrecision(voutNoLoad, 2),
    loadSagVolts: state.hasLoad ? loadSag : null,
    displayLoadSag: formatPrecision(loadSag, 2),
    loadSagPercentage: loadSagPct,
    r2EffectiveOhms: state.hasLoad ? r2Equivalent : null,
    displayR2Effective: `${r2EffectiveFmt.value} ${r2EffectiveFmt.unit}`,
  };
}

/**
 * Common engineering presets for voltage dividers
 */
export const DIVIDER_PRESETS: DividerPreset[] = [
  {
    id: 'logic-5v-to-3v3',
    title: '5V → 3.3V',
    description: 'تطبیق سطح منطقی آردوینو به ESP32/Raspberry Pi',
    vin: '5',
    vinUnit: 'V',
    r1: '1.7',
    r1Unit: 'kOhm',
    r2: '3.3',
    r2Unit: 'kOhm',
  },
  {
    id: 'sensor-12v-to-5v',
    title: '12V → 5V',
    description: 'کاهش ولتاژ سنسور خودرویی یا صنعتی به ADC میکروکنترلر',
    vin: '12',
    vinUnit: 'V',
    r1: '14',
    r1Unit: 'kOhm',
    r2: '10',
    r2Unit: 'kOhm',
  },
  {
    id: 'half-bridge',
    title: 'تقسیم نصف (1:2)',
    description: 'پل مقاومتی متقارن ۵۰٪ جهت ایجاد ولتاژ مرجع مجازی',
    vin: '10',
    vinUnit: 'V',
    r1: '10',
    r1Unit: 'kOhm',
    r2: '10',
    r2Unit: 'kOhm',
  },
  {
    id: 'attenuator-10-to-1',
    title: 'تضعیف‌کننده 10:1',
    description: 'پروب اسیلوسکوپ و اندازه‌گیری با مقاومت ورودی ۱ مگااهم',
    vin: '10',
    vinUnit: 'V',
    r1: '9',
    r1Unit: 'MOhm',
    r2: '1',
    r2Unit: 'MOhm',
  },
];
