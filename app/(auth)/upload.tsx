import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import { ComparisonSlider } from '@/components/ComparisonSlider';
import { LoadingSequence } from '@/components/LoadingSequence';
import { StyleSelector } from '@/components/StyleSelector';
import type { EnhanceStyle } from '@/lib/functions-client';
import { callAnalyzeAndEnhance } from '@/lib/functions-client';

const steps = ['Uploading...', 'Analyzing Scene...', 'Simulating Optics...', 'Watermarking...'];

export default function UploadScreen() {
  const router = useRouter();
  const [style, setStyle] = useState<EnhanceStyle>('iphone');
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loadingStep, setLoadingStep] = useState<number>(-1);
  const [submitting, setSubmitting] = useState(false);

  const handlePick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload.');
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
    if (!selectedImage?.base64) {
      Alert.alert('Pick a photo', 'Select a photo with base64 support enabled.');
      return;
    }
    setSubmitting(true);
    setLoadingStep(0);
    try {
      const sequence = runSequence();
      const response = await callAnalyzeAndEnhance({
        imageBase64: selectedImage.base64,
        style,
      });
      await sequence;
      router.push({ pathname: '/(auth)/preview/[id]', params: { id: response.glowupId } } as never);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enhance photo.';
      Alert.alert('Enhance failed', message);
    } finally {
      setSubmitting(false);
      setLoadingStep(-1);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="outlined" style={styles.card}>
        <Card.Title title="Choose your style" titleVariant="titleLarge" />
        <Card.Content>
          <StyleSelector value={style} onChange={setStyle} />
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.card}>
        <Card.Title title="Upload a photo" titleVariant="titleLarge" />
        <Card.Content style={styles.cardContent}>
          {selectedImage ? (
            <ComparisonSlider leftImage={selectedImage.uri} rightImage={selectedImage.uri} />
          ) : (
            <Text style={{ opacity: 0.7 }}>No image selected yet.</Text>
          )}
          <View style={styles.buttonRow}>
            <Button mode="outlined" icon="image" onPress={handlePick}>
              Pick from library
            </Button>
            <Button
              mode="contained"
              icon="sparkles"
              disabled={!selectedImage || submitting}
              loading={submitting}
              onPress={handleEnhance}
            >
              Enhance (Free Preview)
            </Button>
          </View>
          {loadingStep >= 0 ? <LoadingSequence steps={steps} activeIndex={loadingStep} /> : null}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
});
