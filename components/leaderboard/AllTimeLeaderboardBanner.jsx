"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { formatLeaderboardScore } from "@/lib/leaderboard/format.mjs";
import { normalizeLeaderboardRows } from "@/lib/leaderboard/normalize.mjs";

const MEDALS = ["🥇", "🥈", "🥉"];

function PauseIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className="h-3 w-3"
      fill="currentColor"
    >
      <rect x="2" y="1.5" width="2.5" height="9" rx="0.6" />
      <rect x="7.5" y="1.5" width="2.5" height="9" rx="0.6" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className="h-3 w-3"
      fill="currentColor"
    >
      <path d="M3 1.8v8.4a.6.6 0 0 0 .92.5l6.1-4.2a.6.6 0 0 0 0-1l-6.1-4.2a.6.6 0 0 0-.92.5Z" />
    </svg>
  );
}

function LeaderboardGroup({
  entries,
  hidden = false,
  withTrailingGap = false,
  style,
}) {
  return (
    <ol
      aria-hidden={hidden || undefined}
      style={style}
      className={`flex shrink-0 items-center justify-between gap-4 sm:gap-6 ${
        withTrailingGap ? "pr-4 sm:pr-6" : ""
      }`}
    >
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;

        return (
          <li
            key={`${entry.name}-${entry.score}-${entry.total}-${index}`}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-[11px] font-medium text-white/95 sm:text-xs">
              <span className="sr-only">Rank {index + 1}: </span>
              {MEDALS[index] ? (
                <span aria-hidden="true">{MEDALS[index]}</span>
              ) : null}
              {entry.name}{" "}
              <span aria-hidden="true" className="text-blue-300">
                —
              </span>{" "}
              <span className="tabular-nums text-white/80">
                {formatLeaderboardScore(entry)}
              </span>
            </span>
            {!isLast ? (
              <span aria-hidden="true" className="text-blue-300">
                •
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function LoadingEntries() {
  return (
    <div
      className="flex items-center gap-4 sm:gap-6"
      aria-hidden="true"
    >
      {[72, 92, 64].map((width, index) => (
        <span
          key={index}
          className="h-2.5 animate-pulse rounded-full bg-white/20"
          style={{ width }}
        />
      ))}
    </div>
  );
}

export default function AllTimeLeaderboardBanner() {
  const pathname = usePathname() || "";
  const isHiddenRoute =
    pathname === "/question" ||
    pathname.startsWith("/question/") ||
    pathname === "/admin007" ||
    pathname.startsWith("/admin007/");

  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("loading");
  const [isPaused, setIsPaused] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const viewportRef = useRef(null);

  const loadLeaderboard = useCallback(async (signal) => {
    setStatus("loading");
    setEntries([]);

    try {
      const response = await fetch("/api/leaderboard", { signal });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.message || "Unable to load the all-time leaderboard.",
        );
      }

      if (signal?.aborted) return;

      setEntries(
        normalizeLeaderboardRows(payload.leaderboard, {
          preserveOrder: true,
        }),
      );
      setStatus("success");
    } catch (error) {
      if (error?.name === "AbortError" || signal?.aborted) return;

      setEntries([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (isHiddenRoute) return undefined;

    const controller = new AbortController();
    loadLeaderboard(controller.signal);

    return () => controller.abort();
  }, [isHiddenRoute, loadLeaderboard]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener?.("change", update);

    return () => mediaQuery.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      setViewportWidth(0);
      return undefined;
    }

    const update = () => setViewportWidth(viewport.clientWidth);

    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [entries, status]);

  if (isHiddenRoute) return null;

  const hasEntries = entries.length > 0;
  const canAnimate = hasEntries && entries.length > 1 && !reducedMotion;
  const groupStyle = viewportWidth
    ? { minWidth: `${viewportWidth}px` }
    : undefined;

  return (
    <section
      aria-label="All-Time Leading JAMB Scores"
      className="leaderboard-banner border-b border-blue-900/30 bg-blue-800 text-white"
      aria-busy={status === "loading"}
    >
      <div className="mx-auto flex h-10 w-full max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <p className="shrink-0 whitespace-nowrap rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold leading-none text-white sm:text-[11px]">
          All-Time Leading JAMB Scores:
        </p>

        {status === "loading" ? (
          <>
            <span className="sr-only">Loading all-time JAMB scores</span>
            <div className="min-w-0 flex-1 overflow-hidden">
              <LoadingEntries />
            </div>
          </>
        ) : status === "error" ? (
          <div
            className="flex min-w-0 flex-1 items-center gap-2"
            role="status"
          >
            <p className="truncate text-[11px] text-blue-100 sm:text-xs">
              Scores are unavailable right now.
            </p>
            <button
              type="button"
              onClick={() => loadLeaderboard()}
              className="shrink-0 rounded-full border border-white/30 px-2 py-0.5 text-[10px] font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Retry
            </button>
          </div>
        ) : !hasEntries ? (
          <p
            role="status"
            className="min-w-0 flex-1 truncate text-[11px] text-blue-100 sm:text-xs"
          >
            No qualifying JAMB scores yet.
          </p>
        ) : (
          <>
            <div
              ref={viewportRef}
              className={`relative min-w-0 flex-1 ${
                canAnimate
                  ? "leaderboard-viewport overflow-hidden"
                  : "hide-scrollbar overflow-x-auto"
              }`}
            >
              <div
                className={
                  canAnimate
                    ? `leaderboard-track ${
                        isPaused ? "leaderboard-track--paused" : ""
                      }`
                    : "flex w-max min-w-full items-center"
                }
              >
                <LeaderboardGroup
                  entries={entries}
                  style={groupStyle}
                  withTrailingGap={canAnimate}
                />
                {canAnimate ? (
                  <LeaderboardGroup
                    entries={entries}
                    hidden
                    style={groupStyle}
                    withTrailingGap
                  />
                ) : null}
              </div>
            </div>

            {canAnimate ? (
              <button
                type="button"
                onClick={() => setIsPaused((previous) => !previous)}
                aria-label={
                  isPaused
                    ? "Resume leaderboard animation"
                    : "Pause leaderboard animation"
                }
                title={isPaused ? "Resume" : "Pause"}
                className="leaderboard-pause inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 text-white/90 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                {isPaused ? <PlayIcon /> : <PauseIcon />}
              </button>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
