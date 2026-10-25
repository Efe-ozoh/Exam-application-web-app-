export const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";

export const AI_STUDY_DAILY_LIMIT = 5;
export const AI_ASK_DAILY_LIMIT = 3;
export const AI_COOLDOWN_SECONDS = 3;
export const GEMINI_TIMEOUT_MS = 30000;

export const MAX_CONTEXT_MESSAGES = 6;
export const MAX_STUDY_HISTORY_MESSAGES = MAX_CONTEXT_MESSAGES - 1;
export const MAX_QUESTION_CONTEXT_MESSAGES = 4;
export const MAX_QUESTION_HISTORY_MESSAGES =
  MAX_QUESTION_CONTEXT_MESSAGES - 1;

export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_CONTEXT_CHARACTERS = 16000;

export const AI_TIME_ZONE = "Africa/Lagos";

export function getGeminiSettings() {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || null;
  const model =
    process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  return { apiKey, model };
}
