"use client";

import { useState } from "react";
import { postQuestions } from "@/lib/serverRequests";

 const AddQuestionClient =() => {
  const [loading, setLoading] = useState(false);

  const initialForm = {
    exam: "",
    subject: "",
    question: "",
    options: { A: "", B: "", C: "", D: "" },
    correctAnswer: "",
    year: "",
    imgUrl: "",
  };

  const [form, setForm] = useState(initialForm);

  const updateOption = (letter, value) => {
    setForm((prev) => ({
      ...prev,
      options: { ...prev.options, [letter]: value },
    }));
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.options[form.correctAnswer]) {
      alert("Correct answer must match a filled option");
      setLoading(false);
      return;
    }

    const payload = {
      exam: form.exam,
      subject: form.subject.trim(),
      question: form.question.trim(),
      options: form.options,
      answer: form.correctAnswer,
      year: form.year ? Number(form.year) : null,
      imgUrl: form.imgUrl || null,
    };

    const response = await postQuestions(payload);
    setLoading(false);

    if (response?.success) {
      alert("Question saved successfully!");
      setForm(initialForm);
    } else {
      alert(response?.message || "Failed to save question");
    }
  };

  const answers = ["A", "B", "C", "D"];
  const exams = [
    "JAMB",
    "WAEC",
    "NECO",
    "WAEC GCE",
    "NECO GCE",
    "NABTEB",
    "FUPRE 100LEVEL",
    "FUPRE GST",
    "UNIBEN POST-UTME",
    "UI POST-UTME",
    "DELSU",
  ];

  return (
    <div className="max-w-lg mx-auto px-5 py-20 mt-10">
      <h1 className="text-2xl font-bold mb-5">Add Exam Question</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          className="w-full border p-3 rounded"
          value={form.exam}
          onChange={(e) => updateField("exam", e.target.value)}
          required
        >
          <option value="">-- Choose Exam --</option>
          {exams.map((exam) => (
            <option key={exam} value={exam}>
              {exam}
            </option>
          ))}
        </select>

        <input
          className="w-full border p-3 rounded"
          placeholder="Subject (e.g. English)"
          value={form.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          required
        />

        <textarea
          className="w-full border p-3 rounded"
          placeholder="Question"
          value={form.question}
          onChange={(e) => updateField("question", e.target.value)}
          required
        />

        {answers.map((opt) => (
          <input
            key={opt}
            className="w-full border p-3 rounded"
            placeholder={`Option ${opt}`}
            value={form.options[opt]}
            onChange={(e) => updateOption(opt, e.target.value)}
            required
          />
        ))}

        <select
          className="w-full border p-3 rounded"
          value={form.correctAnswer}
          onChange={(e) => updateField("correctAnswer", e.target.value)}
          required
        >
          <option value="">-- Select Correct Answer --</option>
          {answers.map((ans) => (
            <option key={ans} value={ans}>
              {ans}
            </option>
          ))}
        </select>

        <input
          className="w-full border p-3 rounded"
          type="number"
          placeholder="Year (Optional)"
          value={form.year}
          onChange={(e) => updateField("year", e.target.value)}
        />

        <input
          className="w-full border p-3 rounded"
          type="url"
          placeholder="Image URL (Optional)"
          value={form.imgUrl}
          onChange={(e) => updateField("imgUrl", e.target.value)}
        />

        <button
          disabled={loading}
          className="bg-[#5A3EFB] text-white px-4 py-3 rounded w-full font-semibold"
        >
          {loading ? "Saving..." : "Save Question"}
        </button>
      </form>
    </div>
  );
}

export default AddQuestionClient;