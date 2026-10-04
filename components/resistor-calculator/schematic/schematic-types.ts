import { ResistorUnit } from '@/types/resistor';

export type SymbolStandard = 'ieee' | 'iec';

export interface BranchStat {
  hasValue: boolean;
  ohms: number | null;
  currentShare: string | null;
  isShort: boolean;
  animDuration: number;
  flowOpacity: number;
  flowStrokeWidth: number;
}

// V8 Performance: Static O(1) property lookup tables to avoid Array.prototype.find in render loops
export const UNIT_SYMBOL_MAP: Record<ResistorUnit, string> = {
  Ohm: 'Ω',
  kOhm: 'kΩ',
  MOhm: 'MΩ',
};

export const UNIT_MULTIPLIER_MAP: Record<ResistorUnit, number> = {
  Ohm: 1,
  kOhm: 1e3,
  MOhm: 1e6,
};
