import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaystackProvider } from 'react-native-paystack-webview';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';

import { navigationThemes } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/providers/auth-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const navTheme = navigationThemes[colorScheme];
  const paystackKey = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaystackProvider publicKey={paystackKey} currency="ZAR">
          <ThemeProvider value={navTheme}>
            <AuthProvider>
              <Stack>
                <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(auth)/upload"
                  options={{ headerTitle: 'Enhance', headerShown: true }}
                />
                <Stack.Screen
                  name="(auth)/preview/[id]"
                  options={{ headerTitle: 'Preview', headerShown: true }}
                />
                <Stack.Screen
                  name="(auth)/result/[id]"
                  options={{ headerTitle: 'Download', headerShown: true }}
                />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="subscribe" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="glowup/[id]" options={{ headerTitle: 'Glowup', headerShown: true }} />
              </Stack>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </PaystackProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
