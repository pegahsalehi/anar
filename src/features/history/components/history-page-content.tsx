"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { CalendarPreview } from "@/components/history/calendar-preview";
import { WeeklyProgressChart } from "@/components/history/weekly-progress-chart";
import {
  getHistoryDayDetailsAction,
  type HistoryDayDetailsResult,
} from "@/features/history/actions";
import type { WeeklyProgressData } from "@/features/history/types";
import type { LogDayStats } from "@/features/today/streaks";
import { StreakCard } from "@/components/nutrition/streak-card";

type HistoryPageContentProps = {
  activeDates: string[];
  activeDateCounts?: Record<string, number>;
  selectedDate?: string;
  streak: LogDayStats;
  weeklyProgress: WeeklyProgressData;
};

type DayDetailsState =
  | { status: "idle"; date: null; result: null }
  | { status: "loading"; date: string; result: null }
  | { status: "success"; date: string; result: HistoryDayDetailsResult }
  | { status: "error"; date: string; result: HistoryDayDetailsResult };

export function HistoryPageContent({
  activeDates,
  activeDateCounts,
  selectedDate,
  streak,
  weeklyProgress,
}: HistoryPageContentProps) {
  const [details, setDetails] = useState<DayDetailsState>({
    status: "idle",
    date: null,
    result: null,
  });
  const previousFocusRef = useRef<HTMLElement | null>(null);

  async function openDayDetails(date: string) {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setDetails({ status: "loading", date, result: null });

    const result = await getHistoryDayDetails(date);

    setDetails({
      status: result.error ? "error" : "success",
      date,
      result,
    });
  }

  function closeDayDetails() {
    setDetails({ status: "idle", date: null, result: null });
    window.requestAnimationFrame(() => previousFocusRef.current?.focus());
  }

  return (
    <>
      <StreakCard {...streak} />
      <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
        <CalendarPreview
          activeDateCounts={activeDateCounts}
          activeDates={activeDates}
          onDateSelect={openDayDetails}
          selectedDate={selectedDate}
          weekStartsOn={weeklyProgress.weekStartsOn}
        />
        <WeeklyProgressChart data={weeklyProgress} onDateSelect={openDayDetails} />
      </div>
      {details.status !== "idle" ? (
        <HistoryDayDetailsDialog
          details={details}
          onClose={closeDayDetails}
          onRetry={openDayDetails}
        />
      ) : null}
    </>
  );
}

function HistoryDayDetailsDialog({
  details,
  onClose,
  onRetry,
}: {
  details: Exclude<DayDetailsState, { status: "idle" }>;
  onClose: () => void;
  onRetry: (date: string) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = "history-day-details-title";
  const isLoading = details.status === "loading";
  const hasError = details.status === "error";
  const logs = details.result?.logs ?? [];

  useEffect(() => {
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      onClose();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }

    const focusable = getFocusableElements(dialogRef.current);
    const first = focusable[0];
    const last = focusable.at(-1);

    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 px-[max(0.75rem,env(safe-area-inset-left))] py-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))] [padding-right:max(0.75rem,env(safe-area-inset-right))] sm:px-4 sm:py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={handleKeyDown}
      role="dialog"
    >
      <div
        className="max-h-[min(28rem,calc(100svh-1.5rem))] w-full max-w-[20rem] overflow-hidden rounded-md border border-border bg-card shadow-soft sm:max-h-[min(32rem,calc(100svh-2rem))] sm:max-w-md"
        ref={dialogRef}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground" id={titleId}>
              {formatHistoryDate(details.date)}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Logged foods</p>
          </div>
          <button
            aria-label="Close day details"
            className="flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[min(18rem,calc(100svh-11rem))] overflow-y-auto px-4 py-2 sm:max-h-[22rem] sm:px-5 sm:py-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground" role="status">
              Loading foods...
            </p>
          ) : null}

          {hasError ? (
            <div className="space-y-3">
              <p
                className="rounded-md border border-coral/25 bg-coral/10 px-3 py-2 text-sm text-coral"
                role="alert"
              >
                {details.result?.error ?? "Food logs could not be loaded for this day."}
              </p>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onRetry(details.date)}
                type="button"
              >
                Retry
              </button>
            </div>
          ) : null}

          {details.status === "success" && logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No foods were logged on this day.</p>
          ) : null}

          {logs.length > 0 ? (
            <ul className="divide-y divide-border">
              {logs.map((log) => (
                <li className="flex min-w-0 items-baseline justify-between gap-4 py-2.5" key={log.id}>
                  <span className="min-w-0 break-words text-sm font-semibold text-card-foreground">
                    {log.foodName}
                  </span>
                  <span className="shrink-0 text-sm font-medium text-muted-foreground">
                    {log.gramLabel}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

async function getHistoryDayDetails(date: string) {
  try {
    return await getHistoryDayDetailsAction(date);
  } catch {
    return {
      date,
      logs: [],
      error: "Food logs could not be loaded for this day.",
    };
  }
}

function formatHistoryDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

function getFocusableElements(element: HTMLElement) {
  return Array.from(
    element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((item) => !item.hasAttribute("disabled") && !item.getAttribute("aria-hidden"));
}
