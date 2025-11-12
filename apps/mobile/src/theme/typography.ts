/**
 * Typography from Figma
 * 
 * To extract typography from Figma:
 * 1. Select text in Figma
 * 2. Check the Text panel for font family, size, weight, line height
 * 3. Or use Dev Mode to see computed styles
 */

export const typography = {
  // Font Families (from Figma - Poppins)
  fontFamily: {
    regular: 'System', // Poppins - will need to add custom font
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
  },
  
  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Text Styles (combinations)
  styles: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.4,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '700' as const,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    captionBold: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 1.5,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
  },
};

