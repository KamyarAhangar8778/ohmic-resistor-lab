import { ResistorUnit, ResistorItem } from './resistor';

export interface SeriesCalculationResult {
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

export interface SeriesVoltageAnalysis {
  inputVoltage: number;
  inputVoltageUnit: 'V' | 'mV' | 'kV';
  totalCurrentAmps: number;
  displayCurrent: string;
  displayCurrentUnit: string;
  totalPowerWatts: number;
  displayPowerTotal: string;
  resistorDrops: {
    id: string;
    tag: string;
    voltageDropVolts: number;
    displayVoltageDrop: string;
    powerWatts: number;
    displayPower: string;
  }[];
}
