/**
 * Jarvis Design System — Token Constants
 *
 * Single source of truth for all design values.
 * These mirror the CSS custom properties in styles.css but are available
 * in TypeScript for use in computed styles, charts, and canvas rendering.
 *
 * Never use raw hex/rgb values in component code — always import from here.
 */

export const Colors = {
  // Backgrounds
  background: "#050608",
  panel: "#0e1117",
  surface: "#161b22",

  // Foregrounds
  foreground: "#ffffff",
  textSecondary: "#b7bdc8",
  mutedText: "#7e8794",

  // Brand accents
  accentBlue: "#4f7dff",
  accentPurple: "#7b5cff",
  highlight: "#61c7ff",

  // Semantic colors
  success: "#4ade80",
  warning: "#fbbf24",
  error: "#f87171",
  info: "#61c7ff",

  // Borders
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",

  // Overlays
  overlay04: "rgba(255,255,255,0.04)",
  overlay06: "rgba(255,255,255,0.06)",
  overlay10: "rgba(255,255,255,0.10)",
} as const;

export const Gradients = {
  brand: "linear-gradient(135deg, #61c7ff 0%, #4f7dff 50%, #7b5cff 100%)",
  brandHorizontal: "linear-gradient(90deg, #4f7dff, #7b5cff)",
  subtle: "linear-gradient(180deg, rgba(22,27,34,0.65) 0%, rgba(14,17,23,0.55) 100%)",
  glassStrong: "linear-gradient(180deg, rgba(22,27,34,0.85) 0%, rgba(14,17,23,0.75) 100%)",
} as const;

export const Shadows = {
  glass: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
  float: "0 24px 64px -12px rgba(0,0,0,0.6), 0 8px 24px -8px rgba(79,125,255,0.15)",
  glowBlue: "0 0 40px -8px rgba(79,125,255,0.5)",
  glowPurple: "0 0 40px -8px rgba(123,92,255,0.5)",
  glowGreen: "0 0 40px -8px rgba(74,222,128,0.5)",
} as const;

export const Radii = {
  sm: "10px",
  md: "14px",
  lg: "20px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "40px",
  full: "9999px",
} as const;

export const Typography = {
  fontSans: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  fontMono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
} as const;

// Chart color palette — ordered for visual harmony
export const ChartColors = [
  Colors.accentBlue,
  Colors.accentPurple,
  Colors.highlight,
  Colors.success,
  Colors.warning,
] as const;
