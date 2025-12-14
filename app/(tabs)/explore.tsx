import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGlowups } from '@/hooks/useGlowups';
import { useAuth } from '@/providers/auth-provider';
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
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.card, opacity: pressed ? 0.7 : 1 }
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={item.style === 'iphone' ? 'phone-portrait-outline' : 'camera-outline'} 
          size={24} 
          color={theme.tint} 
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <ThemedText type="defaultSemiBold">
            {item.style === 'iphone' ? 'iPhone 17 Pro Max' : 'High-End DSLR'}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.icon }}>
            {formatSince(item.createdAt)}
          </ThemedText>
        </View>
        <ThemedText type="caption" numberOfLines={1} style={{ color: theme.icon, marginTop: 2 }}>
          {item.vision || 'Vision analysis pending'}
        </ThemedText>
        <View style={styles.statusRow}>
           {locked ? (
             <View style={styles.statusBadge}>
               <Ionicons name="lock-closed" size={10} color={theme.icon} style={{ marginRight: 4 }} />
               <ThemedText type="caption" style={{ color: theme.icon }}>Locked</ThemedText>
             </View>
           ) : (
             <View style={styles.statusBadge}>
               <Ionicons name="lock-open" size={10} color={theme.success} style={{ marginRight: 4 }} />
               <ThemedText type="caption" style={{ color: theme.success }}>Unlocked</ThemedText>
             </View>
           )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.icon} style={{ opacity: 0.5 }} />
    </Pressable>
  );
}

export default function GlowupsScreen() {
  const { glowups, loading } = useGlowups();
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const isGuest = !user || user.isAnonymous;

  const handlePress = (item: Glowup) => {
    if (item.status === 'locked') {
      router.push({ pathname: '/(auth)/preview/[id]', params: { id: item.id } } as never);
    } else {
      router.push({ pathname: '/glowup/[id]', params: { id: item.id } } as never);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Loading glowups...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="largeTitle">History</ThemedText>
        </View>
        
        {isGuest && (
          <Pressable 
            style={[styles.guestBanner, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push('/auth/sign-up' as never)}
          >
            <Ionicons name="warning-outline" size={20} color={theme.tint} />
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Guest Account</ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.icon }}>Sign up to save your history permanently.</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.icon} />
          </Pressable>
        )}

        <FlatList
          data={glowups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <GlowupRow item={item} onPress={() => handlePress(item)} />}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <ThemedText style={{ textAlign: 'center', color: theme.icon, marginBottom: 16 }}>No glowups yet.</ThemedText>
              <Pressable
                onPress={() => router.push('/(auth)/upload' as never)}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 }
                ]}
              >
                <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>Start your first glowup</ThemedText>
              </Pressable>
            </View>
          )}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => null} />}
        />
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  guestBanner: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  list: {
    paddingBottom: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    marginTop: 4,
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 76, 
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 100,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
