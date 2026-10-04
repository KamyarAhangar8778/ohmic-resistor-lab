'use client';

/**
 * @file hooks/use-app-loaded.ts
 * @description Hook and dispatcher to manage initial application loading state.
 * Allows components to orchestrate transitions that trigger precisely when
 * the initial loading sequence completes.
 */

import { useSyncExternalStore } from 'react';

declare global {
  interface Window {
    __appLoaded?: boolean;
  }
}

const APP_LOADED_EVENT = 'app:loaded';

/**
 * Marks the application as loaded and dispatches a global window event.
 * Safe for multiple invocations; short-circuits early to prevent redundant allocations.
 */
export function markAppLoaded(): void {
  if (typeof window === 'undefined' || window.__appLoaded) return;
  window.__appLoaded = true;
  window.dispatchEvent(new Event(APP_LOADED_EVENT));
}

function subscribeAppLoaded(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(APP_LOADED_EVENT, callback);
  return () => {
    window.removeEventListener(APP_LOADED_EVENT, callback);
  };
}

function getAppLoadedClientSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.__appLoaded);
}

function getAppLoadedServerSnapshot(): boolean {
  return false;
}

/**
 * Custom React hook that returns whether the initial application loading
 * screen has completed its sequence using React concurrent external store synchronization.
 *
 * @returns {boolean} True if the initial loader has completed, false while still loading.
 */
export function useAppLoaded(): boolean {
  return useSyncExternalStore(
    subscribeAppLoaded,
    getAppLoadedClientSnapshot,
    getAppLoadedServerSnapshot
  );
}
