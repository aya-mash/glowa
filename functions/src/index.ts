import { GoogleGenerativeAI } from "@google/generative-ai";
import { randomUUID } from "crypto";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { logger } from "firebase-functions/v2";
import {
  HttpsError,
  onCall,
  type CallableRequest,
} from "firebase-functions/v2/https";
import sharp from "sharp";
import { z } from "zod";

initializeApp();
const db = getFirestore();
const bucket = getStorage().bucket();

const PRICE_CENTS = 4900;
const CURRENCY = "ZAR";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

function stripDataUrlPrefix(base64: string) {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
}

const styleSchema = z.enum(["iphone", "dslr"]);
const analyzeSchema = z.object({
  imageBase64: z.string().min(10),
  style: styleSchema,
});
const verifySchema = z.object({
  glowupId: z.string().min(4),
  reference: z.string().min(4),
});

function assertEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new HttpsError(
      "failed-precondition",
      `${name} is not set in environment.`
    );
  }
  return value;
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const msg = (error.message || error.toString()).toLowerCase();

      // Check for retryable errors (503 Service Unavailable, 429 Too Many Requests)
      const isRetryable =
        msg.includes("503") ||
        msg.includes("overloaded") ||
        msg.includes("service unavailable") ||
        msg.includes("429") ||
        msg.includes("resource exhausted");

      if (!isRetryable) {
        throw error;
      }

      // Wait with exponential backoff + Jitter
      // This prevents "thundering herd" if many users hit the limit at once
      const backoff = baseDelay * Math.pow(2, i);
      const jitter = Math.random() * 1000; // Random delay between 0-1000ms
      const delay = backoff + jitter;

      logger.warn(`Attempt ${i + 1} failed, retrying in ${Math.round(delay)}ms...`, {
        error: msg,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function buildWatermarkSvg(text: string) {
  return Buffer.from(
    `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face { font-family: 'Inter'; }
        </style>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.5"/>
        </filter>
      </defs>
      <g transform="rotate(-35 250 250)" fill="none">
        <text x="30" y="270" font-size="36" font-family="Inter" fill="rgba(255,255,255,0.8)" filter="url(#shadow)" font-weight="bold">
          ${text}
        </text>
      </g>
    </svg>`
  );
}

async function describeVision(genAI: GoogleGenerativeAI, base64: string) {
  const cleanBase64 = stripDataUrlPrefix(base64);
  const visionModel = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
  });
  const response = await retryOperation(() =>
    visionModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Describe faces, expressions, scene and visible text succinctly.",
            },
            { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } },
          ],
        },
      ],
    })
  );
  return response.response?.text()?.trim() || "No vision details provided.";
}

async function enhanceImage(
  genAI: GoogleGenerativeAI,
  base64: string,
  style: "iphone" | "dslr",
  vision: string
) {
  const cleanBase64 = stripDataUrlPrefix(base64);
  const stylePrompt =
    style === "iphone"
      ? "Simulate iPhone 17 Pro Max. Computational HDR, hyper-sharp, wide dynamic range."
      : "Simulate Canon R5 85mm f/1.2. Optical bokeh, cinematic lighting, soft highlight rolloff.";

  const prompt = `${stylePrompt}
Preserve the subject identity, pose, framing, and background. Remove artifacts. Do not add text or watermarks. Increase clarity, depth, dynamic range, and realistic skin tones.`;

  const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-image-preview",
  });
  const response = await retryOperation(
    () =>
      model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: `${prompt}\nSTRICTLY PRESERVE: ${vision}` },
              { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } },
            ],
          },
        ],
      }),
    4, // Reduced from 5 to keep total wait time under ~45s to avoid client timeouts
    2000
  );

  const part = response.response?.candidates?.[0]?.content.parts?.find(
    (p: any) => "inlineData" in p
  );
  const data = part?.inlineData?.data as string | undefined;
  if (!data) {
    throw new Error("Gemini did not return an image.");
  }
  return Buffer.from(data, "base64");
}

