const jambScoreCalculator = (examYear, subject) => {
  const year = Number(examYear);

  // Normalize subject
  const normalizedSubject =
    typeof subject === "string" ? subject.trim().toLowerCase() : "";

  // Default score
  let score = 0;

  if (!Number.isNaN(year) && year > 2016) {
    // JAMB CBT scoring
    if (normalizedSubject === "english") {
      score = 1.67;
    } else {
      score = 2.5;
    }
  } else {
    // Pre-2017 or invalid year
    score = 2;
  }

  return score;
};

export default jambScoreCalculator;
