/**
 * Color palette for light and dark themes
 * Supports 5-color system for consistent theming
 */

export const colors = {
  light: {
    primary: '#2563eb', // Blue - main action color
    secondary: '#64748b', // Slate - secondary actions
    background: '#ffffff', // White - main background
    surface: '#f8fafc', // Light slate - elevated surfaces
    text: '#1e293b', // Dark slate - primary text
    textSecondary: '#64748b', // Slate - secondary text
    border: '#e2e8f0', // Light slate - borders
    error: '#dc2626', // Red - error states
    success: '#16a34a', // Green - success states
    warning: '#ea580c', // Orange - warning states
  },
  dark: {
    primary: '#3b82f6', // Lighter blue - main action color
    secondary: '#94a3b8', // Light slate - secondary actions
    background: '#0f172a', // Dark slate - main background
    surface: '#1e293b', // Medium slate - elevated surfaces
    text: '#f1f5f9', // Light slate - primary text
    textSecondary: '#cbd5e1', // Lighter slate - secondary text
    border: '#334155', // Medium slate - borders
    error: '#ef4444', // Lighter red - error states
    success: '#22c55e', // Lighter green - success states
    warning: '#f97316', // Lighter orange - warning states
  },
} as const;

export type ColorTheme = keyof typeof colors;
export type ColorKey = keyof typeof colors.light;

