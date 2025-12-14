import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { PaystackProvider } from 'react-native-paystack-webview';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { navigationThemes, paperThemes } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/providers/auth-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const navTheme = navigationThemes[colorScheme];
  const paperTheme = paperThemes[colorScheme];
  const paystackKey = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaystackProvider publicKey={paystackKey} currency="ZAR">
          <PaperProvider theme={paperTheme}>
            <ThemeProvider value={navTheme}>
              <AuthProvider>
                <Stack>
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
                </Stack>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              </AuthProvider>
            </ThemeProvider>
          </PaperProvider>
        </PaystackProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
