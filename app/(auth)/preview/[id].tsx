import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Text } from 'react-native-paper';

import { ComparisonSlider } from '@/components/ComparisonSlider';
import { PaystackTrigger } from '@/components/PaystackTrigger';
import { useGlowup } from '@/hooks/useGlowup';
import { callVerifyAndUnlock } from '@/lib/functions-client';
import { useAuth } from '@/providers/auth-provider';

export default function PreviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { glowup, loading, notFound } = useGlowup(id);
  const { user } = useAuth();
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);

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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading preview...</Text>
      </View>
    );
  }

  if (notFound || !glowup) {
    return (
      <View style={styles.center}>
        <Text>Glowup not found.</Text>
        <Button mode="contained" onPress={() => router.push('/(auth)/upload' as never)}>
          Start a new glowup
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="outlined" style={styles.card}>
        <Card.Title title="Preview" subtitle="Left is your original, right is the enhanced preview." />
        <Card.Content style={{ gap: 12 }}>
          {glowup.originalPreviewUrl && glowup.previewUrl ? (
            <ComparisonSlider leftImage={glowup.originalPreviewUrl} rightImage={glowup.previewUrl} />
          ) : (
            <Text>Preview is still rendering. Please retry shortly.</Text>
          )}
          <Chip icon="eye" compact>
            Vision preserved: {glowup.vision?.slice(0, 80) || 'Gemini detected faces and text.'}
          </Chip>
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.card}>
        <Card.Title title="Unlock full resolution" />
        <Card.Content style={{ gap: 12 }}>
          <Text>
            Pay ZAR 49.00 via Paystack to unlock the unwatermarked original. Your payment is verified
            server-side, and the private file is exposed via a 24h signed URL.
          </Text>
          <PaystackTrigger
            amountCents={4900}
            email={email}
            reference={reference}
            onSuccess={handleVerify}
            disabled={verifying}
          />
          {verifying ? <ActivityIndicator animating /> : null}
          <Button mode="text" onPress={() => router.push('/(tabs)/explore')}>
            Back to history
          </Button>
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
  card: {
    borderRadius: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
});
