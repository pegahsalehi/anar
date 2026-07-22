"use client";

import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeekStartsOn } from "@/lib/dates";

type CalendarPreviewProps = {
  selectedDate?: string;
  activeDates?: string[];
  activeDateCounts?: Record<string, number>;
  onDateSelect?: (date: string) => void;
  weekStartsOn?: WeekStartsOn;
};

const weekDaysByStart: Record<WeekStartsOn, string[]> = {
  sunday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  monday: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export function CalendarPreview({
  selectedDate,
  activeDates = [],
  activeDateCounts = {},
  onDateSelect,
  weekStartsOn = "monday",
}: CalendarPreviewProps) {
  const selected = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
  const year = selected.getFullYear();
  const month = selected.getMonth();
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(selected);
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = getLeadingDays(firstDay, weekStartsOn);
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
  const activeDateSet = new Set(activeDates);
  const today = toLocalISODate(new Date());
  const weekDays = weekDaysByStart[weekStartsOn];
  const handleDateSelect = onDateSelect;

  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="font-semibold text-card-foreground">{monthLabel}</h2>
        {selectedDate ? <p className="mt-1 text-xs text-muted-foreground">{selectedDate}</p> : null}
      </div>
      <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2">
        {Array.from({ length: totalCells }, (_, index) => {
          const day = index - leadingDays + 1;
          const isDisabled = day <= 0 || day > daysInMonth;
          const date = isDisabled ? "" : toLocalISODate(new Date(year, month, day));
          const isToday = date === today;
          const isSelected = Boolean(selectedDate && date === selectedDate);
          const hasLog = activeDateSet.has(date);
          const loggedFoodCount = hasLog ? activeDateCounts[date] ?? 1 : 0;
          const canSelectDate = hasLog && handleDateSelect;
          const isInteractive = Boolean(canSelectDate);
          const dateLabel = isDisabled
            ? ""
            : formatCalendarDateLabel(new Date(year, month, day));
          const loggedFoodLabel = `${loggedFoodCount} logged ${loggedFoodCount === 1 ? "food" : "foods"}`;
          const interactiveLabel = `${dateLabel}, ${loggedFoodLabel}. View details.`;
          const tooltip = `${loggedFoodLabel} - View details`;
          const className = cn(
            "relative flex aspect-square items-center justify-center rounded-md border border-transparent text-sm font-semibold transition",
            isDisabled && "bg-transparent text-muted-foreground/35",
            !isDisabled && !hasLog && "bg-surface-muted text-foreground",
            hasLog && "bg-primary/15 text-foreground ring-1 ring-primary/30",
            isInteractive &&
              "cursor-pointer hover:bg-primary/20 hover:ring-primary/50 hover:shadow-sm active:scale-[0.98] active:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
            isToday && "border-primary",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary",
          );

          if (canSelectDate) {
            return (
              <button
                aria-label={interactiveLabel}
                className={className}
                key={`${index}-${day}`}
                onClick={() => canSelectDate(date)}
                title={tooltip}
                type="button"
              >
                <span className="relative z-10">{day}</span>
                <LoggedDayDot isSelected={isSelected} />
              </button>
            );
          }

          return (
            <div
              aria-label={isDisabled ? undefined : dateLabel}
              className={className}
              key={`${index}-${day}`}
              title={hasLog ? tooltip : undefined}
            >
              {isDisabled ? "" : <span className="relative z-10">{day}</span>}
              {hasLog ? <LoggedDayDot isSelected={isSelected} /> : null}
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          Logged
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border border-primary" />
          Today
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Eye aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="sm:hidden">Tap a logged day to view foods</span>
          <span className="hidden sm:inline">Click a logged day to view foods</span>
        </span>
      </div>
    </section>
  );
}

function LoggedDayDot({ isSelected }: { isSelected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full shadow-sm ring-1 ring-card",
        isSelected ? "bg-card" : "bg-primary",
      )}
    />
  );
}

function toLocalISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCalendarDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getLeadingDays(date: Date, weekStartsOn: WeekStartsOn) {
  const day = date.getDay();
  return weekStartsOn === "sunday" ? day : (day + 6) % 7;
}
