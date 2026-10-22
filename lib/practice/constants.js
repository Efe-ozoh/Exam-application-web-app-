export const SUPPORTED_EXAM_TYPES = ["JAMB", "WAEC", "NECO"];

export const SUPPORTED_SUBJECTS = [
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Government",
  "Literature-in-English",
  "CRK",
  "Geography",
  "Agricultural Science",
  "Financial-Accounting",
  "Commerce",
];

export const MAX_ANSWERS = 500;

export function getMaxSubjectsForExamType(examType) {
  return examType === "JAMB" || examType === "POST-UTME" ? 4 : 1;
}

export function toSupportedExamType(value) {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toUpperCase();
  return SUPPORTED_EXAM_TYPES.includes(normalized) ? normalized : null;
}

export function toSupportedSubject(value) {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  return (
    SUPPORTED_SUBJECTS.find(
      (subject) => subject.toLowerCase() === normalized,
    ) ?? null
  );
}

export function normalizeSubjectKey(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}
