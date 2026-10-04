'use client';

import { useEffect, type RefObject } from 'react';
import {
  isTouchDevice,
  checkClickable,
  checkHoveringText,
} from './utils/cursor-detection';

export interface CursorElementsRef {
  cursorRef: RefObject<HTMLDivElement | null>;
  innerRef: RefObject<HTMLDivElement | null>;
  enabled?: boolean;
}

/**
 * Attaches a high-precision 60/120+ FPS kinematic LERP animation loop for the custom cursor.
 * Optimized with V8 fast paths, dirty checking, and zero-allocation RAF execution.
 *
 * @param {CursorElementsRef} refs - Direct DOM references to cursor container and inner 3D shell.
 */
export function useHardwareCursorListeners({ cursorRef, innerRef, enabled = true }: CursorElementsRef) {
  useEffect(() => {
    if (!enabled || isTouchDevice()) return;

    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let isVisible = false;
    let isMouseDown = false;
    let isClickable = false;
    let isHoveringText = false;
    let isScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let rafId: number | null = null;
    let isLoopRunning = false;

    // Cache previous transform state to prevent redundant CSS string construction and DOM writes
    let prevRotX = -999;
    let prevRotY = -999;
    let prevRotZ = -999;
    let prevScale = -999;

    // Kinematic LERP factor tuned for responsive, zero-jitter tracking
    const LERP_FACTOR = 0.26;

    const updateInnerTransform = (velX = 0) => {
      const inner = innerRef.current;
      if (!inner) return;

      if (prefersReduced) {
        const scale = isMouseDown ? 0.96 : isClickable ? 1.06 : 1;
        if (scale !== prevScale) {
          prevScale = scale;
          inner.style.transform = `scale(${scale})`;
        }
        return;
      }

      // 3D Secondary Feedback (Disney Squash/Anticipation & Follow-Through)
      const rotX = isMouseDown ? 20 : 0;
      const rotY = isMouseDown ? -20 : 0;
      const rawTilt = Math.max(-12, Math.min(12, velX * 0.32));
      const dynamicTilt = (rawTilt * 10 | 0) / 10;
      const rotZ = isHoveringText ? 14 : isClickable ? -6 : dynamicTilt;
      const scale = isClickable ? (isMouseDown ? 1.02 : 1.14) : isMouseDown ? 0.90 : 1;

      // V8 Fast Path: Skip string allocation and style invalidation if values are identical
      if (rotX === prevRotX && rotY === prevRotY && rotZ === prevRotZ && scale === prevScale) {
        return;
      }

      prevRotX = rotX;
      prevRotY = rotY;
      prevRotZ = rotZ;
      prevScale = scale;

      inner.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`;
    };

    const animate = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;

      // Smooth kinematic interpolation
      currentX += dx * LERP_FACTOR;
      currentY += dy * LERP_FACTOR;

      const cursor = cursorRef.current;
      if (cursor) {
        // Fast numeric rounding avoids Number.prototype.toFixed string allocation overhead
        const rx = (currentX * 100 | 0) / 100;
        const ry = (currentY * 100 | 0) / 100;
        cursor.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      }

      // Apply subtle dynamic velocity tilt during motion
      if (!isMouseDown && !isClickable && !isHoveringText) {
        updateInnerTransform(dx);
      }

      // Keep loop running only while cursor is still settling toward target
      const distSq = dx * dx + dy * dy;
      if (distSq > 0.005) {
        rafId = requestAnimationFrame(animate);
      } else {
        currentX = targetX;
        currentY = targetY;
        isLoopRunning = false;
        rafId = null;
        updateInnerTransform(0);
      }
    };

    const startLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(animate);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        currentX = targetX;
        currentY = targetY;
        const cursor = cursorRef.current;
        if (cursor) {
          cursor.style.opacity = '1';
          cursor.style.transform = `translate3d(${targetX}px,${targetY}px,0)`;
        }
      }
      startLoop();
    };

    const onPointerLeave = () => {
      isVisible = false;
      isLoopRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
    };

    const onPointerEnter = (e: PointerEvent) => {
      isVisible = true;
      targetX = e.clientX;
      targetY = e.clientY;
      currentX = targetX;
      currentY = targetY;
      const cursor = cursorRef.current;
      if (cursor) {
        cursor.style.opacity = '1';
        cursor.style.transform = `translate3d(${targetX}px,${targetY}px,0)`;
      }
      startLoop();
    };

    const onPointerDown = () => {
      isMouseDown = true;
      updateInnerTransform();
    };

    const onPointerUp = () => {
      isMouseDown = false;
      updateInnerTransform();
    };

    const onMouseOver = (e: MouseEvent) => {
      if (isScrolling) return;
      const target = e.target as HTMLElement | null;
      const clickable = checkClickable(target);
      const textHover = checkHoveringText(target, clickable);

      if (clickable !== isClickable || textHover !== isHoveringText) {
        isClickable = clickable;
        isHoveringText = textHover;
        updateInnerTransform();
      }
    };

    const onScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        isClickable = false;
        isHoveringText = false;
        updateInnerTransform();
      }
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 100);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('pointerenter', onPointerEnter, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('pointerenter', onPointerEnter);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('scroll', onScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [cursorRef, innerRef, enabled]);
}
