import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getActiveExamSession } from "@/lib/exam/sessions";
import { createClient } from "@/lib/supabase/server";
import StudyAssistant from "./client/StudyAssistant";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Study Assistant | Eduliver",
  description:
    "Ask academic questions and get patient, step-by-step explanations from the Eduliver AI Study Assistant.",
};

function AssistantNotice({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="min-h-screen bg-blue-50 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm sm:p-8">
        <div
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}

export default async function StudyAssistantPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/study-assistant");
  }

  const activeExam = await getActiveExamSession(supabase, user.id);

  if (!activeExam.ok) {
    return (
      <AssistantNotice
        title="AI Study Assistant unavailable"
        message={
          activeExam.missingMigration
            ? "AI exam protection is not configured yet. Please ask an administrator to apply the latest Supabase migration."
            : "We couldn't verify whether you have an examination in progress. Please try again shortly."
        }
      />
    );
  }

  if (activeExam.session) {
    return (
      <AssistantNotice
        title="AI Study Assistant is locked"
        message="You have an examination in progress. Finish and submit the examination first; the AI tutor will unlock as soon as your submission is saved."
      />
    );
  }

  return <StudyAssistant />;
}
