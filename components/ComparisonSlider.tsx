import { Image } from 'expo-image';
import { useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface ComparisonSliderProps {
  leftImage: string;
  rightImage: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ComparisonSlider({ leftImage, rightImage }: ComparisonSliderProps) {
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const handleSize = 38;
  const pan = useRef(new Animated.Value(width / 2)).current;

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_evt, gesture) => {
          const next = clamp(gesture.moveX, handleSize, width - handleSize);
          pan.setValue(next);
        },
      }),
    [handleSize, pan, width]
  );

  return (
    <View style={styles.wrapper}>
      <View style={[styles.labelRow]}>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Original</Text>
        <Text style={[styles.label, { color: theme.colors.primary }]}>Preview</Text>
      </View>
      <View style={[styles.frame, { borderColor: theme.colors.outline }]} {...responder.panHandlers}>
        <Image source={{ uri: rightImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <Animated.View style={[StyleSheet.absoluteFill, { width: pan }]}> 
          <Image source={{ uri: leftImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
        </Animated.View>
        <Animated.View
          style={[
            styles.handle,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.onPrimary,
              transform: [{ translateX: Animated.subtract(pan, handleSize / 2) }],
            },
          ]}
        >
          <Text style={[styles.handleText, { color: theme.colors.onPrimary }]}>⇆</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 8,
  },
  frame: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    height: 360,
  },
  handle: {
    position: 'absolute',
    top: '50%',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -22 }],
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  handleText: {
    fontWeight: '700',
    fontSize: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
