
export const fetchQuestions = async (examType, year, subjects) => {
  try {
    const params = new URLSearchParams({
      examType: examType || "",
      year: year ? String(year) : "",
      subjects: JSON.stringify(subjects || []),
    });

    const res = await fetch(`/api/questions?${params.toString()}`);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const error = new Error(
        data?.message || "We couldn't load the questions for this selection.",
      );
      error.status = res.status;
      throw error;
    }

    const data = await res.json();
    return data || null;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const savePracticeResult = async (payload) => {
  const res = await fetch("/api/practice-results", {
    method: "POST",
    // The API authenticates with Supabase's same-origin auth cookies. Be
    // explicit so proxies/browsers that default to `omit` do not drop them.
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(
      data?.message || "Failed to save practice result",
    );
    error.status = res.status;
    throw error;
  }

  return data;
};

async function requestAiJson(url, options = {}) {
  const res = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(
      data?.message || "The AI service is unavailable right now.",
    );
    error.status = res.status;
    error.code = data?.code;
    error.usage = data?.usage;
    throw error;
  }

  return data;
}

export const fetchStudyAssistantUsage = async (options = {}) => {
  return requestAiJson("/api/ai/study-assistant", {
    method: "GET",
    signal: options.signal,
  });
};

export const sendStudyAssistantMessage = async (payload, options = {}) => {
  return requestAiJson("/api/ai/study-assistant", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options.signal,
  });
};

export const fetchAskAiUsage = async (options = {}) => {
  return requestAiJson("/api/ai/question-explanation", {
    method: "GET",
    signal: options.signal,
  });
};

export const sendQuestionExplanation = async (payload, options = {}) => {
  return requestAiJson("/api/ai/question-explanation", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options.signal,
  });
};

export const postQuestions = async (form) => {
  try {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to save question");
    }

    return data;
  } catch (error) {
    console.error("Post Question Error:", error.message);
    return { success: false, message: error.message };
  }
};

// fetch news from server

export const fetchNews = async () => {
  try {
    const url = "https://education-news.onrender.com/api/news";
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return null;
  }
};
  
  