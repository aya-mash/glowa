import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const BENEFITS = [
  'Unlimited Glowups',
  'Faster Processing Speed',
  'HD Quality Downloads',
  'Priority Support',
  'No Watermarks',
];

export default function SubscribeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handleSubscribe = () => {
    Alert.alert('Coming Soon', 'Subscriptions are not yet enabled.');
  };

  const handleRestore = () => {
    Alert.alert('Restore', 'No purchases to restore.');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.icon} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="diamond" size={80} color={theme.tint} />
        </View>
        
        <ThemedText type="title" style={styles.title}>Unlock Pro Access</ThemedText>
        <ThemedText style={styles.subtitle}>
          Get the most out of your photos with our premium features.
        </ThemedText>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={[styles.benefitItem, { borderBottomColor: theme.border }]}>
              <Ionicons name="checkmark-circle" size={24} color={theme.tint} />
              <ThemedText style={styles.benefitText}>{benefit}</ThemedText>
            </View>
          ))}
        </View>

        <ThemedText style={styles.disclaimer}>
          Recurring billing. Cancel anytime.
        </ThemedText>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
        <Pressable
          style={({ pressed }) => [
            styles.subscribeButton,
            { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleSubscribe}
        >
          <ThemedText style={styles.subscribeButtonText}>Subscribe for $9.99/mo</ThemedText>
        </Pressable>
        
        <Pressable onPress={handleRestore} style={styles.restoreButton}>
          <ThemedText style={{ color: theme.text, fontSize: 14 }}>Restore Purchases</ThemedText>
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
    padding: 16,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 24,
    paddingBottom: 120,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 32,
  },
  subtitle: {
    textAlign: 'center',
    color: '#8E8E93',
    marginBottom: 40,
    fontSize: 18,
    lineHeight: 24,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  benefitText: {
    fontSize: 16,
    fontWeight: '500',
  },
  disclaimer: {
    marginTop: 24,
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  subscribeButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreButton: {
    alignItems: 'center',
    padding: 8,
  },
});
