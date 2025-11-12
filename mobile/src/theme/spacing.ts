/**
 * Spacing System from Figma
 * 
 * To extract spacing from Figma:
 * 1. Use Figma's spacing tool or inspect element spacing
 * 2. Common spacing values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
 * 3. Or use Dev Mode to see exact pixel values
 */

export const spacing = {
  // Base spacing unit (usually 4 or 8)
  baseUnit: 4,
  
  // Spacing scale
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  
  // Common spacing patterns
  padding: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  
  margin: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  
  gap: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
};

