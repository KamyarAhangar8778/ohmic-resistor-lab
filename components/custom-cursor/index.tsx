'use client';

import React, { useRef, useSyncExternalStore } from 'react';
import { useHardwareCursorListeners } from './hooks/use-cursor-listeners';
import { CursorSvg } from './components/cursor-svg';

let coarsePointerMql: MediaQueryList | null = null;

function getCoarsePointerMql(): MediaQueryList | null {
  if (typeof window === 'undefined') return null;
  if (!coarsePointerMql) {
    coarsePointerMql = window.matchMedia('(pointer: coarse)');
  }
  return coarsePointerMql;
}

const subscribePointerMedia = (callback: () => void) => {
  const mql = getCoarsePointerMql();
  if (!mql) return () => {};
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
};

const getPointerClientSnapshot = () => getCoarsePointerMql()?.matches ?? false;
const getPointerServerSnapshot = () => false;

const CURSOR_HIDE_STYLE = (
  <style
    dangerouslySetInnerHTML={{
      __html: `
        @media (pointer: fine) {
          body, body * {
            cursor: none !important;
          }
        }
      `,
    }}
  />
);

/**
 * Custom Kinematic Cursor Component.
 * Implements direct GPU compositor translation without React render tree overhead,
 * achieving true 120/60+ FPS zero-jitter mouse tracking.
 *
 * @returns {React.ReactElement | null} Rendered custom cursor or null on touch devices.
 */
export function CustomCursor({ enabled = true }: { enabled?: boolean } = {}) {
  const isCoarsePointer = useSyncExternalStore(
    subscribePointerMedia,
    getPointerClientSnapshot,
    getPointerServerSnapshot
  );

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const isCursorActive = enabled && !isCoarsePointer;
  useHardwareCursorListeners({ cursorRef, innerRef, enabled: isCursorActive });

  if (!isCursorActive) {
    return null;
  }

  return (
    <>
      <CursorSvg ref={cursorRef} innerRef={innerRef} />
      {CURSOR_HIDE_STYLE}
    </>
  );
}
