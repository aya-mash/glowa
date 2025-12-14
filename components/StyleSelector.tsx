import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { GlowupStyle } from '@/types/glowup';
import { ThemedText } from './themed-text';

interface StyleSelectorProps {
  value: GlowupStyle;
  onChange: (style: GlowupStyle) => void;
}

const options: { key: GlowupStyle; title: string; subtitle: string; icon: string }[] = [
  {
    key: 'iphone',
    title: 'iPhone 17 Pro Max',
    subtitle: 'Computational HDR, crisp detail, wide dynamic range.',
    icon: 'phone-portrait-outline',
  },
  {
    key: 'dslr',
    title: 'High-End DSLR',
    subtitle: 'Canon R5 85mm f/1.2 look, cinematic bokeh.',
    icon: 'camera-outline',
  },
];

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const selected = option.key === value;
        return (
          <View key={option.key}>
            <Pressable
              onPress={() => onChange(option.key)}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: pressed ? theme.background : 'transparent' }
              ]}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={option.icon as any} size={24} color={theme.tint} />
              </View>
              <View style={styles.textContainer}>
                <ThemedText type="defaultSemiBold">{option.title}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.icon, marginTop: 2 }}>{option.subtitle}</ThemedText>
              </View>
              {selected && (
                <Ionicons name="checkmark" size={20} color={theme.tint} style={styles.check} />
              )}
            </Pressable>
            {index < options.length - 1 && <View style={[styles.separator, { backgroundColor: theme.border }]} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
    width: 32,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  check: {
    marginLeft: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60, 
  },
});
