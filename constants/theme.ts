import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';

const palette = {
  primary: '#007AFF', // iOS Blue
  primary2: '#5856D6', // iOS Indigo
  primary3: '#FF9500', // iOS Orange
  backgroundDark: '#000000',
  cardDark: '#1C1C1E',
  borderDark: '#38383A',
  backgroundLight: '#F2F2F7', // System Grouped Background
  cardLight: '#FFFFFF',
  borderLight: '#C6C6C8',
  textLight: '#000000',
  textDark: '#FFFFFF',
  mutedLight: '#8E8E93',
  mutedDark: '#8E8E93',
  error: '#FF3B30',
  success: '#34C759',
};

export const Colors = {
  light: {
    text: palette.textLight,
    background: palette.backgroundLight,
    tint: palette.primary,
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: palette.primary,
    card: palette.cardLight,
    muted: palette.mutedLight,
    border: palette.borderLight,
    success: palette.success,
  },
  dark: {
    text: palette.textDark,
    background: palette.backgroundDark,
    tint: palette.primary,
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: palette.primary,
    card: palette.cardDark,
    muted: palette.mutedDark,
    border: palette.borderDark,
    success: palette.success,
  },
};

export const navigationThemes = {
  light: {
    ...NavigationLightTheme,
    colors: {
      ...NavigationLightTheme.colors,
      primary: palette.primary,
      background: palette.backgroundLight,
      card: palette.cardLight,
      text: palette.textLight,
      border: palette.borderLight,
    },
  },
  dark: {
    ...NavigationDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      primary: palette.primary,
      background: palette.backgroundDark,
      card: palette.cardDark,
      text: palette.textDark,
      border: palette.borderDark,
    },
  },
};

export const paletteColors = palette;
