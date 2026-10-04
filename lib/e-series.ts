/**
 * EIA Standard Resistor Decade Tables (E12, E24) and Engineering Helper Functions.
 */

export const E12_BASE_VALUES = [
  1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2,
];

export const E24_BASE_VALUES = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
];

export interface StandardResistorValue {
  ohms: number;
  displayValue: string;
  unit: 'Ohm' | 'kOhm' | 'MOhm';
}

export function generateDecades(baseValues: number[], minExp = 1, maxExp = 6): StandardResistorValue[] {
  const result: StandardResistorValue[] = [];
  for (let exp = minExp; exp <= maxExp; exp++) {
    const multiplier = Math.pow(10, exp);
    for (const base of baseValues) {
      const ohms = Math.round(base * multiplier * 10) / 10;
      let unit: 'Ohm' | 'kOhm' | 'MOhm' = 'Ohm';
      let displayValue = `${ohms}`;

      if (ohms >= 1e6) {
        unit = 'MOhm';
        displayValue = `${Number((ohms / 1e6).toFixed(2))}`;
      } else if (ohms >= 1e3) {
        unit = 'kOhm';
        displayValue = `${Number((ohms / 1e3).toFixed(2))}`;
      }

      result.push({ ohms, displayValue, unit });
    }
  }
  return result;
}

export interface DividerPairRecommendation {
  r1: StandardResistorValue;
  r2: StandardResistorValue;
  actualVout: number;
  errorPercentage: number;
  currentAmps: number;
  powerR1Watts: number;
  powerR2Watts: number;
}

/**
 * Searches the selected E-series for the optimal (R1, R2) pair yielding target Vout.
 */
export function findBestDividerPairs(
  vin: number,
  targetVout: number,
  series: 'E12' | 'E24' = 'E24',
  maxResults = 5
): DividerPairRecommendation[] {
  if (vin <= 0 || targetVout <= 0 || targetVout >= vin) return [];

  const bases = series === 'E12' ? E12_BASE_VALUES : E24_BASE_VALUES;
  // Generate practical range from 100 Ohm to 1 MOhm (exponents 2 to 6)
  const resistors = generateDecades(bases, 2, 5);

  const candidates: DividerPairRecommendation[] = [];

  for (let i = 0; i < resistors.length; i++) {
    const r1 = resistors[i];
    for (let j = 0; j < resistors.length; j++) {
      const r2 = resistors[j];
      const actualVout = vin * (r2.ohms / (r1.ohms + r2.ohms));
      const error = Math.abs(actualVout - targetVout);
      const errorPercentage = (error / targetVout) * 100;

      // Filter to reasonably low-error pairs (<= 5% error)
      if (errorPercentage <= 5) {
        const current = vin / (r1.ohms + r2.ohms);
        candidates.push({
          r1,
          r2,
          actualVout,
          errorPercentage,
          currentAmps: current,
          powerR1Watts: Math.pow(current, 2) * r1.ohms,
          powerR2Watts: Math.pow(current, 2) * r2.ohms,
        });
      }
    }
  }

  // Sort by lowest error, then by moderate current consumption (~0.1mA to 5mA)
  candidates.sort((a, b) => {
    if (Math.abs(a.errorPercentage - b.errorPercentage) > 0.05) {
      return a.errorPercentage - b.errorPercentage;
    }
    // Prefer typical low-power current (~1mA = 0.001A)
    const diffA = Math.abs(a.currentAmps - 0.001);
    const diffB = Math.abs(b.currentAmps - 0.001);
    return diffA - diffB;
  });

  return candidates.slice(0, maxResults);
}

export interface PowerRatingAdvice {
  recommendedPackage: string;
  level: 'safe' | 'caution' | 'warning' | 'critical';
  titleFa: string;
  descriptionFa: string;
}

/**
 * Assesses power dissipation and recommends commercial resistor package ratings.
 */
export function evaluatePowerRating(powerWatts: number): PowerRatingAdvice {
  if (powerWatts <= 0.1) {
    return {
      recommendedPackage: '1/8W (0805 SMD)',
      level: 'safe',
      titleFa: 'توان ایمن و ناچیز',
      descriptionFa: 'تلفات حرارتی بسیار پایین است. تمام پکیج‌های استاندارد SMD و سوراخ‌کامل (THT) به راحتی پاسخگو هستند.',
    };
  }
  if (powerWatts <= 0.22) {
    return {
      recommendedPackage: '1/4W (استاندارد DIP)',
      level: 'safe',
      titleFa: 'توان مناسب مقاومت معمولی',
      descriptionFa: 'مقاومت‌های مرسوم کربنی یا فلزی ۱/۴ وات برای این نقطه کاری ایده‌آل هستند.',
    };
  }
  if (powerWatts <= 0.45) {
    return {
      recommendedPackage: '1/2W (نیم وات)',
      level: 'caution',
      titleFa: 'نیازمند مقاومت نیم‌وات',
      descriptionFa: 'توان تلفاتی نزدیک به آستانه مقاومت‌های ۱/۴ وات است. استفاده از مقاومت ۱/۲ وات برای اطمینان توصیه می‌شود.',
    };
  }
  if (powerWatts <= 0.9) {
    return {
      recommendedPackage: '1W (یک وات)',
      level: 'warning',
      titleFa: 'حرارت قابل‌توجه (۱ وات)',
      descriptionFa: 'تلفات بالا منجر به گرم‌شدن مقاومت می‌شود. مقاومت ۱ وات متال‌اکسید با تهویه مناسب نصب کنید.',
    };
  }
  return {
    recommendedPackage: '2W یا مقاومت سرامیکی/آجری',
    level: 'critical',
    titleFa: 'هشدار تلفات حرارتی شدید!',
    descriptionFa: 'توان تلفاتی بسیار بالاست! مقاومت معمولی دچار سوختگی می‌شود. حتماً از مقاومت آجری یا توان بالا با هیت‌سینک استفاده کنید.',
  };
}
