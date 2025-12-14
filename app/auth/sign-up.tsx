import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-provider';

export default function SignUpScreen() {
  const { signUpEmail, signInGoogle, continueAnonymously } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const handleSignUp = async () => {
    if (password !== confirm) {
      Alert.alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signUpEmail(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign up';
      Alert.alert('Sign up failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInGoogle();
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in unavailable';
      Alert.alert('Google sign-in', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await continueAnonymously();
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to continue as guest';
      Alert.alert('Guest sign-in', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <ThemedText type="largeTitle">Create account</ThemedText>
              <ThemedText type="default" style={{ color: theme.icon, marginTop: 8 }}>
                Save your glowups across devices.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="Email"
                placeholderTextColor={theme.icon}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="Password"
                placeholderTextColor={theme.icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="Confirm Password"
                placeholderTextColor={theme.icon}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
              />
              
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 }
                ]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>Sign up</ThemedText>
              </Pressable>

              <Pressable onPress={() => router.push('/auth/sign-in' as never)} style={{ alignSelf: 'center', padding: 10 }}>
                <ThemedText type="link">Already have an account?</ThemedText>
              </Pressable>
            </View>

            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: theme.border }]} />
              <ThemedText type="caption" style={{ color: theme.icon, marginHorizontal: 10 }}>OR</ThemedText>
              <View style={[styles.line, { backgroundColor: theme.border }]} />
            </View>

            <View style={styles.social}>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }
                ]}
                onPress={handleGoogle}
              >
                <Ionicons name="logo-google" size={20} color={theme.text} style={{ marginRight: 8 }} />
                <ThemedText type="defaultSemiBold">Continue with Google</ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.8 : 1, marginTop: 12 }
                ]}
                onPress={handleGuest}
              >
                <Ionicons name="person-outline" size={20} color={theme.text} style={{ marginRight: 8 }} />
                <ThemedText type="defaultSemiBold">Continue as Guest</ThemedText>
              </Pressable>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
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
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  primaryButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  social: {
    gap: 0,
  },
  secondaryButton: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
