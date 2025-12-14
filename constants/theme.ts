import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

const palette = {
  gold: '#d4af37',
  goldBright: '#f5d572',
  graphite: '#1a1d25',
  charcoal: '#0d0f14',
  slate: '#222632',
  ash: '#9fa6b2',
  error: '#ff6b6b',
  success: '#2dd4bf',
};

export const Colors = {
  light: {
    text: '#1b1f2a',
    background: '#f8f6ef',
    tint: palette.gold,
    icon: '#4b5563',
    tabIconDefault: '#4b5563',
    tabIconSelected: palette.gold,
    card: '#ffffff',
    muted: '#6b7280',
    border: '#e5e7eb',
  },
  dark: {
    text: '#f8f4e8',
    background: palette.charcoal,
    tint: palette.gold,
    icon: '#c6cbd6',
    tabIconDefault: '#c6cbd6',
    tabIconSelected: palette.gold,
    card: palette.graphite,
    muted: '#a5adbd',
    border: palette.slate,
  },
};

export const paperThemes: Record<'light' | 'dark', MD3Theme> = {
  light: {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: palette.gold,
      primaryContainer: palette.goldBright,
      secondary: palette.graphite,
      background: Colors.light.background,
      surface: Colors.light.card,
      surfaceVariant: '#eceff4',
      outline: Colors.light.border,
      onSurface: Colors.light.text,
      onSurfaceVariant: Colors.light.muted,
      error: palette.error,
    },
  },
  dark: {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: palette.gold,
      primaryContainer: '#3b2f16',
      secondary: palette.slate,
      background: Colors.dark.background,
      surface: Colors.dark.card,
      surfaceVariant: palette.slate,
      outline: Colors.dark.border,
      onSurface: Colors.dark.text,
      onSurfaceVariant: Colors.dark.muted,
      error: palette.error,
    },
  },
};

export const navigationThemes = {
  light: {
    ...NavigationLightTheme,
    colors: {
      ...NavigationLightTheme.colors,
      primary: palette.gold,
      card: Colors.light.card,
      border: Colors.light.border,
      background: Colors.light.background,
      text: Colors.light.text,
    },
  },
  dark: {
    ...NavigationDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      primary: palette.gold,
      card: Colors.dark.card,
      border: Colors.dark.border,
      background: Colors.dark.background,
      text: Colors.dark.text,
    },
  },
};

export const paletteColors = palette;
