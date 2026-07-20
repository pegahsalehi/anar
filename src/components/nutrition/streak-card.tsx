import type { ReactNode } from "react";
import { CalendarCheck, TrendingUp, Zap } from "lucide-react";
import type { WeekDayActivity } from "@/features/today/streaks";
import { formatInteger } from "@/lib/format";
import { cn } from "@/lib/utils";

type StreakCardProps = {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  weekDays: WeekDayActivity[];
};

export function StreakCard({
  currentStreak,
  longestStreak,
  activeDays,
  weekDays,
}: StreakCardProps) {
  const dayLabel = currentStreak === 1 ? "DAY" : "DAYS";
  const message = getMotivationalMessage(currentStreak);

  return (
    <article
      aria-label={`Logging streak: ${formatInteger(currentStreak)} ${dayLabel.toLowerCase()}`}
      className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[#07111F] p-3.5 text-white shadow-[0_16px_34px_rgb(16_42_67_/_0.2),0_0_26px_rgb(85_220_164_/_0.08)] sm:rounded-[22px] sm:p-5 lg:px-6 lg:py-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(85, 220, 164, 0.16) 0%, rgba(85, 220, 164, 0) 28%), linear-gradient(315deg, rgba(226, 231, 228, 0.1) 0%, rgba(226, 231, 228, 0) 30%), #07111F",
      }}
    >
      <StreakDecorations />
      <div className="relative z-10 grid gap-4 sm:gap-5 lg:grid-cols-[1fr_14rem] lg:items-center lg:gap-6">
        <div className="min-w-0">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#55DCA4]/[0.5] bg-[#55DCA4]/10 text-[#7CF7C3] shadow-[0_0_20px_rgb(85_220_164_/_0.24)] sm:h-14 sm:w-14">
              <Zap aria-hidden="true" className="h-5 w-5 fill-current sm:h-7 sm:w-7" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-tight sm:text-2xl">
                Logging streak
              </h2>
              <p className="mt-1 max-w-2xl text-xs font-normal leading-5 text-white/60 sm:mt-1.5 sm:text-[0.95rem] sm:leading-6">
                {message}
              </p>
            </div>
          </div>

          <ol className="relative mt-4 grid grid-cols-7 gap-1 sm:mt-5 sm:gap-2">
            <span
              aria-hidden="true"
              className="absolute left-[7.14%] right-[7.14%] top-2.5 h-px bg-white/[0.15]"
            />
            {weekDays.map((day, index) => (
              <li
                aria-label={`${day.label} ${day.date}: ${
                  day.isComplete ? "completed" : "not completed"
                }${day.isToday ? ", today" : ""}`}
                className="relative z-10 flex flex-col items-center gap-2"
                key={`${day.date}-${index}`}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border text-xs font-medium transition sm:h-6 sm:w-6",
                    day.isComplete
                      ? "border-[#55DCA4] bg-[#55DCA4] text-[#07111F] shadow-[0_0_14px_rgb(85_220_164_/_0.36)]"
                      : "border-white/30 bg-[#07111F] text-transparent",
                    day.isToday && "ring-2 ring-white/30 ring-offset-2 ring-offset-[#07111F]",
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </span>
                <span className="text-xs font-medium text-white/[0.65]">
                  {day.label}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-4 flex flex-col gap-2 text-white/[0.64] sm:mt-5 sm:flex-row sm:items-center sm:gap-5">
            <StreakStat
              icon={<TrendingUp aria-hidden="true" className="h-4 w-4" strokeWidth={2} />}
              label="Longest streak"
              tone="green"
              value={formatInteger(longestStreak)}
            />
            <span aria-hidden="true" className="hidden h-7 w-px bg-white/[0.14] sm:block" />
            <StreakStat
              icon={<CalendarCheck aria-hidden="true" className="h-4 w-4" strokeWidth={2} />}
              label="Active days"
              tone="neutral"
              value={formatInteger(activeDays)}
            />
          </div>
        </div>

        <div className="border-t border-white/[0.12] pt-3 sm:pt-4 lg:border-l lg:border-t-0 lg:py-5 lg:pl-7">
          <p className="flex items-end gap-3 leading-none lg:justify-center">
            <span className="text-4xl font-semibold text-white sm:text-6xl">
              {formatInteger(currentStreak)}
            </span>
            <span className="pb-1 text-base font-semibold text-white/[0.66] sm:pb-1.5 sm:text-xl">
              {dayLabel}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}

function StreakStat({
  icon,
  label,
  tone,
  value,
}: {
  icon: ReactNode;
  label: string;
  tone: "green" | "neutral";
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md sm:h-8 sm:w-8",
          tone === "green"
            ? "bg-[#55DCA4]/[0.12] text-[#75F1BD]"
            : "bg-white/[0.08] text-white/[0.74]",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 text-xs font-medium sm:text-[0.95rem]">{label}</span>
      <strong className="shrink-0 text-base font-semibold text-white sm:text-xl">{value}</strong>
    </div>
  );
}

function StreakDecorations() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 960 260"
    >
      <path d="M0 225 C150 196 280 230 431 204 C622 171 754 198 960 176 L960 260 L0 260 Z" fill="#55DCA4" opacity="0.035" />
      <path d="M758 0 C805 54 883 45 960 31 L960 0 Z" fill="#E2E7E4" opacity="0.055" />
      <path d="M0 0 L185 0 C124 42 58 48 0 30 Z" fill="#55DCA4" opacity="0.05" />
      <path d="M870 68 L874 77 L884 81 L874 85 L870 95 L866 85 L856 81 L866 77 Z" fill="#75F1BD" opacity="0.48" />
      <path d="M906 120 L910 129 L919 133 L910 137 L906 146 L902 137 L893 133 L902 129 Z" fill="#E2E7E4" opacity="0.34" />
      <path d="M52 178 L55 185 L62 188 L55 191 L52 199 L49 191 L42 188 L49 185 Z" fill="#75F1BD" opacity="0.46" />
    </svg>
  );
}

function getMotivationalMessage(currentStreak: number) {
  if (currentStreak === 0) {
    return "Log one food today to start your journey.";
  }

  if (currentStreak === 1) {
    return "Nice start. Log again tomorrow to keep the streak alive.";
  }

  return "You are building momentum. Keep showing up today.";
}
