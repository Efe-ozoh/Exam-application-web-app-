export const EXAM_MODE_MOCK = "Mock";
export const EXAM_MODE_PRACTICE = "Practice";
export const DEFAULT_EXAM_MODE = EXAM_MODE_PRACTICE;

export const EXAM_SESSION_STATUS_ACTIVE = "active";
export const EXAM_SESSION_STATUS_SUBMITTED = "submitted";
export const EXAM_SESSION_STATUS_ABANDONED = "abandoned";

export function normalizeExamMode(value) {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();

  if (normalized === "mock" || normalized === "exam") {
    return EXAM_MODE_MOCK;
  }

  if (normalized === "practice" || normalized === "practise") {
    return EXAM_MODE_PRACTICE;
  }

  return null;
}

export function isFormalExamMode(value) {
  return normalizeExamMode(value) === EXAM_MODE_MOCK;
}
