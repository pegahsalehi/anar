"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  WeeklyProgressData,
  WeeklyProgressMetric,
  WeeklyProgressMetricValue,
  WeeklyProgressTargetStatus,
} from "@/features/history/types";
import {
  getNutrientTint,
  nutrientPalette,
  type NutrientVariant,
} from "@/components/nutrition/nutrient-theme";
import { formatCalories, formatDecimal, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type WeeklyProgressChartProps = {
  data: WeeklyProgressData;
};

type MetricConfig = {
  label: string;
  shortLabel: string;
  unit: "cal" | "g";
  variant: NutrientVariant;
  color: string;
  haloColor: string;
  selectedColor: string;
  softColor: string;
  targetLineColor: string;
};

const metricConfigs: Record<WeeklyProgressMetric, MetricConfig> = {
  calories: {
    label: "Calories",
    shortLabel: "Cal",
    unit: "cal",
    variant: "calories",
    color: nutrientPalette.calories.color,
    haloColor: getNutrientTint("calories", 0.07),
    selectedColor: getNutrientTint("calories", 0.055),
    softColor: getNutrientTint("calories", 0.14),
    targetLineColor: getNutrientTint("calories", 0.78),
  },
  protein: {
    label: "Protein",
    shortLabel: "Protein",
    unit: "g",
    variant: "protein",
    color: nutrientPalette.protein.color,
    haloColor: getNutrientTint("protein", 0.07),
    selectedColor: getNutrientTint("protein", 0.055),
    softColor: getNutrientTint("protein", 0.14),
    targetLineColor: getNutrientTint("protein", 0.78),
  },
  carbohydrates: {
    label: "Carbs",
    shortLabel: "Carbs",
    unit: "g",
    variant: "carbs",
    color: nutrientPalette.carbs.color,
    haloColor: getNutrientTint("carbs", 0.07),
    selectedColor: getNutrientTint("carbs", 0.055),
    softColor: getNutrientTint("carbs", 0.14),
    targetLineColor: getNutrientTint("carbs", 0.85),
  },
  fat: {
    label: "Fat",
    shortLabel: "Fat",
    unit: "g",
    variant: "fat",
    color: nutrientPalette.fat.color,
    haloColor: getNutrientTint("fat", 0.07),
    selectedColor: getNutrientTint("fat", 0.055),
    softColor: getNutrientTint("fat", 0.14),
    targetLineColor: getNutrientTint("fat", 0.82),
  },
};

const metrics: WeeklyProgressMetric[] = [
  "calories",
  "protein",
  "carbohydrates",
  "fat",
];

export function WeeklyProgressChart({ data }: WeeklyProgressChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<WeeklyProgressMetric>("calories");
  const metric = metricConfigs[selectedMetric];
  const chartMax = useMemo(() => {
    const largestValue = Math.max(
      ...data.days.flatMap((day) => {
        const value = day.values[selectedMetric];
        return [value.consumed, value.target];
      }),
      1,
    );

    return largestValue * 1.12;
  }, [data.days, selectedMetric]);
  const chartTitleId = `weekly-progress-${selectedMetric}`;

  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Weekly progress
          </p>
          <h2 className="mt-1 text-xl font-semibold text-card-foreground">
            {formatWeekRange(data.weekStart, data.weekEnd)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Compare daily intake with your targets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <WeekLink
            href={`/history?week=${data.previousWeekStart}`}
            icon={<ChevronLeft aria-hidden="true" className="h-4 w-4" />}
            label="Previous week"
          />
          <WeekLink
            href={`/history?week=${data.nextWeekStart}`}
            icon={<ChevronRight aria-hidden="true" className="h-4 w-4" />}
            label="Next week"
            reverse
          />
        </div>
      </div>

      <div
        aria-label="Select nutrition metric"
        className="mt-5 grid grid-cols-2 gap-2 rounded-md border border-soft-border bg-surface-soft p-1 sm:grid-cols-4"
        role="tablist"
      >
        {metrics.map((key) => {
          const config = metricConfigs[key];
          const isSelected = key === selectedMetric;
          const selectedStyle = isSelected
            ? ({
                backgroundColor: config.selectedColor,
                boxShadow: `inset 0 0 0 1px ${config.color}, 0 8px 18px ${config.softColor}`,
                color: config.color,
              } satisfies CSSProperties)
            : undefined;

          return (
            <button
              aria-controls={chartTitleId}
              aria-selected={isSelected}
              className={cn(
                "min-h-10 rounded-sm px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isSelected
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              key={key}
              onClick={() => setSelectedMetric(key)}
              role="tab"
              style={selectedStyle}
              type="button"
            >
              {config.label}
            </button>
          );
        })}
      </div>

      <div
        aria-label={`${metric.label} weekly progress chart`}
        className="mt-6"
        id={chartTitleId}
        role="tabpanel"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            Showing {metric.label.toLowerCase()} consumed per day
          </span>
          <span className="inline-flex items-center gap-2">
            <span
              className="h-0.5 w-8 rounded-full"
              style={{ backgroundColor: metric.targetLineColor }}
            />
            Target line uses saved daily target
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
          {data.days.map((day) => {
            const value = day.values[selectedMetric];
            const barHeight = getRatioPercent(value.consumed, chartMax);
            const targetPosition = getRatioPercent(value.target, chartMax);
            const targetStatusLabel = formatTargetStatus(value.targetStatus);
            const tooltip = buildTooltip(day.date, metric, value);

            return (
              <Link
                aria-label={`${day.label}, ${day.date}. ${tooltip}. ${targetStatusLabel}`}
                className={cn(
                  "group relative flex min-w-0 flex-col items-center gap-2 rounded-sm p-1.5 outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                )}
                href={`/history/${day.date}`}
                key={day.date}
                style={day.isToday ? { backgroundColor: metric.haloColor } : undefined}
                title={tooltip}
              >
                <span
                  className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 w-48 -translate-x-1/2 rounded-sm border bg-card px-3 py-2 text-left text-xs leading-5 text-foreground opacity-0 shadow-soft transition group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{ borderColor: metric.color }}
                >
                  <strong className="block font-semibold">{day.date}</strong>
                  <span className="block">Consumed: {formatMetricValue(value.consumed, metric)}</span>
                  <span className="block">Target: {formatMetricValue(value.target, metric)}</span>
                  <span className="block">Status: {targetStatusLabel}</span>
                  <span className="block">
                    Complete: {formatPercent(value.completionRatio)}
                  </span>
                </span>
                <span className="relative flex h-44 w-full items-end rounded-sm border border-border bg-background p-1.5 sm:h-56">
                  <span
                    aria-hidden="true"
                    className="absolute left-1.5 right-1.5 z-10 h-0.5 rounded-full"
                    style={{
                      backgroundColor: metric.targetLineColor,
                      bottom: `${targetPosition}%`,
                      boxShadow: `0 0 0 1px rgb(255 255 255 / 0.78), 0 4px 10px ${metric.softColor}`,
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="relative z-0 w-full rounded-t-sm transition-all"
                    style={{
                      backgroundColor: metric.color,
                      boxShadow: `0 10px 20px ${metric.softColor}`,
                      height: value.consumed > 0 ? `${Math.max(barHeight, 2)}%` : "0%",
                    }}
                  />
                </span>
                <span className="max-w-full truncate text-xs font-semibold text-foreground">
                  {formatMetricValue(value.consumed, metric)}
                </span>
                <span
                  className={cn(
                    "max-w-full truncate rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-4",
                    getTargetStatusClassName(value.targetStatus),
                  )}
                >
                  {targetStatusLabel}
                </span>
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold sm:h-9 sm:w-9",
                    day.isToday
                      ? "text-white"
                      : "bg-surface-muted text-muted-foreground",
                  )}
                  style={
                    day.isToday
                      ? {
                          backgroundColor: metric.color,
                          color: getMetricForeground(selectedMetric),
                        }
                      : undefined
                  }
                >
                  <span className="sm:hidden">{day.shortLabel}</span>
                  <span className="hidden sm:inline">{day.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WeekLink({
  href,
  icon,
  label,
  reverse = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  reverse?: boolean;
}) {
  return (
    <Link
      aria-label={label}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      href={href}
    >
      {reverse ? null : icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{reverse ? "Next" : "Prev"}</span>
      {reverse ? icon : null}
    </Link>
  );
}

function getRatioPercent(value: number, max: number) {
  return Math.min(Math.max((value / max) * 100, 0), 100);
}

function buildTooltip(
  date: string,
  metric: MetricConfig,
  value: WeeklyProgressMetricValue,
) {
  return `${date}: consumed ${formatMetricValue(value.consumed, metric)}, target ${formatMetricValue(
    value.target,
    metric,
  )}, ${formatTargetStatus(value.targetStatus).toLowerCase()}, ${formatPercent(value.completionRatio)} complete`;
}

function formatMetricValue(value: number, metric: MetricConfig) {
  return metric.unit === "cal" ? formatCalories(value) : `${formatDecimal(value)} g`;
}

function getMetricForeground(metric: WeeklyProgressMetric) {
  return metric === "carbohydrates" || metric === "fat" ? "#102A43" : "#FFFFFF";
}

function formatTargetStatus(status: WeeklyProgressTargetStatus) {
  if (status === "below") {
    return "Below target";
  }

  if (status === "above") {
    return "Above target";
  }

  return "Target reached";
}

function getTargetStatusClassName(status: WeeklyProgressTargetStatus) {
  if (status === "reached") {
    return "border border-primary/25 bg-primary/10 text-foreground";
  }

  if (status === "above") {
    return "border border-soft-border bg-surface-soft text-foreground";
  }

  return "border border-soft-border bg-surface-muted text-muted-foreground";
}

function formatWeekRange(weekStart: string, weekEnd: string) {
  const start = new Date(`${weekStart}T00:00:00.000Z`);
  const end = new Date(`${weekEnd}T00:00:00.000Z`);
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  });

  if (sameMonth && sameYear) {
    return `${monthFormatter.format(start)} ${start.getUTCDate()}-${end.getUTCDate()}, ${end.getUTCFullYear()}`;
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });

  return `${dateFormatter.format(start)} - ${dateFormatter.format(end)}`;
}
