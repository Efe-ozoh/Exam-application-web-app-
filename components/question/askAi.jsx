"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MathJax } from "better-react-mathjax";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";

import MarkdownMessage from "@/components/ai/MarkdownMessage";
import {
  fetchAskAiUsage,
  sendQuestionExplanation,
} from "@/lib/serverRequests/index";

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function AskAi({ question, selectedAnswer }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(
    question?.answer ?? null,
  );

  const questionId = question?.id ?? null;
  const selectedAnswerRef = useRef(selectedAnswer);
  const abortRef = useRef(null);
  const usageAbortRef = useRef(null);
  const lastRequestRef = useRef(null);
  const nextIdRef = useRef(1);
  const endRef = useRef(null);
  const closeButtonRef = useRef(null);
  const triggerRef = useRef(null);
  const hasOpenedRef = useRef(false);
  const previousMessageCountRef = useRef(0);

  useEffect(() => {
    selectedAnswerRef.current = selectedAnswer;
  }, [selectedAnswer]);

  const requestExplanation = useCallback(
    async (targetQuestionId, message, history, appendUser) => {
      if (!targetQuestionId) return;

      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      setError("");
      setIsLoading(true);
      lastRequestRef.current = {
        questionId: targetQuestionId,
        message,
        history,
      };

      if (appendUser && message) {
        setMessages((previous) => [
          ...previous,
          {
            id: `user-${nextIdRef.current++}`,
            role: "user",
            content: message,
          },
        ]);
      }

      try {
        const data = await sendQuestionExplanation(
          {
            questionId: targetQuestionId,
            ...(message ? { message } : {}),
            history,
            selectedAnswer: selectedAnswerRef.current || undefined,
          },
          { signal: controller.signal },
        );

        if (controller.signal.aborted) return;

        if (data.correctAnswer) setCorrectAnswer(data.correctAnswer);

        if (data.usage) setUsage(data.usage);

        setMessages((previous) => [
          ...previous,
          {
            id: `assistant-${nextIdRef.current++}`,
            role: "assistant",
            content: data.explanation,
          },
        ]);
      } catch (requestError) {
        if (controller.signal.aborted || requestError.name === "AbortError") {
          return;
        }

        if (requestError.usage) setUsage(requestError.usage);

        setError(
          requestError.message ||
            "The AI tutor couldn't explain this question just now. Please try again.",
        );
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!open || !questionId) return undefined;

    previousMessageCountRef.current = 0;
    setMessages([]);
    setInput("");
    setError("");
    setUsage(null);
    setCorrectAnswer(question?.answer ?? null);

    const controller = new AbortController();
    usageAbortRef.current = controller;

    void fetchAskAiUsage({ signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted && data?.usage) {
          setUsage(data.usage);
        }
      })
      .catch((requestError) => {
        if (
          !controller.signal.aborted &&
          requestError.name !== "AbortError"
        ) {
          console.error("Ask AI usage fetch failed:", requestError);
        }
      })
      .finally(() => {
        if (usageAbortRef.current === controller) {
          usageAbortRef.current = null;
        }
      });

    return () => {
      controller.abort();
      usageAbortRef.current = null;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [open, questionId, question?.answer]);

  useEffect(() => {
    if (!open) return undefined;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        abortRef.current?.abort();
        usageAbortRef.current?.abort();
        abortRef.current = null;
        usageAbortRef.current = null;
        setIsLoading(false);
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      hasOpenedRef.current = true;
      return;
    }

    if (hasOpenedRef.current) {
      triggerRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (messages.length === 0) {
      previousMessageCountRef.current = 0;
      return;
    }

    if (messages.length > previousMessageCountRef.current || isLoading) {
      endRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    previousMessageCountRef.current = messages.length;
  }, [messages, isLoading, open]);

  if (!question) return null;

  const handleClose = () => {
    abortRef.current?.abort();
    usageAbortRef.current?.abort();
    abortRef.current = null;
    usageAbortRef.current = null;
    setIsLoading(false);
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const text = input.trim();

    if (!text || isLoading || !questionId || !canAsk) return;

    const history = messages.slice(-3).map(({ role, content }) => ({
      role,
      content,
    }));

    setInput("");
    void requestExplanation(questionId, text, history, true);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const handleRetry = () => {
    const last = lastRequestRef.current;

    if (!last || isLoading || !canAsk) return;

    void requestExplanation(
      last.questionId,
      last.message,
      last.history,
      false,
    );
  };

  const canAsk = !usage || usage.remaining > 0;
  const usageLabel = usage
    ? usage.remaining === 0
      ? "Daily Ask AI limit reached. It resets at midnight (Nigerian time)."
      : `${usage.remaining} of ${usage.limit} Ask AI explanations left today`
    : null;
  const resolvedAnswer = correctAnswer || question.answer || null;
  const answerOption = resolvedAnswer
    ? question.options?.[resolvedAnswer]
    : null;
  const explanationMessages = messages;

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={handleOpen}
        className="ml-4 flex items-center gap-1 text-gray-700 transition hover:text-blue-600 sm:ml-8"
      >
        <AutoAwesomeIcon className="text-blue-700" />
        <span className="hidden text-xl font-bold text-blue-700 sm:inline">
          Ask AI
        </span>
        <span className="sr-only sm:hidden">Ask AI about this question</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={handleClose}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ask-ai-title"
            className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-2xl bg-white shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-[min(480px,100vw)] md:rounded-none md:rounded-l-2xl"
          >
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                  {question.subject} &middot; {question.exam}{" "}
                  {question.year}
                </p>
                <h2
                  id="ask-ai-title"
                  className="mt-1 text-lg font-bold text-slate-900"
                >
                  Ask AI about this question
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Get a step-by-step explanation of the correct answer.
                </p>
              </div>

              <button
                type="button"
                ref={closeButtonRef}
                onClick={handleClose}
                aria-label="Close Ask AI"
                className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium leading-relaxed text-slate-900">
                  <MathJax dynamic>{question.question}</MathJax>
                </div>

                {question.imgUrl ? (
                  <img
                    src={question.imgUrl}
                    alt="Question illustration"
                    className="mt-3 max-h-56 w-full rounded-lg object-contain"
                    loading="lazy"
                  />
                ) : null}

                <ul className="mt-3 space-y-1.5">
                  {OPTION_LETTERS.map((letter) => {
                    const isCorrect = letter === resolvedAnswer;
                    const isSelected = letter === selectedAnswer;

                    return (
                      <li
                        key={letter}
                        className={`flex gap-2 rounded-lg border px-3 py-2 text-sm ${
                          isCorrect
                            ? "border-green-300 bg-green-50 text-green-900"
                            : isSelected
                              ? "border-red-300 bg-red-50 text-red-900"
                              : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <span className="font-bold">{letter}.</span>
                        <span className="min-w-0">
                          <MathJax dynamic inline>
                            {question.options?.[letter] ?? ""}
                          </MathJax>
                          {isCorrect ? (
                            <span className="ml-2 text-xs font-semibold uppercase">
                              Correct
                            </span>
                          ) : null}
                          {isSelected && !isCorrect ? (
                            <span className="ml-2 text-xs font-semibold uppercase">
                              Your answer
                            </span>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {resolvedAnswer ? (
                  <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
                    <span className="font-semibold">
                      Correct answer: {resolvedAnswer}.
                    </span>{" "}
                    {answerOption}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-900">
                  AI explanation
                </h3>
                {isLoading ? (
                  <span
                    className="text-xs font-medium text-blue-700"
                    role="status"
                  >
                    Thinking...
                  </span>
                ) : usageLabel ? (
                  <span
                    className={`text-right text-xs font-medium ${
                      usage.remaining === 0
                        ? "text-amber-700"
                        : "text-slate-500"
                    }`}
                  >
                    {usageLabel}
                  </span>
                ) : null}
              </div>

              {messages.length === 0 && !isLoading ? (
                <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm leading-relaxed text-blue-950">
                    Ask for a step-by-step explanation of this question, or
                    choose an option and ask why it is right or wrong.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      void requestExplanation(questionId, null, [], false)
                    }
                    disabled={!canAsk}
                    className="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Explain with AI
                  </button>
                </div>
              ) : null}

              <div className="mt-3 space-y-3">
                {explanationMessages.map((message) =>
                  message.role === "user" ? (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[88%] break-words rounded-2xl rounded-tr-sm bg-blue-700 px-3.5 py-2.5 text-sm text-white">
                        <span className="sr-only">You asked: </span>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={message.id}
                      className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3"
                    >
                      <span className="sr-only">AI tutor said: </span>
                      <MarkdownMessage content={message.content} />
                    </div>
                  ),
                )}

                {isLoading ? (
                  <div
                    className="rounded-2xl rounded-tl-sm border border-slate-200 bg-slate-50 px-4 py-3"
                    role="status"
                  >
                    <span className="sr-only">
                      The AI tutor is preparing an explanation.
                    </span>
                    <div
                      className="flex items-center gap-1.5"
                      aria-hidden="true"
                    >
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600" />
                    </div>
                  </div>
                ) : null}
              </div>

              {error ? (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                >
                  <p>{error}</p>
                  {canAsk ? (
                    <button
                      type="button"
                      onClick={handleRetry}
                      disabled={isLoading}
                      className="mt-2 font-semibold underline underline-offset-2 transition hover:text-amber-950 disabled:opacity-60"
                    >
                      Try again
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div ref={endRef} />
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
              <form onSubmit={handleSubmit} className="space-y-2">
                <label htmlFor="ask-ai-follow-up" className="sr-only">
                  Ask a follow-up question about this question
                </label>
                <textarea
                  id="ask-ai-follow-up"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  maxLength={4000}
                  disabled={isLoading || !canAsk}
                  placeholder={
                    canAsk
                      ? "Ask a follow-up, e.g. why is option C wrong?"
                      : "Daily Ask AI limit reached"
                  }
                  className="min-h-[64px] w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] leading-snug text-slate-500">
                    AI can make mistakes. Check important facts.
                  </p>
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim() || !canAsk}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
