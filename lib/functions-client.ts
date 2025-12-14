import { httpsCallable } from 'firebase/functions';

import { functions } from '@/lib/firebase';
import type { Glowup } from '@/types/glowup';

export type EnhanceStyle = 'iphone' | 'dslr';

interface AnalyzePayload {
  imageBase64: string;
  style: EnhanceStyle;
}

interface AnalyzeResponse {
  glowupId: string;
  previewUrl: string;
  originalPreviewUrl: string;
  vision: string;
}

interface VerifyPayload {
  glowupId: string;
  reference: string;
}

interface VerifyResponse {
  downloadUrl: string;
}

export async function callAnalyzeAndEnhance(payload: AnalyzePayload): Promise<AnalyzeResponse> {
  const callable = httpsCallable<AnalyzePayload, AnalyzeResponse>(functions, 'analyzeAndEnhance');
  const result = await callable(payload);
  return result.data;
}

export async function callVerifyAndUnlock(payload: VerifyPayload): Promise<VerifyResponse> {
  const callable = httpsCallable<VerifyPayload, VerifyResponse>(functions, 'verifyAndUnlock');
  const result = await callable(payload);
  return result.data;
}

export function isUnlocked(glowup?: Glowup | null) {
  return glowup?.status === 'unlocked' && Boolean(glowup.downloadUrl);
}
