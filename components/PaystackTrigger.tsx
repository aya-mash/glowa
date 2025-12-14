import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { usePaystack } from 'react-native-paystack-webview';

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

    return (
      <View>
        <Button mode="contained" disabled icon="lock-open-variant">
          Pay ZAR {amount.toFixed(2)} to unlock
        </Button>
        <Text style={styles.helper}>
          {unavailable
            ? 'Add EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY to enable payments.'
            : scriptReady
              ? 'Click below to pay securely via Paystack.'
              : 'Loading Paystack...'}
        </Text>
        <Button
          mode="contained"
          onPress={launchWebPayment}
          disabled={unavailable || !scriptReady || webLoading}
          icon="lock-open-variant"
          loading={webLoading}
          style={{ marginTop: 8 }}
        >
          Pay ZAR {amount.toFixed(2)} to unlock (web)
        </Button>
      </View>
    );
  }

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

  return (
    <View>
      <Button
        mode="contained"
        onPress={launchNativePayment}
        disabled={disabled || unavailable}
        icon="lock-open-variant"
      >
        Pay ZAR {amount.toFixed(2)} to unlock
      </Button>
      {unavailable ? (
        <Text style={styles.helper}>Add EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY to enable payments.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#000000aa',
    paddingTop: 48,
    paddingHorizontal: 12,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  helper: {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.8,
  },
});
