"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchStudyAssistantUsage,
  sendStudyAssistantMessage,
} from "@/lib/serverRequests/index";
import MarkdownMessage from "@/components/ai/MarkdownMessage";

const SUGGESTED_PROMPTS = [
  "Explain Newton's laws of motion.",
  "Help me understand quadratic equations.",
  "Explain the difference between mitosis and meiosis.",
  "Teach me how to solve probability questions.",
  "Explain the rules of subject-verb agreement.",
];

function UsageIndicator({ usage, isLoading, error }) {
  if (isLoading) {
    return (
      <div
        role="status"
        className="rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm text-slate-600"
      >
        Checking today&apos;s allowance...
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">Usage unavailable</p>
        <p className="mt-0.5 text-xs">{error || "We couldn't load your allowance."}</p>
      </div>
    );
  }

  const percentage = Math.min(
    100,
    Math.max(0, Math.round((usage.used / usage.limit) * 100)),
  );

  return (
    <div className="rounded-xl border border-blue-100 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-semibold text-slate-800">Daily messages</span>
        <span className="font-semibold text-blue-700">
          {usage.remaining} of {usage.limit} left
        </span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-100"
        role="progressbar"
        aria-label="Daily AI message allowance used"
        aria-valuemin={0}
        aria-valuemax={usage.limit}
        aria-valuenow={usage.used}
      >
        <div
          className={`h-full rounded-full transition-all ${
            usage.remaining === 0 ? "bg-amber-500" : "bg-blue-700"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        Resets at midnight in Nigeria.
      </p>
    </div>
  );
}

export default function StudyAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState(null);
  const [usageError, setUsageError] = useState("");
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  const nextIdRef = useRef(1);
  const chatAbortRef = useRef(null);
  const failedRequestRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchStudyAssistantUsage({ signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setUsage(data?.usage ?? null);
        setUsageError("");
      })
      .catch((requestError) => {
        if (controller.signal.aborted || requestError.name === "AbortError") {
          return;
        }

        setUsageError(
          requestError.message ||
            "We couldn't load your daily allowance. You can still try asking.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingUsage(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (messages.length === 0 && !isSending) return;

    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isSending]);

  const sendMessage = useCallback(
    async (rawMessage, retry = null) => {
      const text = String(rawMessage ?? "").trim();

      if (!text) return;

      if (isSending) return;

      if (usage && usage.remaining <= 0) {
        setError(
          "You've used all your AI Study Assistant messages for today. Please come back tomorrow.",
        );
        return;
      }

      const history = retry?.history
        ? retry.history
        : messages.slice(-5).map(({ role, content }) => ({ role, content }));

      if (!retry) {
        const userMessage = {
          id: `user-${nextIdRef.current++}`,
          role: "user",
          content: text,
        };
        setMessages((previous) => [...previous, userMessage]);
        failedRequestRef.current = null;
      }

      setInput("");
      setError("");
      setIsSending(true);

      const controller = new AbortController();
      chatAbortRef.current = controller;

      try {
        const data = await sendStudyAssistantMessage(
          { message: text, history },
          { signal: controller.signal },
        );

        if (controller.signal.aborted) return;

        const assistantMessage = {
          id: `assistant-${nextIdRef.current++}`,
          role: "assistant",
          content: data.message,
        };

        setMessages((previous) => [...previous, assistantMessage]);
        if (data.usage) setUsage(data.usage);
        setUsageError("");
        failedRequestRef.current = null;
      } catch (requestError) {
        if (controller.signal.aborted || requestError.name === "AbortError") {
          return;
        }

        setError(
          requestError.message ||
            "The AI tutor couldn't answer just now. Please try again.",
        );

        if (requestError.usage) setUsage(requestError.usage);

        if (requestError.status !== 429 && requestError.status !== 401) {
          failedRequestRef.current = { text, history };
        }
      } finally {
        if (chatAbortRef.current === controller) {
          chatAbortRef.current = null;
          setIsSending(false);
        }
      }
    },
    [isSending, messages, usage],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const handleNewChat = () => {
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    failedRequestRef.current = null;

    setMessages([]);
    setInput("");
    setError("");
    setIsSending(false);
  };

  const handleRetry = () => {
    const failed = failedRequestRef.current;

    if (!failed || isSending) return;

    void sendMessage(failed.text, failed);
  };

  const atLimit = Boolean(usage && usage.remaining <= 0);
  const isBusy = isSending || atLimit;

  return (
    <main className="min-h-screen bg-blue-50 px-4 pb-10 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="mt-1 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              AI Study Assistant
            </h1>
          </div>

          <button
            type="button"
            onClick={handleNewChat}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:w-auto"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            New Chat
          </button>
        </header>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="sm:order-1">
            <UsageIndicator
              usage={usage}
              isLoading={isLoadingUsage}
              error={usageError}
            />
          </div>
        </div>

        <section
          aria-label="Conversation"
          className="mt-5 flex h-[calc(100dvh-18rem)] min-h-[460px] flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm"
        >
          <div
            className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6"
            aria-live="polite"
          >
            {messages.length === 0 && !isSending ? (
              <div>
                <div className="rounded-2xl rounded-tl-sm border border-blue-100 bg-blue-50/70 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Hello! What would you like to understand today?
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    I can break down a topic, work through a calculation, or
                    help you practise a study skill. Pick a starter below or
                    type your own question.
                  </p>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      disabled={isBusy}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[88%] break-words rounded-2xl rounded-tr-sm bg-blue-700 px-4 py-3 text-sm text-white sm:max-w-[80%]">
                    <span className="sr-only">You said: </span>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-[11px] font-bold text-white"
                  >
                    AI
                  </span>
                  <div className="min-w-0 max-w-[88%] rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50 px-4 py-3 sm:max-w-[80%]">
                    <span className="sr-only">AI tutor said: </span>
                    <MarkdownMessage content={message.content} />
                  </div>
                </div>
              ),
            )}

            {isSending ? (
              <div className="flex items-start gap-3" role="status">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-[11px] font-bold text-white"
                >
                  AI
                </span>
                <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="sr-only">The AI tutor is thinking.</span>
                  <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600" />
                  </div>
                </div>
              </div>
            ) : null}

            <div ref={endRef} />
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
            {error ? (
              <div
                role="alert"
                className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                <p>{error}</p>
                {failedRequestRef.current ? (
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isSending}
                    className="mt-2 font-semibold underline underline-offset-2 transition hover:text-amber-950 disabled:opacity-60"
                  >
                    Try again
                  </button>
                ) : null}
              </div>
            ) : null}

            {atLimit && !error ? (
              <div
                role="status"
                className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                You&apos;ve reached today&apos;s limit of {usage.limit} messages.
                Your allowance resets tomorrow in Nigerian time.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
              <label htmlFor="study-assistant-message" className="sr-only">
                Ask the AI Study Assistant
              </label>
              <textarea
                id="study-assistant-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={4000}
                disabled={atLimit}
                placeholder={
                  atLimit
                    ? "Daily limit reached"
                    : "Ask a study question... (Shift + Enter for a new line)"
                }
                className="max-h-40 min-h-[52px] flex-1 resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={isBusy || !input.trim()}
                className="inline-flex h-[52px] shrink-0 items-center justify-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </form>

            <p className="mt-2 text-center text-[11px] text-slate-500">
              AI explanations can make mistakes. Check important facts with your
              textbook or teacher.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
