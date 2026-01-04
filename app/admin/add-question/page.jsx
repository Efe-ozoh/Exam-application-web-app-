"use client";

import { useState } from "react";
import { postQuestions } from "@/lib/serverRequests";

export default function AddQuestionPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    exam: "",
    subject: "",
    question: "",
    options: {
      A: "",
      B: "",
      C: "",
      D: "",
    },
    correctAnswer: "",
    year: "",
    imgUrl: "",
  });

  function updateOption(letter, value) {
    setForm((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [letter]: value,
      },
    }));
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await postQuestions(form);

    setLoading(false);

    if (response?.success) {
      alert("Question saved successfully!");
      setForm({
        exam: "",
        subject: "",
        question: "",
        options: { A: "", B: "", C: "", D: "" },
        correctAnswer: "",
        year: "",
        imgUrl: "",
      });
    } else {
      alert(response?.message || "Failed to save question");
    }
  };

  const answers = ["A", "B", "C", "D"];
  const exams = ["JAMB", "WAEC", "NECO","WAEC GCE", "NECO GCE", "NABTEB","FUPRE 100LEVEL", "FUPRE GST", "UNIBEN POST-UTME", "UI POST-UTME", "DELSU"]

  return (
    <div className="max-w-lg mx-auto px-5 py-20 mt-10">
      <h1 className="text-2xl font-bold mb-5">Add UTME Question</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
       <select
          className="w-full border p-3 rounded"
          value={form.exam}
          onChange={(e) => updateField("exam", e.target.value)}
          required
        >
          <option value="">-- Choose Exam e.g (JAMB) --</option>
          {exams.map((exam) => (
            <option key={exam} value={exam}>
              {exam}
            </option>
          ))}
        </select>

        <input
          className="w-full border p-3 rounded"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => updateField("subject", e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
          required
        />

        <textarea
          className="w-full border p-3 rounded"
          placeholder="Question"
          value={form.question}
          onChange={(e) => updateField("question", e.target.value)}
          required
        />

        <input
          className="w-full border p-3 rounded"
          placeholder="Option A"
          value={form.options.A}
          onChange={(e) => updateOption("A", e.target.value)}
          required
        />

        <input
          className="w-full border p-3 rounded"
          placeholder="Option B"
          value={form.options.B}
          onChange={(e) => updateOption("B", e.target.value)}
          required
        />

        <input
          className="w-full border p-3 rounded"
          placeholder="Option C"
          value={form.options.C}
          onChange={(e) => updateOption("C", e.target.value)}
          required
        />

        <input
          className="w-full border p-3 rounded"
          placeholder="Option D"
          value={form.options.D}
          onChange={(e) => updateOption("D", e.target.value)}
          required
        />

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
