import { Image } from 'expo-image';
import { useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from './themed-text';

interface ComparisonSliderProps {
  leftImage: string;
  rightImage: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ComparisonSlider({ leftImage, rightImage }: ComparisonSliderProps) {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
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
        <ThemedText type="caption" style={{ color: theme.icon }}>Original</ThemedText>
        <ThemedText type="caption" style={{ color: theme.tint }}>Preview</ThemedText>
      </View>
      <View
        style={[styles.frame, { borderColor: theme.border, backgroundColor: theme.card }]}
        {...responder.panHandlers}
      >
        <Image source={{ uri: rightImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <Animated.View style={[StyleSheet.absoluteFill, { width: pan }]}> 
          <Image source={{ uri: leftImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
        </Animated.View>
        <Animated.View
          style={[
            styles.handle,
            {
              backgroundColor: theme.tint,
              borderColor: '#fff',
              transform: [{ translateX: Animated.subtract(pan, handleSize / 2) }],
            },
          ]}
        >
          <ThemedText style={[styles.handleText, { color: '#fff' }]}>⇆</ThemedText>
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
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
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
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  handleText: {
    fontWeight: '700',
    fontSize: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
