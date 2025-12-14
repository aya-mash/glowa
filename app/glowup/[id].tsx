import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, Share, StyleSheet, View } from 'react-native';

import { ComparisonSlider } from '@/components/ComparisonSlider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGlowup } from '@/hooks/useGlowup';

export default function GlowupDetailScreen() {
  const { id } = useLocalSearchParams();
  const { glowup, loading, notFound } = useGlowup(id);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handleShare = async () => {
    const url = glowup?.downloadUrl || glowup?.previewUrl;
    if (!url) return;
    try {
      await Share.share({
        url: url,
        message: 'Check out my Glowup!',
      });
    } catch {
      Alert.alert('Error', 'Failed to share image');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  if (notFound || !glowup) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Glowup not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Result',
        headerRight: () => (
          <Ionicons 
            name="share-outline" 
            size={24} 
            color={theme.tint} 
            onPress={handleShare}
            style={{ marginRight: 16 }}
          />
        )
      }} />
      
      <View style={styles.imageContainer}>
        <ComparisonSlider 
          leftImage={glowup.originalPreviewUrl} 
          rightImage={glowup.downloadUrl || glowup.previewUrl} 
        />
      </View>

      <View style={styles.actions}>
        <View style={styles.info}>
          <ThemedText type="defaultSemiBold" style={styles.styleName}>{glowup.style}</ThemedText>
          <ThemedText style={styles.date}>
            {glowup.createdAt instanceof Date ? glowup.createdAt.toLocaleDateString() : 'Just now'}
          </ThemedText>
        </View>

        <View style={styles.buttonRow}>
          <Ionicons.Button 
            name="share-outline" 
            backgroundColor={theme.tint} 
            onPress={handleShare}
            style={styles.actionButton}
          >
            Share / Save
          </Ionicons.Button>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  actions: {
    padding: 20,
    paddingBottom: 40,
  },
  info: {
    marginBottom: 20,
  },
  styleName: {
    fontSize: 20,
    textTransform: 'capitalize',
  },
  date: {
    color: '#8E8E93',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: 20,
  },
});
