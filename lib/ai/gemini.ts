import { GoogleGenAI } from "@google/genai";

import { GEMINI_TIMEOUT_MS, getGeminiSettings } from "./config";
import type { ChatMessage } from "./messages";
import { toGeminiContents } from "./messages";

export type AiErrorKind =
  | "config"
  | "model"
  | "rate_limited"
  | "unavailable"
  | "empty";

export class AiServiceError extends Error {
  kind: AiErrorKind;

  constructor(kind: AiErrorKind, message: string) {
    super(message);
    this.name = "AiServiceError";
    this.kind = kind;
  }
}

let cachedClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

function getClient(apiKey: string) {
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
  }

  return cachedClient;
}

function readProviderStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;

  const record = error as Record<string, unknown>;
  const candidates = [record.status, record.code, record.statusCode];

  for (const candidate of candidates) {
    const status = Number(candidate);

    if (Number.isInteger(status) && status >= 100 && status < 600) {
      return status;
    }
  }

  return null;
}

function toAiServiceError(error: unknown, providerMessage: string) {
  const status = readProviderStatus(error);

  if (
    status === 401 ||
    status === 403 ||
    /api key.*(invalid|not valid|missing)/i.test(providerMessage)
  ) {
    return new AiServiceError(
      "config",
      "The AI service is not configured correctly.",
    );
  }

  if (
    status === 404 ||
    /model.*(not found|not available|unsupported|does not exist)/i.test(
      providerMessage,
    )
  ) {
    return new AiServiceError(
      "model",
      "The configured AI model is not available to this API key.",
    );
  }

  if (status === 429) {
    return new AiServiceError(
      "rate_limited",
      "The AI service is busy right now.",
    );
  }

  return new AiServiceError(
    "unavailable",
    "The AI service is temporarily unavailable.",
  );
}

export async function generateTutorReply({
  messages,
  systemInstruction,
}: {
  messages: ChatMessage[];
  systemInstruction: string;
}) {
  const { apiKey, model } = getGeminiSettings();

  if (!apiKey) {
    throw new AiServiceError(
      "config",
      "The AI service is not configured yet.",
    );
  }

  const contents = toGeminiContents(messages);

  if (contents.length === 0) {
    throw new AiServiceError("empty", "A student message is required.");
  }

  try {
    const response = await getClient(apiKey).models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
        maxOutputTokens: 1800,
        abortSignal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      },
    });

    const text = response.text?.trim();

    if (!text) {
      throw new AiServiceError(
        "unavailable",
        "The AI service returned an empty response.",
      );
    }

    return { text, model };
  } catch (error) {
    if (error instanceof AiServiceError) {
      throw error;
    }

    const status = readProviderStatus(error);
    const providerMessage =
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : "";

    if (
      status === 408 ||
      status === 504 ||
      (error &&
        typeof error === "object" &&
        "name" in error &&
        ["TimeoutError", "AbortError"].includes(String(error.name))) ||
      /timed? ?out|timeout|aborted/i.test(providerMessage)
    ) {
      console.error("Gemini request timed out:", { model });

      throw new AiServiceError(
        "unavailable",
        "The AI service took too long to respond.",
      );
    }

    console.error("Gemini request failed:", {
      status,
      model,
      message: providerMessage
        .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[redacted]")
        .slice(0, 500),
    });

    throw toAiServiceError(error, providerMessage);
  }
}
