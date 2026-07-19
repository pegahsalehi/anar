import { NutritionProgressCard } from "@/components/nutrition/nutrition-progress-card";
import type { DailyNutritionProgress } from "@/lib/nutrition";
import { cn } from "@/lib/utils";

type DailySummaryProps = {
  compact?: boolean;
  progress: DailyNutritionProgress;
};

export function DailySummary({ compact = false, progress }: DailySummaryProps) {
  const dailyProgress = [
    {
      kind: "calories" as const,
      label: "Calories",
      consumed: progress.calories.consumed,
      target: progress.calories.target,
      unit: "calorie" as const,
    },
    {
      kind: "protein" as const,
      label: "Protein",
      consumed: progress.protein.consumed,
      target: progress.protein.target,
      unit: "gram" as const,
    },
    {
      kind: "carbohydrates" as const,
      label: "Carbs",
      consumed: progress.carbohydrates.consumed,
      target: progress.carbohydrates.target,
      unit: "gram" as const,
    },
  ];

  return (
    <section
      aria-label="Daily nutrition summary"
      className={cn("grid gap-4", compact ? "md:grid-cols-3" : "md:grid-cols-3")}
    >
      {dailyProgress.map((item) => (
        <NutritionProgressCard key={item.kind} {...item} />
      ))}
    </section>
  );
}