export const analyzeAndEnhance = onCall(
  { region: "us-central1", memory: "2GiB", timeoutSeconds: 540 },
  async (request: CallableRequest) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign-in required.");
    }
    const parsed = analyzeSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid payload",
        parsed.error.format()
      );
    }

    const { imageBase64, style } = parsed.data;

    try {
      const genAI = new GoogleGenerativeAI(
        assertEnv(GEMINI_API_KEY, "GEMINI_API_KEY")
      );

      const originalBuffer = Buffer.from(imageBase64, "base64");
      const vision = await describeVision(genAI, imageBase64);
      const enhancedBuffer = await enhanceImage(
        genAI,
        imageBase64,
        style,
        vision
      );

      const id = randomUUID();
      const originalPath = `originals/${uid}/${id}.jpg`;
      const enhancedPath = `enhanced/${uid}/${id}.jpg`; // New path for the clean enhanced image
      const previewPath = `previews/${uid}/${id}.jpg`;
      const originalPreviewPath = `previews/${uid}/${id}-original.jpg`;

      await bucket.file(originalPath).save(originalBuffer, {
        metadata: { contentType: "image/jpeg" },
      });

      // Save the clean enhanced image (without watermark) securely
      await bucket.file(enhancedPath).save(enhancedBuffer, {
        metadata: { contentType: "image/jpeg" },
      });

      // Admin Check: Skip watermark if admin
      const userEmail = request.auth?.token?.email;
      const isAdmin =
        ADMIN_EMAIL &&
        userEmail &&
        userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      const watermarkSvg = buildWatermarkSvg("GLOWUP PREVIEW");

      let previewPipeline = sharp(enhancedBuffer).resize({
        width: 1600,
        height: 1600,
        fit: "inside",
      });

      if (!isAdmin) {
        previewPipeline = previewPipeline.composite([
          {
            input: watermarkSvg,
            gravity: "center",
            tile: true,
            blend: "overlay",
          },
        ]);
      }

      const previewBuffer = await previewPipeline
        .jpeg({ quality: 92 })
        .toBuffer();

      let originalPreviewPipeline = sharp(originalBuffer).resize({
        width: 1600,
        height: 1600,
        fit: "inside",
      });

      if (!isAdmin) {
        originalPreviewPipeline = originalPreviewPipeline.composite([
          {
            input: watermarkSvg,
            gravity: "center",
            tile: true,
            blend: "overlay",
          },
        ]);
      }

      const originalPreviewBuffer = await originalPreviewPipeline
        .jpeg({ quality: 82 })
        .toBuffer();

      const previewFile = bucket.file(previewPath);
      await previewFile.save(previewBuffer, {
        metadata: {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000",
        },
      });
      await previewFile.makePublic();
      const previewUrl = previewFile.publicUrl();

      const originalPreviewFile = bucket.file(originalPreviewPath);
      await originalPreviewFile.save(originalPreviewBuffer, {
        metadata: {
          contentType: "image/jpeg",
          cacheControl: "public, max-age=31536000",
        },
      });
      await originalPreviewFile.makePublic();
      const originalPreviewUrl = originalPreviewFile.publicUrl();

      await db.doc(`users/${uid}/glowups/${id}`).set({
        id,
        style,
        status: "locked",
        previewUrl,
        originalPreviewUrl,
        originalPath,
        enhancedPath, // Store the path to the enhanced image
        previewPath,
        createdAt: new Date(),
        priceCents: PRICE_CENTS,
        currency: CURRENCY,
        vision,
      });

      logger.info("Glowup prepared", { uid, id, style });

      return { glowupId: id, previewUrl, originalPreviewUrl, vision };
    } catch (error: any) {
      logger.error("Error in analyzeAndEnhance", error);

      // If it's already an HttpsError, rethrow it
      if (error instanceof HttpsError) {
        throw error;
      }

      const errorMessage = (error.message || error.toString()).toLowerCase();

      // 1. Gemini/AI Overload or Service Issues
      if (
        errorMessage.includes("503") ||
        errorMessage.includes("overloaded") ||
        errorMessage.includes("service unavailable")
      ) {
        throw new HttpsError(
          "resource-exhausted",
          "The AI service is currently overloaded. Please try again in a few moments."
        );
      }

      // 2. Gemini Safety/Policy Blocks
      if (
        errorMessage.includes("safety") ||
        errorMessage.includes("blocked") ||
        errorMessage.includes("policy")
      ) {
        throw new HttpsError(
          "invalid-argument",
          "The image was flagged by safety filters. Please try a different photo."
        );
      }

      // 3. Gemini Quota/Rate Limits
      if (
        errorMessage.includes("429") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit")
      ) {
        throw new HttpsError(
          "resource-exhausted",
          "AI usage limit reached. Please try again later."
        );
      }

      // 4. Specific Logic Errors
      if (errorMessage.includes("did not return an image")) {
        throw new HttpsError(
          "internal",
          "The AI analyzed the image but failed to generate an enhancement. Please try again."
        );
      }

      // 5. General Gemini Errors
      if (
        errorMessage.includes("googlegenerativeai") ||
        errorMessage.includes("gemini") ||
        errorMessage.includes("generatecontent") ||
        errorMessage.includes("candidate")
      ) {
        throw new HttpsError(
          "internal",
          "AI processing failed to generate a result. Please try again."
        );
      }

      // 6. Sharp/Image Processing Errors
      if (
        errorMessage.includes("sharp") ||
        errorMessage.includes("input buffer") ||
        errorMessage.includes("pixel") ||
        errorMessage.includes("image data")
      ) {
        if (errorMessage.includes("unsupported image format")) {
          throw new HttpsError(
            "invalid-argument",
            "Unsupported image format. Please use JPG, PNG, or WebP."
          );
        }
        if (errorMessage.includes("too large")) {
          throw new HttpsError(
            "invalid-argument",
            "Image is too large or complex to process."
          );
        }
        throw new HttpsError(
          "invalid-argument",
          "The image could not be processed. It might be corrupt or incompatible."
        );
      }

      // 7. Firebase/Infrastructure Errors
      if (
        errorMessage.includes("storage") ||
        errorMessage.includes("firestore") ||
        errorMessage.includes("bucket")
      ) {
        throw new HttpsError(
          "unavailable",
          "System storage is temporarily unavailable. Please try again."
        );
      }

      // 8. Network/Fetch Errors
      if (
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("network")
      ) {
        throw new HttpsError(
          "unavailable",
          "Network error occurred while communicating with AI services."
        );
      }

      // Default generic error
      // DEBUG: Including the actual error message to help diagnose the issue
      throw new HttpsError(
        "internal",
        `An unexpected error occurred: ${errorMessage}`
      );
    }
  }
);

