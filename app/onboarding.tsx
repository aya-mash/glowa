import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Upload Your Photo',
    description: 'Choose a photo from your gallery or take a new one. We support all major formats.',
    icon: 'cloud-upload-outline',
  },
  {
    id: '2',
    title: 'Choose Your Style',
    description: 'Select from our curated collection of professional styles. From corporate to creative.',
    icon: 'color-palette-outline',
  },
  {
    id: '3',
    title: 'Get Your Glowup',
    description: 'Our AI enhances your photo in seconds. Download in HD or share directly.',
    icon: 'sparkles-outline',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      router.replace('/auth/sign-up');
    }
  };

  const handleSkip = () => {
    router.replace('/auth/sign-up');
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={100} color={theme.tint} />
      </View>
      <ThemedText type="title" style={styles.title}>{item.title}</ThemedText>
      <ThemedText style={styles.description}>{item.description}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleSkip}>
          <ThemedText style={{ color: theme.tint }}>Skip</ThemedText>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        getItemLayout={(data, index) => (
          { length: width, offset: width * index, index }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentIndex ? theme.tint : theme.border },
              ]}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleNext}
        >
          <ThemedText style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'flex-end',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 28,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
