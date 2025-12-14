import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet } from 'react-native';
import { usePaystack } from 'react-native-paystack-webview';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from './themed-text';

interface PaystackTriggerProps {
  amountCents: number;
  email: string;
  reference: string;
  onSuccess: (reference: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function PaystackTrigger({
  amountCents,
  email,
  reference,
  onSuccess,
  onCancel,
  disabled,
}: PaystackTriggerProps) {
  const [scriptReady, setScriptReady] = useState(false);
  const [webLoading, setWebLoading] = useState(false);
  const { popup } = usePaystack();
  const paystackKey = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';
  const unavailable = !paystackKey;
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const amount = amountCents / 100;

  useEffect(() => {
    if (Platform.OS !== 'web' || unavailable) return;
    if ((globalThis as any).PaystackPop) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => setScriptReady(false);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [unavailable]);

  if (Platform.OS === 'web') {
    const launchWebPayment = () => {
      const PaystackPop = (globalThis as any).PaystackPop;
      if (!PaystackPop) return;
      setWebLoading(true);
      PaystackPop.setup({
        key: paystackKey,
        email,
        amount: amountCents,
        currency: 'ZAR',
        ref: reference,
        callback: (res: any) => {
          setWebLoading(false);
          const ref = res?.reference || reference;
          onSuccess(ref);
        },
        onClose: () => {
          setWebLoading(false);
          onCancel?.();
        },
      }).openIframe();
    };

    if (unavailable) {
      return <ThemedText style={{ color: theme.icon, fontSize: 12 }}>Payments unavailable (Missing Key)</ThemedText>;
    }

    return (
      <Pressable
        onPress={launchWebPayment}
        disabled={!scriptReady || disabled || webLoading}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.tint, opacity: pressed || disabled ? 0.6 : 1 }
        ]}
      >
        {webLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
            Pay ZAR {amount.toFixed(2)}
          </ThemedText>
        )}
      </Pressable>
    );
  }

  // Native
  const launchNativePayment = () => {
    if (!popup) return;
    popup.checkout({
      email,
      amount,
      reference,
      onSuccess: (res: any) => {
        const ref = res?.reference || res?.transactionRef?.reference || reference;
        onSuccess(ref);
      },
      onCancel: () => {
        onCancel?.();
      },
      onError: () => {
        onCancel?.();
      },
    });
  };

  if (unavailable) {
    return <ThemedText style={{ color: theme.icon, fontSize: 12 }}>Payments unavailable (Missing Key)</ThemedText>;
  }

  return (
    <Pressable
      onPress={launchNativePayment}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.tint, opacity: pressed || disabled ? 0.6 : 1 }
      ]}
    >
      <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
        Pay ZAR {amount.toFixed(2)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

