import { ResistorUnit } from './resistor';

export type VoltageUnit = 'V' | 'mV' | 'kV';

export interface VoltageUnitOption {
  value: VoltageUnit;
  label: string;
  symbol: string;
  multiplier: number;
}

export const VOLTAGE_UNITS: VoltageUnitOption[] = [
  { value: 'mV', label: 'میلی‌ولت', symbol: 'mV', multiplier: 1e-3 },
  { value: 'V', label: 'ولت', symbol: 'V', multiplier: 1 },
  { value: 'kV', label: 'کیلوولت', symbol: 'kV', multiplier: 1e3 },
];

export type DividerSolveMode = 'vout' | 'r1' | 'r2' | 'vin' | 'pair';

export type DividerApplicationMode = 'sampling' | 'biasing' | 'reference';

export type PairSortCriterion = 'accuracy' | 'power' | 'current' | 'thevenin' | 'overall';

export type PairTableSortKey =
  | 'score'
  | 'error'
  | 'power'
  | 'current'
  | 'thevenin'
  | 'vout'
  | 'r1'
  | 'worst_case'
  | 'ratio';

export type SortDirection = 'asc' | 'desc';
export type PowerFilterOption = 'all' | '10mw' | '50mw' | '250mw';
export type CurrentFilterOption = 'all' | 'low' | 'mid' | 'high';
export type DomainFilterOption = 'all' | 'low_power' | 'general' | 'high_drive';
export type TablePageSize = 10 | 20;

export interface StandardResistorPair {
  r1Value: string;
  r1Unit: ResistorUnit;
  r2Value: string;
  r2Unit: ResistorUnit;
  r1Ohms: number;
  r2Ohms: number;
  actualVout: number;
  displayVout: string;
  errorPercentage: number;
  worstCaseVoutMin: number;
  worstCaseVoutMax: number;
  worstCaseVoutMinFormatted: string;
  worstCaseVoutMaxFormatted: string;
  worstCaseErrorPct: number;
  divisionRatio: number;
  divisionRatioFormatted: string;
  currentAmperes: number;
  currentFormatted: string;
  powerWatts: number;
  powerFormatted: string;
  powerR1Watts?: number;
  powerR1Formatted?: string;
  powerR2Watts?: number;
  powerR2Formatted?: string;
  theveninOhms: number;
  theveninFormatted: string;
  stiffnessRatio?: number;
  stiffnessStatus?: 'excellent' | 'good' | 'poor' | 'unloaded';
  adcSuitability: 'direct' | 'buffered' | 'high_impedance';
  adcSuitabilityLabel: string;
  biasStability: 'stiff' | 'moderate' | 'soft';
  biasStabilityLabel: string;
  domainCategory: 'low_power' | 'general' | 'high_drive';
  domainCategoryLabel: string;
  overallScore: number;
  badge?: string;
  isLoaded?: boolean;
}

export interface VoltageDividerState {
  appMode: DividerApplicationMode;
  solveMode: DividerSolveMode;
  vin: string;
  vinUnit: VoltageUnit;
  vout: string;
  voutUnit: VoltageUnit;
  r1: string;
  r1Unit: ResistorUnit;
  r2: string;
  r2Unit: ResistorUnit;
  hasLoad: boolean;
  rl: string;
  rlUnit: ResistorUnit;
}

export interface VoltageDividerResult {
  isValid: boolean;
  vinVolts: number | null;
  voutVolts: number | null;
  displayVout: string;
  displayVoutUnit: string;
  ratio: number | null;
  ratioPercentage: string;
  dbAttenuation: string | null;
  currentTotalAmperes: number | null;
  displayCurrent: string;
  displayCurrentUnit: string;
  currentLoadAmperes: number | null;
  displayCurrentLoad: string;
  powerR1Watts: number | null;
  displayPowerR1: string;
  powerR2Watts: number | null;
  displayPowerR2: string;
  powerLoadWatts: number | null;
  displayPowerLoad: string;
  powerTotalWatts: number | null;
  displayPowerTotal: string;
  theveninResistanceOhms: number | null;
  displayRth: string;
  displayRthUnit: string;
  isShortCircuit: boolean;
  errorMessage: string | null;
  solvedField?: 'vout' | 'r1' | 'r2' | 'vin' | 'pair';
  solvedValueFormatted?: string;
  solvedValue?: string;
  solvedResistorUnit?: ResistorUnit;
  suggestedPairs?: StandardResistorPair[];
}

export interface DividerPreset {
  id: string;
  title: string;
  description: string;
  vin: string;
  vinUnit: VoltageUnit;
  r1: string;
  r1Unit: ResistorUnit;
  r2: string;
  r2Unit: ResistorUnit;
  hasLoad?: boolean;
  rl?: string;
  rlUnit?: ResistorUnit;
}
