import { ResistorItem, ResistorUnit } from '@/types/resistor';
import { SeriesCalculationResult, SeriesVoltageAnalysis } from '@/types/series-resistor';
import { formatPrecision } from './resistor-calc';

const UNIT_MAP: Record<ResistorUnit, number> = {
  Ohm: 1,
  kOhm: 1e3,
  MOhm: 1e6,
};

export function convertToOhms(val: number, unit: ResistorUnit): number {
  return val * (UNIT_MAP[unit] ?? 1);
}

export function formatResistanceDisplay(ohms: number) {
  let displayValue = '';
  let displayUnit = 'Ω';

  if (ohms >= 1e6) {
    displayValue = formatPrecision(ohms / 1e6, 2);
    displayUnit = 'MΩ';
  } else if (ohms >= 1e3) {
    displayValue = formatPrecision(ohms / 1e3, 2);
    displayUnit = 'kΩ';
  } else {
    displayValue = formatPrecision(ohms, 2);
    displayUnit = 'Ω';
  }

  return {
    displayValue,
    displayUnit,
    exactOhmsString: `${formatPrecision(ohms, 2)} Ω`,
  };
}

export function calculateSeriesResistance(items: ResistorItem[]): SeriesCalculationResult {
  if (!items || items.length === 0) {
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
      errorMessage: 'حداقل یک مقاومت باید در مدار وجود داشته باشد.',
    };
  }

  let totalOhms = 0;
  let totalCount = 0;
  let validItemsCount = 0;
  let hasInvalidValue = false;

  for (const item of items) {
    const rawVal = item.value.trim();
    if (!rawVal) continue;

    const numVal = parseFloat(rawVal);
    if (isNaN(numVal) || numVal < 0) {
      hasInvalidValue = true;
      continue;
    }

    const ohms = convertToOhms(numVal, item.unit);
    const count = Math.max(1, item.count);

    totalOhms += ohms * count;
    totalCount += count;
    validItemsCount++;
  }

  if (hasInvalidValue || validItemsCount === 0) {
    return {
      isValid: false,
      totalResistanceOhms: null,
      displayValue: '—',
      displayUnit: 'Ω',
      exactOhmsString: '—',
      conductanceSiemens: null,
      totalResistorsCount: totalCount,
      uniqueValuesCount: validItemsCount,
      isShortCircuit: false,
      errorMessage: 'لطفاً مقادیر معتبر و مثبت برای تمام مقاومت‌ها وارد کنید.',
    };
  }

  const { displayValue, displayUnit, exactOhmsString } = formatResistanceDisplay(totalOhms);
  const conductance = totalOhms > 0 ? 1 / totalOhms : 0;

  return {
    isValid: true,
    totalResistanceOhms: totalOhms,
    displayValue,
    displayUnit,
    exactOhmsString,
    conductanceSiemens: conductance,
    totalResistorsCount: totalCount,
    uniqueValuesCount: validItemsCount,
    isShortCircuit: totalOhms === 0,
    errorMessage: null,
  };
}

export function calculateSeriesVoltageDrops(
  items: ResistorItem[],
  totalResistanceOhms: number,
  inputVoltageVolts: number
): SeriesVoltageAnalysis {
  if (totalResistanceOhms <= 0 || inputVoltageVolts <= 0) {
    return {
      inputVoltage: inputVoltageVolts,
      inputVoltageUnit: 'V',
      totalCurrentAmps: 0,
      displayCurrent: '0',
      displayCurrentUnit: 'mA',
      totalPowerWatts: 0,
      displayPowerTotal: '0 mW',
      resistorDrops: [],
    };
  }

  const currentAmps = inputVoltageVolts / totalResistanceOhms;
  const totalPowerWatts = Math.pow(currentAmps, 2) * totalResistanceOhms;

  const resistorDrops = items.map((item, idx) => {
    const val = parseFloat(item.value) || 0;
    const ohms = convertToOhms(val, item.unit);
    const dropVolts = currentAmps * ohms;
    const powerWatts = Math.pow(currentAmps, 2) * ohms;

    let displayVoltageDrop = `${dropVolts.toFixed(2)} V`;
    if (dropVolts < 1) {
      displayVoltageDrop = `${(dropVolts * 1e3).toFixed(1)} mV`;
    }

    let displayPower = `${powerWatts.toFixed(2)} W`;
    if (powerWatts < 1e-3) {
      displayPower = `${(powerWatts * 1e6).toFixed(1)} µW`;
    } else if (powerWatts < 1) {
      displayPower = `${(powerWatts * 1e3).toFixed(1)} mW`;
    }

    return {
      id: item.id,
      tag: `R${idx + 1}`,
      voltageDropVolts: dropVolts,
      displayVoltageDrop,
      powerWatts,
      displayPower,
    };
  });

  let displayCurrent = `${(currentAmps * 1e3).toFixed(2)}`;
  let displayCurrentUnit = 'mA';
  if (currentAmps < 1e-3) {
    displayCurrent = `${(currentAmps * 1e6).toFixed(1)}`;
    displayCurrentUnit = 'µA';
  } else if (currentAmps >= 1) {
    displayCurrent = `${currentAmps.toFixed(2)}`;
    displayCurrentUnit = 'A';
  }

  let displayPowerTotal = `${totalPowerWatts.toFixed(2)} W`;
  if (totalPowerWatts < 1e-3) {
    displayPowerTotal = `${(totalPowerWatts * 1e6).toFixed(1)} µW`;
  } else if (totalPowerWatts < 1) {
    displayPowerTotal = `${(totalPowerWatts * 1e3).toFixed(1)} mW`;
  }

  return {
    inputVoltage: inputVoltageVolts,
    inputVoltageUnit: 'V',
    totalCurrentAmps: currentAmps,
    displayCurrent,
    displayCurrentUnit,
    totalPowerWatts,
    displayPowerTotal,
    resistorDrops,
  };
}
