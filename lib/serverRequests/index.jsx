
export const fetchQuestions = async (examType, year, subjects) => {
  try {
    const params = new URLSearchParams({
      examType: examType || "",
      year: year ? String(year) : "",
      subjects: JSON.stringify(subjects || []),
    });

    const res = await fetch(`/api/questions?${params.toString()}`);

    if (!res.ok) return null;

    const data = await res.json();
    return data || null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const savePracticeResult = async (payload) => {
  const res = await fetch("/api/practice-results", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to save practice result");
  }

  return data;
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
  
  