import {
  MAX_CONTEXT_CHARACTERS,
  MAX_MESSAGE_LENGTH,
  MAX_QUESTION_HISTORY_MESSAGES,
  MAX_STUDY_HISTORY_MESSAGES,
} from "./config";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanContent(value: unknown, label: string): ParseResult<string> {
  if (typeof value !== "string") {
    return { ok: false, message: `${label} must be text.` };
  }

  const content = value.replace(/\u0000/g, "").trim();

  if (!content) {
    return { ok: false, message: `${label} cannot be empty.` };
  }

  if (content.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      message: `${label} is too long. Keep each message under ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  return { ok: true, value: content };
}

function parseHistory(
  value: unknown,
  maxMessages: number,
): ParseResult<ChatMessage[]> {
  if (value === undefined || value === null) {
    return { ok: true, value: [] };
  }

  if (!Array.isArray(value)) {
    return { ok: false, message: "history must be an array." };
  }

  if (value.length > maxMessages) {
    return {
      ok: false,
      message: `history can contain at most ${maxMessages} messages.`,
    };
  }

  const history: ChatMessage[] = [];
  let totalCharacters = 0;

  for (const entry of value) {
    if (!isRecord(entry)) {
      return { ok: false, message: "history contains an invalid message." };
    }

    if (entry.role !== "user" && entry.role !== "assistant") {
      return {
        ok: false,
        message: "history roles must be either user or assistant.",
      };
    }

    const content = cleanContent(entry.content, "A history message");

    if (!content.ok) {
      return content;
    }

    totalCharacters += content.value.length;
    history.push({ role: entry.role, content: content.value });
  }

  if (totalCharacters > MAX_CONTEXT_CHARACTERS) {
    return {
      ok: false,
      message: "The conversation history is too long.",
    };
  }

  return { ok: true, value: history };
}

function parseLatestMessage(value: unknown): ParseResult<string> {
  return cleanContent(value, "message");
}

export function parseStudyAssistantRequest(
  body: unknown,
): ParseResult<{ message: string; history: ChatMessage[] }> {
  if (!isRecord(body)) {
    return { ok: false, message: "A JSON body is required." };
  }

  const message = parseLatestMessage(body.message);

  if (!message.ok) {
    return message;
  }

  const history = parseHistory(
    body.history,
    MAX_STUDY_HISTORY_MESSAGES,
  );

  if (!history.ok) {
    return history;
  }

  return {
    ok: true,
    value: { message: message.value, history: history.value },
  };
}

export type QuestionAiRequest = {
  questionId: string;
  message: string | null;
  history: ChatMessage[];
  selectedAnswer: string | null;
};

export function parseQuestionAiRequest(
  body: unknown,
): ParseResult<QuestionAiRequest> {
  if (!isRecord(body)) {
    return { ok: false, message: "A JSON body is required." };
  }

  if (
    typeof body.questionId !== "string" ||
    !/^[a-f0-9]{24}$/i.test(body.questionId.trim())
  ) {
    return { ok: false, message: "A valid question ID is required." };
  }

  let message: string | null = null;

  if (body.message !== undefined && body.message !== null) {
    const parsedMessage = parseLatestMessage(body.message);

    if (!parsedMessage.ok) {
      return parsedMessage;
    }

    message = parsedMessage.value;
  }

  const history = parseHistory(
    body.history,
    MAX_QUESTION_HISTORY_MESSAGES,
  );

  if (!history.ok) {
    return history;
  }

  if (!message && history.value.length > 0) {
    return {
      ok: false,
      message: "A message is required when continuing a conversation.",
    };
  }

  let selectedAnswer: string | null = null;

  if (
    body.selectedAnswer !== undefined &&
    body.selectedAnswer !== null &&
    typeof body.selectedAnswer !== "string"
  ) {
    return {
      ok: false,
      message: "selectedAnswer must be A, B, C, or D.",
    };
  }

  if (typeof body.selectedAnswer === "string") {
    const normalized = body.selectedAnswer.trim().toUpperCase();

    if (normalized) {
      if (!["A", "B", "C", "D"].includes(normalized)) {
        return { ok: false, message: "selectedAnswer must be A, B, C, or D." };
      }

      selectedAnswer = normalized;
    }
  }

  return {
    ok: true,
    value: {
      questionId: body.questionId.trim().toLowerCase(),
      message,
      history: history.value,
      selectedAnswer,
    },
  };
}

export function toGeminiContents(messages: ChatMessage[]) {
  const trimmed = [...messages];

  while (trimmed.length > 0 && trimmed[0].role === "assistant") {
    trimmed.shift();
  }

  const merged: ChatMessage[] = [];

  for (const message of trimmed) {
    const previous = merged[merged.length - 1];

    if (previous && previous.role === message.role) {
      previous.content = `${previous.content}\n\n${message.content}`;
    } else {
      merged.push({ ...message });
    }
  }

  return merged.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
}
