/**
 * Design System Theme
 * 
 * Centralized theme configuration extracted from Figma
 * Update these values to match your Figma design
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { borderRadius } from './borderRadius';
import { shadows } from './shadows';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;

// Re-export for convenience
export { colors, typography, spacing, borderRadius, shadows };

