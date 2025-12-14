import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from './themed-text';

interface LoadingSequenceProps {
  steps: string[];
  activeIndex: number;
}

export function LoadingSequence({ steps, activeIndex }: LoadingSequenceProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const progress = steps.length === 0 ? 0 : (activeIndex + 1) / steps.length;

  return (
    <View style={styles.container}>
      <View style={[styles.progressBarTrack, { backgroundColor: theme.border }]}>
        <View 
          style={[
            styles.progressBarFill, 
            { 
              width: `${progress * 100}%`, 
              backgroundColor: theme.tint 
            }
          ]} 
        />
      </View>
      <View style={styles.steps}>
        {steps.map((step, idx) => {
          const isActive = idx === activeIndex;
          return (
            <ThemedText
              key={step}
              style={[
                styles.step,
                {
                  color: isActive ? theme.tint : theme.icon,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {step}
            </ThemedText>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    width: '100%',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  steps: {
    gap: 6,
  },
  step: {
    fontSize: 14,
  },
});
