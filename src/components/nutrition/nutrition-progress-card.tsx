import { Droplet, Drumstick, Flame, Wheat } from "lucide-react";
import { formatCalories, formatDecimal, formatGram, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type NutritionKind = "calories" | "protein" | "carbohydrates" | "fat";

type NutritionProgressCardProps = {
  kind: NutritionKind;
  label: string;
  consumed: number;
  target: number;
  unit: "calorie" | "gram";
};

const cardStyles = {
  calories: {
    icon: Flame,
    tone: "bg-primary/15 text-foreground",
    bar: "bg-primary",
  },
  protein: {
    icon: Drumstick,
    tone: "bg-fresh/15 text-fresh",
    bar: "bg-fresh",
  },
  carbohydrates: {
    icon: Wheat,
    tone: "bg-muted text-fresh",
    bar: "bg-fresh",
  },
  fat: {
    icon: Droplet,
    tone: "bg-muted text-fresh",
    bar: "bg-fresh",
  },
};

export function NutritionProgressCard({
  kind,
  label,
  consumed,
  target,
  unit,
}: NutritionProgressCardProps) {
  const percentage = target > 0 ? consumed / target : 0;
  const boundedPercentage = Math.min(Math.max(percentage, 0), 1);
  const remaining = Math.max(target - consumed, 0);
  const exceeded = consumed > target ? consumed - target : 0;
  const style = cardStyles[kind];
  const Icon = style.icon;
  const formatValue = unit === "calorie" ? formatCalories : formatGram;

  return (
    <article
      aria-label={`${label}: ${formatValue(consumed)} of ${formatValue(target)}`}
      className="rounded-md border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-card-foreground">{label}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatPercent(percentage)} complete
          </p>
        </div>
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-md", style.tone)}>
          <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
      <div className="mt-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-black leading-none text-card-foreground">
              {unit === "calorie" ? formatCalories(consumed) : formatDecimal(consumed)}
            </p>
            {unit === "gram" ? (
              <p className="mt-1 text-xs text-muted-foreground">grams consumed</p>
            ) : null}
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Goal {formatValue(target)}
          </p>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", style.bar)}
            style={{ width: `${boundedPercentage * 100}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {exceeded > 0
            ? `${formatValue(exceeded)} over goal`
            : `${formatValue(remaining)} remaining`}
        </p>
      </div>
    </article>
  );
}
