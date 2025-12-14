# Glowa (v0.0.1 MVP)

AI photo enhancement with watermark previews and Paystack unlock, built on Expo Router + Firebase Functions + Google Gemini.

## Prerequisites

- Node 18+ and Yarn 1.x
- Firebase CLI (`npm i -g firebase-tools`), authenticated
- Expo CLI (`npx expo --version` works) and a device/emulator/Expo Go
- Google Gemini API key, Paystack secret key, Paystack public key

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

## Cloud Functions

Build and deploy (from project root):

```bash
cd functions
yarn build
yarn deploy   # or: firebase deploy --only functions
```

Functions use:
- `analyzeAndEnhance`: Gemini vision (gemini-3-pro-preview) for scene/face description; Gemini image (gemini-3-pro-image-preview) to generate enhanced preview; sharp watermarking; Firestore + Storage writes.
- `verifyAndUnlock`: Paystack verify, signed URL (24h) for originals, Firestore status update.

## App Flow

1) Upload image, choose style (iPhone 17 Pro Max or DSLR), get watermarked preview.
2) Paystack checkout (ZAR 49.00). On success, backend verifies and returns signed download URL.
3) History tab lists glowups; locked vs unlocked states.

## Common issues

- Anonymous auth blocked: enable Anonymous in Firebase Authentication → Sign-in method.
- Missing secrets: set `GEMINI_API_KEY` and `PAYSTACK_SECRET_KEY` via `functions:secrets:set`, then redeploy.
- Metro cannot resolve firebase/auth/react-native: restart packager with `yarn dev -- --clear` (we import from `firebase/auth`).

## Scripts

- `yarn dev` — start Expo
- `yarn tsc --noEmit` — type check app
- `yarn --cwd functions build` — build functions
- `yarn --cwd functions deploy` — deploy functions
