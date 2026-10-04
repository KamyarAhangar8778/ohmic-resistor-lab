import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fast-path numeric string sanitizer for engineering inputs.
 * Utilizes charCodeAt scanning and early return to eliminate regex overhead and intermediate string allocations.
 */
export function sanitizeNumericInput(val: string): string {
  const len = val.length;
  if (len === 0) return '';

  // Fast path: check if string is already clean (common case: typing valid numbers)
  let dotCount = 0;
  let isClean = true;
  for (let i = 0; i < len; i++) {
    const code = val.charCodeAt(i);
    if (code === 46 /* '.' */) {
      dotCount++;
      if (dotCount > 1) {
        isClean = false;
        break;
      }
    } else if (code < 48 || code > 57 /* '0'-'9' */) {
      isClean = false;
      break;
    }
  }
  if (isClean) return val;

  // Slow path: filter characters in a single pass without regex
  let result = '';
  let seenDot = false;
  for (let i = 0; i < len; i++) {
    const code = val.charCodeAt(i);
    if (code >= 48 && code <= 57) {
      result += val[i];
    } else if (code === 46 && !seenDot) {
      seenDot = true;
      result += '.';
    }
  }
  return result;
}
