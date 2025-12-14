import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  continueAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

WebBrowser.maybeCompleteAuthSession();

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
};

const googleClients = {
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: googleClients.ios,
    androidClientId: googleClients.android,
    webClientId: googleClients.web,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (next: User | null) => {
      setUser(next);
      setLoading(false);
    });
    return unsub;
  }, []);

  const continueAnonymously = async () => {
    if (auth.currentUser?.isAnonymous) return;
    await signInAnonymously(auth);
  };

  const signInEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signUpEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  };

  const signInGoogle = async () => {
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return;
    }
    
    if (!request) {
      throw new Error('Google Sign-In is still initializing. Please try again in a moment.');
    }

    const result = await promptAsync();
    if (result?.type !== 'success' || !result.params?.id_token) {
      throw new Error('Google sign-in was cancelled.');
    }

    const credential = GoogleAuthProvider.credential(result.params.id_token);
    await signInWithCredential(auth, credential);
  };

  const signOut = async () => {
    await auth.signOut();
  };

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const value = useMemo(
    () => ({ user, loading, signInEmail, signUpEmail, signInGoogle, continueAnonymously, signOut }),
    [user, loading]
  );

  if (loading) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
        <ThemedText style={styles.splashText}>Preparing Glowa...</ThemedText>
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  splashText: {
    fontSize: 16,
  },
});
