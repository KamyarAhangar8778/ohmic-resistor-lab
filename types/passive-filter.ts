export type FilterTopology = 'rc' | 'rl';
export type FilterType = 'lowpass' | 'highpass';

export type ResistanceUnit = 'Ohm' | 'kOhm' | 'MOhm';
export type CapacitanceUnit = 'pF' | 'nF' | 'uF';
export type InductanceUnit = 'uH' | 'mH' | 'H';
export type FrequencyUnit = 'Hz' | 'kHz' | 'MHz';

export interface FilterState {
  topology: FilterTopology;
  type: FilterType;
  resistance: string;
  resistanceUnit: ResistanceUnit;
  capacitance: string;
  capacitanceUnit: CapacitanceUnit;
  inductance: string;
  inductanceUnit: InductanceUnit;
  testFrequency: string;
  testFrequencyUnit: FrequencyUnit;
  vinPeak: string;
}

export interface BodePoint {
  freq: number;
  gainDb: number;
  gainLinear: number;
  phaseDeg: number;
}

export interface FilterCalculationResult {
  isValid: boolean;
  errorMsg?: string;
  cutoffFreqHz: number;
  displayFc: string;
  displayFcUnit: string;
  timeConstantSec: number;
  displayTau: string;
  displayTauUnit: string;
  testFreqHz: number;
  gainAtTestDb: number;
  gainAtTestLinear: number;
  phaseAtTestDeg: number;
  voutPeak: number;
  attenuationPct: number;
  reactanceAtCutoffOhms: number;
  bodePoints: BodePoint[];
}

export interface StandardFilterPair {
  resistorOhms: number;
  resistorDisplay: string;
  reactiveOhmsOrValue: number;
  reactiveDisplay: string;
  reactiveUnit: string;
  actualFc: number;
  displayActualFc: string;
  errorPct: number;
}
