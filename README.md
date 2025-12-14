# Glowa (v0.0.1 MVP)

![Cover Image](https://github.com/aya-mash/glowa/blob/master/public/cover.png?raw=true)

AI photo enhancement with watermark previews and Paystack unlock, built on Expo Router + Firebase Functions + Google Gemini.

## Prerequisites

- Node 18+ and Yarn 1.x
- Firebase CLI (`npm i -g firebase-tools`), authenticated
- Expo CLI (`npx expo --version` works) and a device/emulator/Expo Go
- Google Gemini API key, Paystack secret key, Paystack public key

## Firebase Setup

Ensure the following services are enabled in your Firebase Console:
1. **Authentication**: Enable **Anonymous** sign-in provider.
2. **Firestore Database**: Create a database (start in production mode and set rules).
3. **Storage**: Enable storage for image uploads.

## Environment

Create `.env.local` (for Expo) and set:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
EXPO_PUBLIC_FIREBASE_REGION=us-central1
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=
```

Functions secrets (server-side):

```
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set PAYSTACK_SECRET_KEY
```

## Install

```bash
yarn install
yarn --cwd functions install
```

## Run app (Expo)

```bash
yarn dev   # expo start
```

Scan the QR with Expo Go or run on simulator/emulator. If Metro caches an old build, use `yarn dev -- --clear`.

## Production Build

To build for Android/iOS using EAS:

```bash
npm install -g eas-cli
eas login
eas build --profile production --platform all
```

## Cloud Functions

Build and deploy (from project root):

```bash
cd functions
yarn build
yarn deploy   # or: firebase deploy --only functions
```

Functions use:
- `analyzeAndEnhance`: Gemini vision (`gemini-pro`) for scene/face description; Gemini image (`nano-banana-pro`) to generate enhanced preview; **High-visibility sharp watermarking (bold, drop-shadow)**; Firestore + Storage writes.
- `verifyAndUnlock`: Paystack verify, signed URL (24h) for originals, Firestore status update.

> **Note**: Ensure your Google AI Studio API key has access to the `gemini-pro` and `nano-banana-pro` models.

## Project Structure

```
├── app/                 # Expo Router pages (screens)
│   ├── (auth)/          # Authenticated routes (upload, preview)
│   ├── (tabs)/          # Main tab navigation
│   └── _layout.tsx      # Root layout & providers
├── components/          # Reusable UI components
├── functions/           # Firebase Cloud Functions (Backend)
│   └── src/index.ts     # Main logic (Gemini, Sharp, Paystack)
├── hooks/               # Custom React hooks
└── lib/                 # Utilities (Firebase, API clients)
```

## Key Libraries

- **UI**: `sonner-native` (Toasts), `react-native-reanimated`
- **Backend**: `firebase-functions`, `sharp` (Image processing), `@google/generative-ai`
- **Payments**: `react-native-paystack-webview`

## App Flow

1) **Onboarding**: Smooth slide-based intro to the app features.
2) **Upload & Enhance**: Upload image, choose style (iPhone 17 Pro Max or DSLR).
   - **Feedback**: Real-time toast notifications (`sonner-native`) and centered loading overlay.
3) **Preview**: View watermarked preview vs original.
4) **Unlock**: Paystack checkout (ZAR 49.00). On success, backend verifies and returns signed download URL.
5) **History**: History tab lists glowups; locked vs unlocked states.

## Common issues

- Anonymous auth blocked: enable Anonymous in Firebase Authentication → Sign-in method.
- Missing secrets: set `GEMINI_API_KEY` and `PAYSTACK_SECRET_KEY` via `functions:secrets:set`, then redeploy.
- Metro cannot resolve `sonner-native` or `firebase`: restart packager with `yarn dev -- --clear`.

## Scripts

- `yarn dev` — start Expo
- `yarn tsc --noEmit` — type check app
- `yarn --cwd functions build` — build functions
- `yarn --cwd functions deploy` — deploy functions
