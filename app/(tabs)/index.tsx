import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';

const steps = [
  { icon: 'image-outline', text: 'Pick a photo and style' },
  { icon: 'scan-outline', text: 'We analyze to preserve identity' },
  { icon: 'sparkles-outline', text: 'AI simulates the optics' },
  { icon: 'download-outline', text: 'Preview ready in < 1 min' },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { user } = useAuth();
  const isGuest = !user || user.isAnonymous;
  const theme = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <ThemedText type="largeTitle">Glowa</ThemedText>
            <View style={[styles.badge, { backgroundColor: theme.tint + '20' }]}>
              <ThemedText type="caption" style={{ color: theme.tint, fontWeight: '600' }}>v0.0.1</ThemedText>
            </View>
          </View>

          <View style={styles.hero}>
            <ThemedText type="title" style={styles.heroTitle}>
              Premium glowups,{'\n'}refined.
            </ThemedText>
            <ThemedText type="default" style={[styles.heroSubtitle, { color: theme.icon }]}>
              Upload once, get a faithful preview fast. Pay only when you love it.
            </ThemedText>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/(auth)/upload' as never);
              }}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>Start a Glowup</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: theme.card, opacity: pressed ? 0.8 : 1 }
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                if (isGuest) {
                  router.push('/auth/sign-in' as never);
                } else {
                  router.push('/(tabs)/explore');
                }
              }}
            >
              <Ionicons name={isGuest ? 'person-outline' : 'time-outline'} size={20} color={theme.tint} style={{ marginRight: 8 }} />
              <ThemedText type="defaultSemiBold" style={{ color: theme.tint }}>
                {isGuest ? 'Sign in to sync' : 'View history'}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionHeader}>How it works</ThemedText>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              {steps.map((step, idx) => (
                <View key={idx} style={[styles.stepRow, idx < steps.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
                  <Ionicons name={step.icon as any} size={24} color={theme.tint} style={styles.stepIcon} />
                  <ThemedText type="default" style={{ flex: 1 }}>{step.text}</ThemedText>
                </View>
              ))}
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hero: {
    marginBottom: 32,
  },
  heroTitle: {
    marginBottom: 12,
  },
  heroSubtitle: {
    lineHeight: 24,
  },
  actions: {
    gap: 16,
    marginBottom: 40,
  },
  primaryButton: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButton: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    marginLeft: 4,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontSize: 13,
    color: '#8E8E93',
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  stepIcon: {
    width: 24,
  },
});
