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
    {
      kind: "fat" as const,
      label: "Fat",
      consumed: progress.fat.consumed,
      target: progress.fat.target,
      unit: "gram" as const,
    },
  ];

  return (
    <section
      aria-label="Daily nutrition summary"
      className={cn(
        "grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-5 xl:grid-cols-4",
        compact && "gap-4",
      )}
    >
      {dailyProgress.map((item) => (
        <NutritionProgressCard key={item.kind} {...item} />
      ))}
    </section>
  );
}