export const verifyAndUnlock = onCall(
  { region: "us-central1" },
  async (request: CallableRequest) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Sign-in required.");
    }
    const parsed = verifySchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid payload",
        parsed.error.format()
      );
    }
    const { glowupId, reference } = parsed.data;

    try {
      logger.info("Starting verification", { uid, glowupId, reference });

      // Admin Bypass Logic
      const userEmail = request.auth?.token?.email;
      const isAdmin =
        ADMIN_EMAIL && userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (reference === "ADMIN_BYPASS") {
        if (!isAdmin) {
          throw new HttpsError("permission-denied", "Admin access required.");
        }
        logger.info("Admin bypass used", { uid, glowupId });
      } else {
        const secret = assertEnv(PAYSTACK_SECRET_KEY, "PAYSTACK_SECRET_KEY");
        const verifyResponse = await fetch(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${secret}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!verifyResponse.ok) {
          throw new HttpsError(
            "permission-denied",
            "Paystack verification failed."
          );
        }
        const verifyJson = (await verifyResponse.json()) as any;
        const status = verifyJson?.data?.status;
        const amount = verifyJson?.data?.amount ?? 0;

        if (status !== "success" || amount < PRICE_CENTS) {
          throw new HttpsError(
            "failed-precondition",
            "Payment not successful or amount below threshold."
          );
        }
      }

      const ref = db.doc(`users/${uid}/glowups/${glowupId}`);
      const snap = await ref.get();
      if (!snap.exists) {
        throw new HttpsError("not-found", "Glowup not found.");
      }
      const data = snap.data() as any;
      
      // Prefer the enhanced path if available, fallback to originalPath (legacy behavior)
      const targetPath = data.enhancedPath || data.originalPath;
      logger.info("Target path determined", { targetPath });
      
      if (!targetPath) {
        throw new HttpsError("failed-precondition", "Source file missing.");
      }

      const file = bucket.file(targetPath);
      
      // FIX: Instead of signing (which requires IAM permissions), we make the file public
      // The file name is a UUID so it is effectively secret/unguessable.
      await file.makePublic();
      const downloadUrl = file.publicUrl();

      await ref.update({
        status: "unlocked",
        downloadUrl,
        paystackReference: reference,
        unlockedAt: new Date(),
      });

      logger.info("Glowup unlocked", { uid, glowupId, downloadUrl });

      return { downloadUrl };
    } catch (error: any) {
      logger.error("Error in verifyAndUnlock", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      // Return the actual error message for debugging
      throw new HttpsError(
        "internal",
        `Verification failed: ${error.message || error.toString()}`
      );
    }
  }
);
