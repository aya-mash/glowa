import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/sign-in');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await user?.delete();
              router.replace('/auth/sign-in');
            } catch (error: any) {
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert('Security Check', 'Please sign out and sign in again to delete your account.');
              } else {
                Alert.alert('Error', 'Failed to delete account. Please try again.');
              }
            }
          }
        }
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const SettingItem = ({ icon, label, value, onPress, isDestructive = false }: any) => (
    <TouchableOpacity 
      style={[styles.item, { borderBottomColor: theme.border }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: isDestructive ? '#FF3B30' : theme.tint }]}>
          <Ionicons name={icon} size={20} color="#fff" />
        </View>
        <ThemedText style={[styles.itemLabel, isDestructive && { color: '#FF3B30' }]}>{label}</ThemedText>
      </View>
      <View style={styles.itemRight}>
        {value && <ThemedText style={styles.itemValue}>{value}</ThemedText>}
        <Ionicons name="chevron-forward" size={20} color={theme.icon} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.header}>Settings</ThemedText>

        {/* Profile Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeader}>ACCOUNT</ThemedText>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={[styles.item, { borderBottomColor: theme.border }]}>
              <View style={styles.itemLeft}>
                <View style={[styles.avatar, { backgroundColor: theme.border }]}>
                  <ThemedText style={styles.avatarText}>
                    {user?.email?.[0].toUpperCase() ?? 'U'}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="defaultSemiBold">{user?.email ?? 'Guest'}</ThemedText>
                  <ThemedText style={styles.subtext}>Free Plan</ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeader}>GENERAL</ThemedText>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <SettingItem 
              icon="star" 
              label="Rate App" 
              onPress={() => {}} 
            />
            <SettingItem 
              icon="share-social" 
              label="Share with Friends" 
              onPress={() => {}} 
            />
             <SettingItem 
              icon="document-text" 
              label="Terms of Service" 
              onPress={() => openLink('https://example.com/terms')} 
            />
             <SettingItem 
              icon="shield-checkmark" 
              label="Privacy Policy" 
              onPress={() => openLink('https://example.com/privacy')} 
            />
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionHeader}>ACTIONS</ThemedText>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <SettingItem 
              icon="log-out" 
              label="Sign Out" 
              onPress={handleSignOut} 
            />
            <SettingItem 
              icon="trash" 
              label="Delete Account" 
              isDestructive 
              onPress={handleDeleteAccount} 
            />
          </View>
        </View>

        <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60, // Large title spacing
  },
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginLeft: 16,
    marginBottom: 8,
    fontSize: 13,
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: 16,
  },
  itemValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  version: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 20,
  },
});
