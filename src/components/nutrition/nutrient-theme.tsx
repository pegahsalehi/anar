import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type NutrientVariant = "calories" | "protein" | "carbs" | "fat";

export const nutrientPalette: Record<NutrientVariant, { color: string; label: string }> = {
  calories: {
    color: "#FF1744",
    label: "Calories",
  },
  protein: {
    color: "#7C4DFF",
    label: "Protein",
  },
  carbs: {
    color: "#00D8FF",
    label: "Carbs",
  },
  fat: {
    color: "#FF9100",
    label: "Fat",
  },
};

type NutrientSurfaceProps = {
  as?: "div" | "section";
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  variant: NutrientVariant;
} & HTMLAttributes<HTMLElement>;

export function NutrientSurface({
  as: Component = "div",
  children,
  className,
  contentClassName,
  style,
  variant,
  ...props
}: NutrientSurfaceProps) {
  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-md border bg-card",
        className,
      )}
      style={{
        ...getNutrientSurfaceStyle(variant),
        ...style,
      }}
      {...props}
    >
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </Component>
  );
}

export function NutrientChip({
  className,
  label,
  value,
  variant,
}: {
  className?: string;
  label?: string;
  value: string;
  variant: NutrientVariant;
}) {
  const nutrient = nutrientPalette[variant];

  return (
    <div
      className={cn(
        "min-w-0 rounded-md border px-2 py-1.5",
        className,
      )}
      style={getNutrientSurfaceStyle(variant)}
    >
      <dt
        className="truncate text-[0.7rem] font-semibold leading-4"
        style={{ color: nutrient.color }}
      >
        {label ?? nutrient.label}
      </dt>
      <dd className="mt-0.5 truncate whitespace-nowrap font-medium leading-4 text-foreground">
        {value}
      </dd>
    </div>
  );
}

export function getNutrientStyleVariables(variant: NutrientVariant) {
  const color = nutrientPalette[variant].color;

  return {
    "--nutrient-color": color,
    "--nutrient-border": withAlpha(color, 0.2),
    "--nutrient-ring": withAlpha(color, 0.18),
  } as CSSProperties;
}

export function getNutrientInputStyleVariables(variant: NutrientVariant) {
  const color = nutrientPalette[variant].color;

  return {
    ...getNutrientStyleVariables(variant),
    "--nutrient-input-bg": withAlpha(color, 0.045),
    "--nutrient-input-border": withAlpha(color, 0.2),
    "--nutrient-input-border-focus": withAlpha(color, 0.62),
    "--nutrient-input-ring": withAlpha(color, 0.15),
    "--nutrient-input-shadow": `0 8px 18px ${withAlpha(color, 0.04)}`,
  } as CSSProperties;
}

export function getNutrientTint(variant: NutrientVariant, alpha: number) {
  return withAlpha(nutrientPalette[variant].color, alpha);
}

function getNutrientSurfaceStyle(variant: NutrientVariant) {
  const color = nutrientPalette[variant].color;

  return {
    ...getNutrientStyleVariables(variant),
    backgroundColor: withAlpha(color, 0.025),
    borderColor: withAlpha(color, 0.18),
  } as CSSProperties;
}

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgb(${red} ${green} ${blue} / ${alpha})`;
}
