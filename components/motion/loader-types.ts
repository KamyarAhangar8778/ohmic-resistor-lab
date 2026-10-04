/**
 * @file components/motion/loader-types.ts
 * @description Type definitions and ASCII glyph datasets for the modular motion loader system.
 */

export type LoaderVariant =
  | 'spinner'
  | 'dots'
  | 'bars'
  | 'ascii'
  | 'ascii-line'
  | 'ascii-braille'
  | 'ascii-blocks'
  | 'ascii-bounce';

export const ASCII_SETS: Record<string, string[]> = {
  ascii: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  'ascii-line': ['|', '/', '-', '\\'],
  'ascii-braille': ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
  'ascii-blocks': ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▇', '▆', '▅', '▄', '▃', '▂'],
  'ascii-bounce': ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈'],
};

export interface LoaderProps {
  variant?: LoaderVariant;
  size?: number;
  speed?: number;
  label?: string;
  className?: string;
}

export interface PartProps {
  size: number;
  speed: number;
  reduce: boolean;
}
