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

export const JAMB_COMPULSORY_SUBJECT = "English";
export const JAMB_REQUIRED_SUBJECT_COUNT = 4;

export function getMaxSubjectsForExamType(examType) {
  return examType === "JAMB" || examType === "POST-UTME" ? 4 : 1;
}

export function isJambExamType(value) {
  return (
    typeof value === "string" && value.trim().toUpperCase() === "JAMB"
  );
}

/**
 * Normalizes a subject selection before it is used by the UI or the API.
 *
 * JAMB candidates must offer English plus exactly three other subjects. Older
 * links may contain three non-English subjects, so English is added when that
 * keeps the list at exactly four. Any other invalid JAMB combination is
 * rejected instead of being silently changed.
 */
export function normalizeExamSubjects(rawSubjects, examType) {
  if (!Array.isArray(rawSubjects)) {
    return { ok: false, message: "subjects must be an array." };
  }

  const normalizedExamType =
    typeof examType === "string" ? examType.trim().toUpperCase() : "";
  const subjects = [];
  const subjectKeys = new Set();

  for (const rawSubject of rawSubjects) {
    const subject = toSupportedSubject(rawSubject);

    if (!subject) {
      return { ok: false, message: "subjects contains an invalid subject." };
    }

    const key = normalizeSubjectKey(subject);

    // Deduplicate case/whitespace variants instead of storing them twice.
    if (subjectKeys.has(key)) continue;

    subjectKeys.add(key);
    subjects.push(subject);
  }

  if (isJambExamType(normalizedExamType)) {
    const englishKey = normalizeSubjectKey(JAMB_COMPULSORY_SUBJECT);

    if (!subjectKeys.has(englishKey)) {
      subjectKeys.add(englishKey);
      subjects.unshift(JAMB_COMPULSORY_SUBJECT);
    }

    if (subjects.length !== JAMB_REQUIRED_SUBJECT_COUNT) {
      return {
        ok: false,
        message:
          "JAMB requires English plus exactly three other subjects.",
      };
    }

    // Keep English first so the UI and session records are predictable.
    const englishIndex = subjects.findIndex(
      (subject) => normalizeSubjectKey(subject) === englishKey,
    );

    if (englishIndex > 0) {
      const [english] = subjects.splice(englishIndex, 1);
      subjects.unshift(english);
    }

    return {
      ok: true,
      subjects,
      requiredCount: JAMB_REQUIRED_SUBJECT_COUNT,
    };
  }

  const maxAllowed = getMaxSubjectsForExamType(normalizedExamType);

  if (subjects.length === 0) {
    return { ok: false, message: "At least one subject is required." };
  }

  if (subjects.length > maxAllowed) {
    return {
      ok: false,
      message: `${normalizedExamType || "This exam"} allows at most ${maxAllowed} subject${
        maxAllowed === 1 ? "" : "s"
      }.`,
    };
  }

  return { ok: true, subjects, requiredCount: null };
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
