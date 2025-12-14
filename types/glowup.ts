export type GlowupStyle = 'iphone' | 'dslr';
export type GlowupStatus = 'locked' | 'unlocked';

export interface Glowup {
  id: string;
  style: GlowupStyle;
  status: GlowupStatus;
  previewUrl: string;
  originalPreviewUrl: string;
  originalPath: string;
  previewPath: string;
  downloadUrl?: string;
  createdAt: Date;
  priceCents: number;
  currency: string;
  vision?: string;
  paystackReference?: string;
}

export function timestampToDate(input: unknown): Date {
  if (!input) return new Date();
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  if (typeof input === 'string') return new Date(input);
  if (typeof input === 'object' && 'toDate' in (input as Record<string, unknown>)) {
    const maybeDate = (input as { toDate: () => Date }).toDate();
    return maybeDate;
  }
  if (
    typeof input === 'object' &&
    'seconds' in (input as Record<string, unknown>) &&
    typeof (input as Record<string, unknown>).seconds === 'number'
  ) {
    const seconds = (input as { seconds: number; nanoseconds?: number }).seconds;
    const nanos = (input as { seconds: number; nanoseconds?: number }).nanoseconds ?? 0;
    return new Date(seconds * 1000 + Math.floor(nanos / 1_000_000));
  }
  return new Date();
}
