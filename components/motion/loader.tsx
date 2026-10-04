'use client';

/**
 * @file components/motion/loader.tsx
 * @description Motion-powered modular loader supporting terminal ASCII spinners (including ascii-line).
 */

import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  type LoaderProps,
  type PartProps,
  ASCII_SETS,
} from './loader-types';

/**
 * Monospace ASCII character cycle renderer (powers ASCII Line, Braille, Blocks, etc.).
 * Optimized for V8 by updating textContent directly on DOM ref, eliminating React re-render
 * cycles and object allocations on every interval tick.
 */
function Ascii({
  frames,
  size,
  speed,
  reduce,
}: PartProps & { frames: string[] }): React.JSX.Element {
  const spanRef = React.useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const count = frames.length;
    if (count === 0) return;

    let idx = 0;
    const step = (((reduce ? speed * 2.5 : speed) / count) * 1000) | 0;
    const el = spanRef.current;
    if (!el) return;

    // Bitwise mask fast path when length is a power of 2 (e.g. 4 for ascii-line)
    const isPowerOfTwo = (count & (count - 1)) === 0;
    const mask = count - 1;

    const id = setInterval(() => {
      idx = isPowerOfTwo ? (idx + 1) & mask : (idx + 1) % count;
      el.textContent = frames[idx];
    }, step);

    return () => clearInterval(id);
  }, [frames, speed, reduce]);

  return (
    <span
      ref={spanRef}
      className="font-mono leading-none tabular-nums inline-block select-none"
      style={{ fontSize: size, lineHeight: 1 }}
    >
      {frames[0]}
    </span>
  );
}

/**
 * Universal Loader component rendering ASCII sets or fallback spinners.
 */
export function Loader({
  variant = 'ascii-line',
  size = 32,
  speed,
  label = 'Loading',
  className,
}: LoaderProps): React.JSX.Element {
  const reduce = useReducedMotion() ?? false;
  const effectiveSpeed = speed ?? (variant === 'ascii-line' ? 0.8 : 1);
  const asciiFrames = ASCII_SETS[variant] || ASCII_SETS['ascii-line'];

  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center text-foreground',
        className
      )}
    >
      <Ascii frames={asciiFrames} size={size} speed={effectiveSpeed} reduce={reduce} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * Preconfigured ASCII Line Loader cycling through ["|", "/", "-", "\\"].
 */
export function AsciiLineLoader({
  size = 16,
  speed = 0.8,
  label = 'Processing',
  className,
}: Omit<LoaderProps, 'variant'>): React.JSX.Element {
  return (
    <Loader
      variant="ascii-line"
      size={size}
      speed={speed}
      label={label}
      className={className}
    />
  );
}
