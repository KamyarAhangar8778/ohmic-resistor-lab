export type ResistorUnit = 'Ohm' | 'kOhm' | 'MOhm';

export interface ResistorUnitOption {
  value: ResistorUnit;
  label: string;
  symbol: string;
  multiplier: number;
}

export const RESISTOR_UNITS: ResistorUnitOption[] = [
  { value: 'Ohm', label: 'اهم', symbol: 'Ω', multiplier: 1 },
  { value: 'kOhm', label: 'کیلو‌اهم', symbol: 'kΩ', multiplier: 1e3 },
  { value: 'MOhm', label: 'مگا‌اهم', symbol: 'MΩ', multiplier: 1e6 },
];

export interface ResistorItem {
  id: string;
  value: string; // string to handle typing smoothly (e.g. "4.", "4.7")
  unit: ResistorUnit;
  count: number; // quantity of identical resistors
}

export interface ParallelCalculationResult {
  isValid: boolean;
  totalResistanceOhms: number | null;
  displayValue: string;
  displayUnit: string;
  exactOhmsString: string;
  conductanceSiemens: number | null;
  totalResistorsCount: number;
  uniqueValuesCount: number;
  isShortCircuit: boolean;
  errorMessage: string | null;
}
