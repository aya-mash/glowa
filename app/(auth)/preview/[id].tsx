import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ComparisonSlider } from '@/components/ComparisonSlider';
import { PaystackTrigger } from '@/components/PaystackTrigger';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGlowup } from '@/hooks/useGlowup';
import { callVerifyAndUnlock } from '@/lib/functions-client';
import { useAuth } from '@/providers/auth-provider';

export default function PreviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { glowup, loading, notFound } = useGlowup(id);
  const { user } = useAuth();
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const reference = useMemo(() => `${id}-${Date.now()}`, [id]);
  const email = user?.email ?? 'guest@glowa.app';

  const handleVerify = async (ref: string) => {
    if (!glowup) return;
    setVerifying(true);
    try {
      const response = await callVerifyAndUnlock({ glowupId: glowup.id, reference: ref });
      router.replace(
        { pathname: '/(auth)/result/[id]', params: { id: glowup.id, downloadUrl: response.downloadUrl } } as never
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed.';
      Alert.alert('Payment check failed', message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.tint} />
        <ThemedText style={{ marginTop: 16 }}>Loading preview...</ThemedText>
      </ThemedView>
    );
  }

  if (notFound || !glowup) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={{ marginBottom: 16 }}>Glowup not found.</ThemedText>
        <Pressable
          onPress={() => router.push('/(auth)/upload' as never)}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>Start a new glowup</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="largeTitle">Preview</ThemedText>
            <ThemedText style={{ color: theme.icon, marginTop: 4 }}>
              Left is your original, right is the enhanced preview.
            </ThemedText>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.previewContainer}>
              {glowup.originalPreviewUrl && glowup.previewUrl ? (
                <ComparisonSlider leftImage={glowup.originalPreviewUrl} rightImage={glowup.previewUrl} />
              ) : (
                <View style={styles.placeholder}>
                  <ThemedText style={{ color: theme.icon }}>Preview is still rendering. Please retry shortly.</ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold" style={{ color: theme.icon, textTransform: 'uppercase', fontSize: 13 }}>
              Unlock Full Resolution
            </ThemedText>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, padding: 16 }]}>
            <ThemedText style={{ marginBottom: 16 }}>
              Pay ZAR 49.00 to unlock the unwatermarked original. We verify via Paystack and return a 24h
              signed download URL.
            </ThemedText>
            
            <PaystackTrigger
              amountCents={4900}
              email={email}
              reference={reference}
              onSuccess={handleVerify}
              disabled={verifying}
            />
            
            {verifying && <ActivityIndicator style={{ marginTop: 12 }} color={theme.tint} />}
            
            <Pressable
              onPress={() => router.push('/(tabs)/explore')}
              style={({ pressed }) => [
                styles.secondaryButton,
                { opacity: pressed ? 0.6 : 1 }
              ]}
            >
              <ThemedText type="defaultSemiBold" style={{ color: theme.tint }}>Back to history</ThemedText>
            </Pressable>
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
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  previewContainer: {
    height: 400,
    width: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  visionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
});
