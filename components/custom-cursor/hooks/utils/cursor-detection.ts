/**
 * Helper utilities for detecting hover states and device characteristics
 * of the custom kinematic cursor, optimized for V8 fast-path execution.
 */

const DIRECT_CLICKABLE_TAGS = new Set([
  'BUTTON',
  'A',
  'INPUT',
  'SELECT',
  'TEXTAREA',
  'LABEL',
  'SUMMARY',
]);

const DIRECT_TEXT_TAGS = new Set([
  'P',
  'SPAN',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'CODE',
  'PRE',
  'LI',
  'BLOCKQUOTE',
]);

const CLICKABLE_SELECTOR =
  'a, button, input, select, textarea, [role="button"], [role="tab"], [role="switch"], [role="menuitem"], [role="checkbox"], label, summary, .cursor-pointer, [onclick]';

const TEXT_SELECTOR =
  'p, h1, h2, h3, h4, h5, h6, span, label, li, blockquote, code, pre';

let cachedCoarseMql: MediaQueryList | null = null;

// V8 Fast Path: WeakMap caches store element classification without memory leaks
const CLICKABLE_CACHE = new WeakMap<Element, boolean>();
const TEXT_CACHE = new WeakMap<Element, boolean>();

/**
 * Checks if the user is on a touch or coarse pointer device.
 * Caches MediaQueryList to prevent repeated CSSOM query allocations.
 *
 * @returns {boolean} True if running on a touch/coarse pointer device.
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return true;
  if (!cachedCoarseMql) {
    cachedCoarseMql = window.matchMedia('(pointer: coarse)');
  }
  return cachedCoarseMql.matches;
}

/**
 * Highly optimized check to see if an element or its ancestors are clickable.
 * Fast-paths direct tag matches in O(1) and caches results in WeakMap to avoid DOM traversal.
 *
 * @param {HTMLElement | null} target - Target element to inspect.
 * @returns {boolean} True if element is an interactive clickable target.
 */
export function checkClickable(target: HTMLElement | null): boolean {
  if (!target) return false;
  const cached = CLICKABLE_CACHE.get(target);
  if (cached !== undefined) return cached;

  // Direct tag check bypasses DOM tree traversal
  let isClick = DIRECT_CLICKABLE_TAGS.has(target.tagName);
  if (!isClick && typeof target.closest === 'function') {
    isClick = target.closest(CLICKABLE_SELECTOR) !== null;
  }
  CLICKABLE_CACHE.set(target, isClick);
  return isClick;
}

/**
 * Highly optimized check to see if the element is text to be hovered.
 * Fast-paths direct textual tags and caches results in WeakMap to avoid DOM traversal.
 *
 * @param {HTMLElement | null} target - Target element to inspect.
 * @param {boolean} isClickable - Whether the target has already been classified as clickable.
 * @returns {boolean} True if element is textual content suitable for tilt effect.
 */
export function checkHoveringText(target: HTMLElement | null, isClickable: boolean): boolean {
  if (!target || isClickable) return false;
  const cached = TEXT_CACHE.get(target);
  if (cached !== undefined) return cached;

  let isText = DIRECT_TEXT_TAGS.has(target.tagName);
  if (!isText && typeof target.closest === 'function') {
    isText = target.closest(TEXT_SELECTOR) !== null;
  }
  TEXT_CACHE.set(target, isText);
  return isText;
}
