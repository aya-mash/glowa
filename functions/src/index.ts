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

function buildWatermarkSvg(text: string) {
  return Buffer.from(
    `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face { font-family: 'Inter'; }
        </style>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.5"/>
        </filter>
      </defs>
      <g transform="rotate(-35 400 400)" fill="none">
        <text x="50" y="430" font-size="56" font-family="Inter" fill="rgba(255,255,255,0.8)" filter="url(#shadow)" font-weight="bold">
          ${text}
        </text>
      </g>
    </svg>`
  );
}

async function describeVision(genAI: GoogleGenerativeAI, base64: string) {
  const cleanBase64 = stripDataUrlPrefix(base64);
  const visionModel = genAI.getGenerativeModel({
    model: "gemini-pro",
  });
  const response = await visionModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: "Describe faces, expressions, scene and visible text succinctly." },
          { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } },
        ],
      },
    ],
  });
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
    model: "nano-banana-pro",
  });
  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: `${prompt}\nSTRICTLY PRESERVE: ${vision}` },
          { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } },
        ],
      },
    ],
  });

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
      const previewPath = `previews/${uid}/${id}.jpg`;
      const originalPreviewPath = `previews/${uid}/${id}-original.jpg`;

      await bucket.file(originalPath).save(originalBuffer, {
        metadata: { contentType: "image/jpeg" },
      });

      const watermarkSvg = buildWatermarkSvg("GLOWUP PREVIEW");
      const previewBuffer = await sharp(enhancedBuffer)
        .composite([
          {
            input: watermarkSvg,
            gravity: "center",
            tile: true,
            blend: "overlay",
          },
        ])
        .jpeg({ quality: 92 })
        .toBuffer();

      const originalPreviewBuffer = await sharp(originalBuffer)
        .resize({ width: 1600, height: 1600, fit: "inside" })
        .composite([
          {
            input: watermarkSvg,
            gravity: "center",
            tile: true,
            blend: "overlay",
          },
        ])
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

      // Handle specific known errors
      if (error.message?.includes("Gemini")) {
        throw new HttpsError("internal", "AI processing failed. Please try again.");
      }

      if (error.message?.includes("sharp")) {
        throw new HttpsError("internal", "Image processing failed. Please try a different image.");
      }

      // Default generic error
      throw new HttpsError("internal", "Something went wrong. Please try again later.");
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

      const ref = db.doc(`users/${uid}/glowups/${glowupId}`);
      const snap = await ref.get();
      if (!snap.exists) {
        throw new HttpsError("not-found", "Glowup not found.");
      }
      const data = snap.data() as any;
      const originalPath = data.originalPath as string | undefined;
      if (!originalPath) {
        throw new HttpsError("failed-precondition", "Original file missing.");
      }

      const file = bucket.file(originalPath);
      const expires = Date.now() + 24 * 60 * 60 * 1000;
      const [downloadUrl] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires,
      });

      await ref.update({
        status: "unlocked",
        downloadUrl,
        paystackReference: reference,
        unlockedAt: new Date(),
      });

      logger.info("Glowup unlocked", { uid, glowupId });

      return { downloadUrl };
    } catch (error: any) {
      logger.error("Error in verifyAndUnlock", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Verification failed. Please contact support.");
    }
  }
);
