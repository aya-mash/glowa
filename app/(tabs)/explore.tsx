import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Text } from 'react-native-paper';

import { useGlowups } from '@/hooks/useGlowups';
import type { Glowup } from '@/types/glowup';

function formatSince(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function GlowupRow({ item, onPress }: { item: Glowup; onPress: () => void }) {
  const locked = item.status === 'locked';
  return (
    <Card mode="outlined" style={styles.card} onPress={onPress}>
      <Card.Content style={styles.cardContent}>
        <View style={{ gap: 4 }}>
          <Text variant="titleMedium">{item.style === 'iphone' ? 'iPhone 17 Pro Max' : 'High-End DSLR'}</Text>
          <Text variant="bodyMedium" style={{ opacity: 0.8 }}>
            {item.vision || 'Vision analysis pending'}
          </Text>
          <View style={styles.metaRow}>
            <Chip icon={locked ? 'lock' : 'lock-open-variant'} compact>
              {locked ? 'Locked preview' : 'Unlocked'}
            </Chip>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              {formatSince(item.createdAt)}
            </Text>
          </View>
        </View>
        <Button mode={locked ? 'contained' : 'outlined'} onPress={onPress}>
          {locked ? 'Pay to unlock' : 'Open download'}
        </Button>
      </Card.Content>
    </Card>
  );
}

export default function GlowupsScreen() {
  const { glowups, loading } = useGlowups();
  const router = useRouter();

  const handlePress = (item: Glowup) => {
    if (item.status === 'locked') {
      router.push({ pathname: '/(auth)/preview/[id]', params: { id: item.id } } as never);
    } else {
      router.push({ pathname: '/(auth)/result/[id]', params: { id: item.id } } as never);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading glowups...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={glowups}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <GlowupRow item={item} onPress={() => handlePress(item)} />}
      ListEmptyComponent={() => (
        <View style={styles.center}>
          <Text style={{ textAlign: 'center' }}>No glowups yet.</Text>
          <Button
            mode="contained"
            style={{ marginTop: 12 }}
            onPress={() => router.push('/(auth)/upload' as never)}
          >
            Start your first glowup
          </Button>
        </View>
      )}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => null} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 12,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
});
