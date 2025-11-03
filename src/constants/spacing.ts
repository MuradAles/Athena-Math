/**
 * Spacing scale for consistent layout
 * Based on 4px base unit system
 */

export const spacing = {
  xs: '4px', // 0.25rem
  sm: '8px', // 0.5rem
  md: '16px', // 1rem
  lg: '24px', // 1.5rem
  xl: '32px', // 2rem
  '2xl': '48px', // 3rem
  '3xl': '64px', // 4rem
  '4xl': '96px', // 6rem
} as const;

export type SpacingKey = keyof typeof spacing;

