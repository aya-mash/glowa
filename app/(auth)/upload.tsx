import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';

import { ComparisonSlider } from '@/components/ComparisonSlider';
import { LoadingSequence } from '@/components/LoadingSequence';
import { StyleSelector } from '@/components/StyleSelector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { EnhanceStyle } from '@/lib/functions-client';
import { callAnalyzeAndEnhance } from '@/lib/functions-client';

const steps = ['Uploading...', 'Analyzing Scene...', 'Simulating Optics...', 'Watermarking...'];

export default function UploadScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [style, setStyle] = useState<EnhanceStyle>('iphone');
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loadingStep, setLoadingStep] = useState<number>(-1);
  const [submitting, setSubmitting] = useState(false);

  const handlePick = async () => {
    Haptics.selectionAsync();
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission needed',
        'Please allow photo access to upload.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const runSequence = async () => {
    for (let i = 0; i < steps.length; i += 1) {
      setLoadingStep(i);
      await new Promise((res) => setTimeout(res, 350));
    }
  };

  const handleEnhance = async () => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      toast.error('No Internet connection');
      return;
    }

    if (!selectedImage?.base64) {
      toast.error('Please select a photo first');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSubmitting(true);
    setLoadingStep(0);
    try {
      const sequence = runSequence();
      const response = await callAnalyzeAndEnhance({
        imageBase64: selectedImage.base64,
        style,
      });
      await sequence;
      toast.success('Enhancement complete!');
      router.push({ pathname: '/(auth)/preview/[id]', params: { id: response.glowupId } } as never);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enhance photo.';
      toast.error(message);
    } finally {
      setSubmitting(false);
      setLoadingStep(-1);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionHeader}>CHOOSE STYLE</ThemedText>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <StyleSelector value={style} onChange={setStyle} />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionHeader}>PHOTO</ThemedText>
          <View style={[styles.card, { backgroundColor: theme.card, padding: 16 }]}>
            {selectedImage ? (
              <View style={{ borderRadius: 12, overflow: 'hidden', height: 300 }}>
                 <ComparisonSlider leftImage={selectedImage.uri} rightImage={selectedImage.uri} />
              </View>
            ) : (
              <View style={{ height: 200, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: theme.border, borderRadius: 12 }}>
                <Ionicons name="image-outline" size={48} color={theme.icon} />
                <ThemedText style={{ color: theme.icon, marginTop: 8 }}>No image selected</ThemedText>
              </View>
            )}
            
            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { borderColor: theme.border, opacity: pressed ? 0.8 : 1 }
                ]}
                onPress={handlePick}
              >
                <Ionicons name="images-outline" size={20} color={theme.text} style={{ marginRight: 8 }} />
                <ThemedText type="defaultSemiBold">Pick Photo</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Loading overlay is now handled absolutely below */}

      </ScrollView>
      
      <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
         <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.tint, opacity: (!selectedImage || submitting) ? 0.5 : (pressed ? 0.8 : 1) }
            ]}
            disabled={!selectedImage || submitting}
            onPress={handleEnhance}
          >
            <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>Enhance (Free Preview)</ThemedText>
          </Pressable>
      </View>

      {submitting && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }]}>
           <View style={{ width: '85%', padding: 24, backgroundColor: theme.card, borderRadius: 20, shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 }}>
             <LoadingSequence steps={steps} activeIndex={loadingStep} />
           </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginLeft: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontSize: 13,
    color: '#8E8E93',
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primaryButton: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
