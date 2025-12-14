import { StyleSheet, View } from 'react-native';
import { ProgressBar, Text, useTheme } from 'react-native-paper';

interface LoadingSequenceProps {
  steps: string[];
  activeIndex: number;
}

export function LoadingSequence({ steps, activeIndex }: LoadingSequenceProps) {
  const theme = useTheme();
  const progress = steps.length === 0 ? 0 : (activeIndex + 1) / steps.length;

  return (
    <View style={styles.container}>
      <ProgressBar progress={progress} color={theme.colors.primary} />
      <View style={styles.steps}>
        {steps.map((step, idx) => {
          const isActive = idx === activeIndex;
          return (
            <Text
              key={step}
              style={[
                styles.step,
                { color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant },
              ]}
            >
              {step}
            </Text>
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
  steps: {
    gap: 6,
  },
  step: {
    fontSize: 14,
  },
});
