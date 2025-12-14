import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import type { GlowupStyle } from '@/types/glowup';

interface StyleSelectorProps {
  value: GlowupStyle;
  onChange: (style: GlowupStyle) => void;
}

const options: { key: GlowupStyle; title: string; subtitle: string; icon: string }[] = [
  {
    key: 'iphone',
    title: 'iPhone 17 Pro Max',
    subtitle: 'Computational HDR, crisp detail, wide dynamic range.',
    icon: 'cellphone'
  },
  {
    key: 'dslr',
    title: 'High-End DSLR',
    subtitle: 'Canon R5 85mm f/1.2 look, cinematic bokeh.',
    icon: 'camera'
  },
];

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.card, { borderColor: selected ? theme.colors.primary : theme.colors.outline }]}
            activeOpacity={0.8}
          >
            <View style={styles.iconRow}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
                <MaterialCommunityIcons name={option.icon as any} size={22} color={theme.colors.onPrimary} />
              </View>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>{option.title}</Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>{option.subtitle}</Text>
            <View style={[styles.pill, selected ? { backgroundColor: theme.colors.primary + '22' } : null]}>
              <Text style={{ color: selected ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
                {selected ? 'Selected' : 'Tap to select'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    gap: 8,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
});
