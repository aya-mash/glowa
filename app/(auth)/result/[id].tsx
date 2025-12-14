import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Text } from 'react-native-paper';

import { useGlowup } from '@/hooks/useGlowup';

export default function ResultScreen() {
  const { id, downloadUrl: downloadUrlParam } = useLocalSearchParams<{ id?: string; downloadUrl?: string }>();
  const { glowup, loading, notFound } = useGlowup(id);
  const router = useRouter();

  const downloadUrl = downloadUrlParam?.toString() || glowup?.downloadUrl;

  const handleDownload = () => {
    if (downloadUrl) {
      Linking.openURL(downloadUrl);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Fetching unlock...</Text>
      </View>
    );
  }

  if (notFound || !glowup) {
    return (
      <View style={styles.center}>
        <Text>Glowup not found.</Text>
        <Button mode="contained" onPress={() => router.push('/(auth)/upload' as never)}>
          Start new glowup
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="outlined" style={styles.card}>
        <Card.Title title="Unlocked" subtitle={glowup.style === 'iphone' ? 'iPhone 17 Pro Max' : 'High-End DSLR'} />
        <Card.Content style={{ gap: 10 }}>
          <Text>Your payment was verified. The download link below expires in 24 hours.</Text>
          <Chip icon="lock-open-variant" compact>
            Status: {glowup.status}
          </Chip>
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.card}>
        <Card.Title title="Download original" />
        <Card.Content style={{ gap: 12 }}>
          <Text numberOfLines={2}>
            {downloadUrl || 'Download link not available yet.'}
          </Text>
          <Button
            mode="contained"
            icon="download"
            disabled={!downloadUrl}
            onPress={handleDownload}
          >
            Open download URL
          </Button>
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
