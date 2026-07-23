// src/constants/theme.ts
// Pro-Licious Design System — mirrors web Tailwind token values

export const Colors = {
  // Backgrounds
  bg: '#f9fafb',         // gray-50
  bgDark: '#09090b',     // zinc-950
  bgCard: '#ffffff',
  bgCardDark: '#18181b', // zinc-900

  // Borders
  border: '#f3f4f6',     // gray-100
  borderDark: '#27272a', // zinc-800
  borderMid: '#e5e7eb',  // gray-200

  // Text
  textPrimary: '#111827',   // gray-900
  textSecondary: '#6b7280', // gray-500
  textMuted: '#9ca3af',     // gray-400
  textWhite: '#ffffff',
  textDark: '#09090b',      // zinc-950

  // Brand / Accent
  red: '#dc2626',        // red-600
  redLight: '#ef4444',   // red-500
  redBg: '#fef2f2',      // red-50
  redBorder: '#fecaca',  // red-200

  // Success
  green: '#10b981',      // emerald-500
  greenLight: '#d1fae5', // emerald-100
  greenBg: '#f0fdf4',    // green-50
  greenText: '#065f46',  // emerald-800

  // Warning
  amber: '#f59e0b',
  amberBg: '#fffbeb',

  // Zinc (dark UI)
  zinc800: '#27272a',
  zinc700: '#3f3f46',
  zinc600: '#52525b',
  zinc400: '#a1a1aa',
  zinc300: '#d4d4d8',

  // Gray
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
  black: 'Inter_900Black',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
};
