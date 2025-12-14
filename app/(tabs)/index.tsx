import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';

import { Colors } from '@/constants/theme';

const features = [
  'Upload once, get AI enhanced previews instantly',
  'Gemini 3 Pro + Nano Banana for faithful enhancements',
  'Paystack-secured unlocks in ZAR',
  'Watermarked previews to protect your originals',
];

const steps = [
  'Pick a photo and pick a style',
  'We analyze faces and text to preserve identity',
  'Gemini simulates the optics you choose',
  'Watermarked preview is ready in under a minute',
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="outlined" style={styles.hero}>
        <Card.Content style={styles.heroContent}>
          <Chip style={styles.chip} icon="sparkles">Glowa · v0.0.1 MVP</Chip>
          <Text variant="headlineLarge" style={styles.title}>
            Turn everyday photos into flagship shots.
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Upload, preview for free with watermark, then unlock full resolution after secure Paystack
            verification.
          </Text>
          <View style={styles.heroButtons}>
            <Button mode="contained" icon="upload" onPress={() => router.push('/(auth)/upload' as never)}>
              Start a Glowup
            </Button>
            <Button mode="outlined" icon="clock" onPress={() => router.push('/(tabs)/explore')}>
              View history
            </Button>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.grid}>
        {features.map((feature) => (
          <Card key={feature} mode="contained" style={styles.featureCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.featureTitle}>
                {feature}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Card mode="outlined" style={styles.stepsCard}>
        <Card.Title title="How it works" titleVariant="titleLarge" />
        <Card.Content style={{ gap: 10 }}>
          {steps.map((step, idx) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{idx + 1}</Text>
              </View>
              <Text variant="bodyMedium" style={styles.stepText}>
                {step}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  hero: {
    borderRadius: 20,
  },
  heroContent: {
    gap: 12,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    lineHeight: 22,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 16,
  },
  featureTitle: {
    fontWeight: '700',
    lineHeight: 20,
  },
  stepsCard: {
    borderRadius: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  badgeText: {
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
  },
});
