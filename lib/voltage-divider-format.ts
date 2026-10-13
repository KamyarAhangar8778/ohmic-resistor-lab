import { formatPrecision } from './resistor-calc';

/**
 * Format electrical current to readable metric engineering unit (A, mA, µA)
 */
export function formatCurrent(amperes: number): { value: string; unit: string } {
  if (isNaN(amperes) || !isFinite(amperes) || amperes === 0) {
    return { value: '0', unit: 'mA' };
  }
  const abs = Math.abs(amperes);
  if (abs >= 1) {
    return { value: formatPrecision(amperes, 2), unit: 'A' };
  }
  if (abs >= 1e-3) {
    return { value: formatPrecision(amperes * 1e3, 2), unit: 'mA' };
  }
  return { value: formatPrecision(amperes * 1e6, 2), unit: 'µA' };
}

/**
 * Format electrical power to readable metric engineering unit (W, mW, µW)
 */
export function formatPower(watts: number): string {
  if (isNaN(watts) || !isFinite(watts) || watts === 0) {
    return '0 mW';
  }
  const abs = Math.abs(watts);
  if (abs >= 1) {
    return `${formatPrecision(watts, 2)} W`;
  }
  if (abs >= 1e-3) {
    return `${formatPrecision(watts * 1e3, 2)} mW`;
  }
  return `${formatPrecision(watts * 1e6, 2)} µW`;
}

/**
 * Format resistance with auto unit scaling (Ω, kΩ, MΩ)
 */
export function formatResistance(ohms: number): { value: string; unit: string } {
  if (isNaN(ohms) || !isFinite(ohms) || ohms === 0) {
    return { value: '0', unit: 'Ω' };
  }
  if (ohms >= 1e6) {
    return { value: formatPrecision(ohms / 1e6, 2), unit: 'MΩ' };
  }
  if (ohms >= 1e3) {
    return { value: formatPrecision(ohms / 1e3, 2), unit: 'kΩ' };
  }
  return { value: formatPrecision(ohms, 2), unit: 'Ω' };
}
