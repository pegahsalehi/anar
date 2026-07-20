import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { Droplet, Drumstick, Flame, Wheat } from "lucide-react";
import {
  formatCalories,
  formatDecimal,
  formatGram,
  formatInteger,
  formatPercent,
} from "@/lib/format";
import { nutrientPalette } from "@/components/nutrition/nutrient-theme";

type NutritionKind = "calories" | "protein" | "carbohydrates" | "fat";

type NutritionProgressCardProps = {
  kind: NutritionKind;
  label: string;
  consumed: number;
  target: number;
  unit: "calorie" | "gram";
};

type CardTheme = {
  accent: string;
  bar: string;
  border: string;
  descriptor: string;
  glow: string;
  icon: LucideIcon;
  surface: string;
  title: string;
  track: string;
};

const cardThemes: Record<NutritionKind, CardTheme> = {
  calories: {
    accent: nutrientPalette.calories.color,
    bar: nutrientPalette.calories.color,
    border: "rgb(232 237 233 / 1)",
    descriptor: "Energy",
    glow: "rgb(255 23 68 / 0.11)",
    icon: Flame,
    surface: "#FFFFFF",
    title: nutrientPalette.calories.color,
    track: "#EEF1EE",
  },
  protein: {
    accent: nutrientPalette.protein.color,
    bar: nutrientPalette.protein.color,
    border: "rgb(232 237 233 / 1)",
    descriptor: "Muscle Growth",
    glow: "rgb(124 77 255 / 0.11)",
    icon: Drumstick,
    surface: "#FFFFFF",
    title: nutrientPalette.protein.color,
    track: "#EEF1EE",
  },
  carbohydrates: {
    accent: nutrientPalette.carbs.color,
    bar: nutrientPalette.carbs.color,
    border: "rgb(232 237 233 / 1)",
    descriptor: "Body Fuel",
    glow: "rgb(0 216 255 / 0.11)",
    icon: Wheat,
    surface: "#FFFFFF",
    title: nutrientPalette.carbs.color,
    track: "#EEF1EE",
  },
  fat: {
    accent: nutrientPalette.fat.color,
    bar: nutrientPalette.fat.color,
    border: "rgb(232 237 233 / 1)",
    descriptor: "Hormones",
    glow: "rgb(255 145 0 / 0.11)",
    icon: Droplet,
    surface: "#FFFFFF",
    title: nutrientPalette.fat.color,
    track: "#EEF1EE",
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
  const theme = cardThemes[kind];
  const Icon = theme.icon;
  const formatValue = unit === "calorie" ? formatCalories : formatGram;
  const value = unit === "calorie" ? formatInteger(Math.round(consumed)) : formatDecimal(consumed);
  const valueUnit = unit === "calorie" ? "cal" : "g";
  const targetLabel = formatValue(target);
  const statusLabel = getStatusLabel({
    exceeded,
    formatValue,
    remaining,
  });
  const cardStyle = {
    "--metric-accent": theme.accent,
    "--metric-border": theme.border,
    "--metric-glow": theme.glow,
    "--metric-surface": theme.surface,
    "--metric-title": theme.title,
    "--metric-track": theme.track,
    background: theme.surface,
    borderColor: theme.border,
  } as CSSProperties;

  return (
    <article
      aria-label={`${label}: ${formatValue(consumed)} of ${targetLabel}`}
      className="relative min-h-[150px] overflow-hidden rounded-[18px] border bg-white p-3.5 shadow-[0_12px_28px_rgb(16_42_67_/_0.07)] sm:min-h-[170px] sm:p-4 md:rounded-[22px] md:p-5 xl:aspect-square xl:min-h-0 xl:rounded-[24px] xl:p-5 min-[1500px]:p-6"
      style={cardStyle}
    >
      <MetricCardDecorations />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-2 pr-10 sm:pr-12 md:gap-4 md:pr-14 xl:pr-16">
          <div>
            <h2 className="text-base font-semibold leading-none text-[var(--metric-title)] sm:text-lg md:text-xl min-[1500px]:text-2xl">
              {label}
            </h2>
            <p className="mt-1 text-[0.68rem] font-medium leading-snug text-muted-foreground sm:text-xs md:mt-2 md:text-sm min-[1500px]:text-base">
              {theme.descriptor}
            </p>
            <p className="sr-only">{formatPercent(percentage)} complete</p>
          </div>
        </div>

        <span className="absolute right-1.5 top-3 flex h-8 w-8 items-center justify-center rounded-xl border border-white/85 bg-white/[0.9] text-[var(--metric-accent)] shadow-[0_10px_22px_var(--metric-glow)] backdrop-blur-sm sm:right-2 sm:h-9 sm:w-9 md:top-4 md:h-12 md:w-12 md:rounded-[17px] xl:h-14 xl:w-14 xl:rounded-[19px]">
          <Icon aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 xl:h-7 xl:w-7" strokeWidth={2.05} />
        </span>

        <div className="mt-3 xl:mt-auto">
          <div className="space-y-1.5 md:space-y-2">
            <div className="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap">
              <p className="min-w-0 truncate text-[1.45rem] font-semibold leading-[0.9] text-foreground sm:text-[1.6rem] md:text-[1.75rem] min-[1500px]:text-[2.05rem]">
                {value}
              </p>
              <p className="text-xs font-medium leading-none text-foreground sm:text-sm md:text-base">
                {valueUnit}
              </p>
            </div>
            <p className="truncate whitespace-nowrap text-[0.68rem] font-medium leading-none text-muted-foreground sm:text-xs md:text-sm">
              Goal <span className="font-semibold text-foreground">{targetLabel}</span>
            </p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--metric-track)] md:mt-5 md:h-2.5 min-[1500px]:mt-6">
            <div
              className="h-full rounded-full"
              style={{
                background: theme.bar,
                width: `${boundedPercentage * 100}%`,
              }}
            />
          </div>

          <p className="mt-2 max-w-full truncate text-[0.68rem] font-medium leading-snug text-foreground sm:text-xs md:mt-3 md:text-sm xl:max-w-[10.75rem] min-[1500px]:mt-4">
            {statusLabel}
          </p>
        </div>
      </div>
      <FoodIllustration kind={kind} />
    </article>
  );
}

function getStatusLabel({
  exceeded,
  formatValue,
  remaining,
}: {
  exceeded: number;
  formatValue: (value: number) => string;
  remaining: number;
}) {
  if (exceeded > 0) {
    return `${formatValue(exceeded)} over target`;
  }

  return `${formatValue(remaining)} remaining`;
}

function MetricCardDecorations() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 360 255"
    >
      <path
        d="M224 0 C238 33 270 47 310 34 C331 28 348 35 360 46 L360 0 Z"
        fill="var(--metric-accent)"
        opacity="0.075"
      />
      <path
        d="M0 221 C43 203 77 220 111 212 C152 203 181 225 220 209 C270 189 315 204 360 184 L360 255 L0 255 Z"
        fill="var(--metric-accent)"
        opacity="0.065"
      />
      <path
        d="M0 235 C39 222 74 241 119 225 C156 212 198 234 242 218 C287 202 326 218 360 207 L360 255 L0 255 Z"
        fill="var(--metric-accent)"
        opacity="0.04"
      />
      <circle cx="342" cy="18" r="54" fill="var(--metric-accent)" opacity="0.045" />
      <circle cx="22" cy="244" r="52" fill="var(--metric-accent)" opacity="0.045" />
    </svg>
  );
}

function FoodIllustration({ kind }: { kind: NutritionKind }) {
  const commonClassName =
    "pointer-events-none absolute bottom-0 right-0 z-0 h-[54px] w-[46%] max-w-[86px] text-[var(--metric-accent)] opacity-[0.14] sm:h-[62px] sm:max-w-[98px] md:h-[74px] md:max-w-[116px] md:opacity-[0.18] xl:bottom-1 xl:right-1 xl:h-[82px] xl:max-w-[132px] xl:opacity-[0.2]";

  if (kind === "calories") {
    return (
      <svg aria-hidden="true" className={commonClassName} viewBox="0 0 190 120">
        <path d="M136 119 C160 105 173 77 163 44 C158 61 148 64 132 57 C144 75 137 92 119 103 C134 89 130 66 113 47 C116 69 98 76 94 96 C91 109 103 117 136 119 Z" fill="currentColor" opacity="0.28" />
        <ellipse cx="92" cy="91" fill="currentColor" rx="21" ry="27" transform="rotate(9 92 91)" />
        <ellipse cx="56" cy="97" fill="currentColor" opacity="0.72" rx="18" ry="22" transform="rotate(-16 56 97)" />
        <ellipse cx="127" cy="91" fill="currentColor" opacity="0.78" rx="32" ry="28" />
        <ellipse cx="127" cy="91" fill="#FFFFFF" opacity="0.72" rx="25" ry="22" />
        <ellipse cx="127" cy="91" fill="currentColor" opacity="0.42" rx="20" ry="17" />
        {Array.from({ length: 10 }).map((_, index) => (
          <line
            key={`orange-line-${index}`}
            stroke="#FFFFFF"
            opacity="0.72"
            strokeLinecap="round"
            strokeWidth="2"
            x1="127"
            x2={127 + Math.cos((index / 10) * Math.PI * 2) * 20}
            y1="91"
            y2={91 + Math.sin((index / 10) * Math.PI * 2) * 16}
          />
        ))}
        <path d="M84 60 C91 51 99 55 101 65 C93 62 88 62 84 60 Z" fill="currentColor" opacity="0.46" />
        <path d="M53 72 C47 62 53 57 61 63 C56 67 54 70 53 72 Z" fill="currentColor" opacity="0.46" />
      </svg>
    );
  }

  if (kind === "protein") {
    return (
      <svg aria-hidden="true" className={commonClassName} viewBox="0 0 190 120">
        <ellipse cx="136" cy="85" fill="#FFFFFF" opacity="0.76" rx="36" ry="29" />
        <ellipse cx="136" cy="85" fill="currentColor" opacity="0.45" rx="17" ry="16" />
        <path d="M56 96 C76 61 102 58 107 79 C92 108 69 112 56 96 Z" fill="currentColor" opacity="0.72" />
        <path d="M62 94 C74 85 84 77 101 75" fill="none" opacity="0.6" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="3" />
        <circle cx="73" cy="91" fill="#FFFFFF" opacity="0.44" r="6" />
        <circle cx="85" cy="82" fill="#FFFFFF" opacity="0.44" r="6" />
        <circle cx="97" cy="76" fill="#FFFFFF" opacity="0.44" r="5.5" />
        <ellipse cx="101" cy="105" fill="currentColor" opacity="0.64" rx="12" ry="7" transform="rotate(4 101 105)" />
        <ellipse cx="124" cy="105" fill="currentColor" opacity="0.48" rx="12" ry="7" transform="rotate(18 124 105)" />
        <circle cx="126" cy="30" fill="currentColor" opacity="0.62" r="7" />
        <circle cx="151" cy="47" fill="currentColor" opacity="0.5" r="8" />
        <circle cx="168" cy="28" fill="currentColor" opacity="0.42" r="6" />
        <path d="M126 30 L151 47 L168 28" fill="none" opacity="0.45" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      </svg>
    );
  }

  if (kind === "carbohydrates") {
    return (
      <svg aria-hidden="true" className={commonClassName} viewBox="0 0 190 120">
        <ellipse cx="139" cy="96" fill="currentColor" opacity="0.54" rx="47" ry="18" />
        <path d="M95 80 C105 111 170 111 183 80 Z" fill="currentColor" opacity="0.72" />
        <path d="M101 78 C113 54 165 55 179 78 C159 91 121 91 101 78 Z" fill="#FFFFFF" opacity="0.8" />
        {Array.from({ length: 24 }).map((_, index) => (
          <ellipse
            cx={107 + (index % 8) * 9}
            cy={70 + Math.floor(index / 8) * 7}
            fill="currentColor"
            key={`rice-${index}`}
            opacity="0.22"
            rx="3.2"
            ry="1.5"
            transform={`rotate(${index % 2 ? 17 : -12} ${107 + (index % 8) * 9} ${
              70 + Math.floor(index / 8) * 7
            })`}
          />
        ))}
        <path d="M51 91 C44 65 68 51 92 68 L100 100 C78 106 59 102 51 91 Z" fill="currentColor" opacity="0.5" />
        <path d="M57 85 C54 69 70 61 88 73" fill="none" opacity="0.7" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2" />
        <path d="M129 34 C130 56 132 77 135 98" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
        <path d="M135 38 C148 43 148 55 137 60 C137 51 136 44 135 38 Z" fill="currentColor" opacity="0.7" />
        <path d="M126 48 C113 53 114 66 128 70 C127 61 126 54 126 48 Z" fill="currentColor" opacity="0.56" />
        <path d="M139 62 C153 67 153 80 139 84 C140 75 140 68 139 62 Z" fill="currentColor" opacity="0.7" />
        <path d="M129 72 C116 77 118 90 132 94 C131 84 130 78 129 72 Z" fill="currentColor" opacity="0.56" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={commonClassName} viewBox="0 0 190 120">
      <ellipse cx="74" cy="82" fill="currentColor" opacity="0.58" rx="26" ry="39" transform="rotate(18 74 82)" />
      <ellipse cx="74" cy="82" fill="#FFFFFF" opacity="0.68" rx="17" ry="25" transform="rotate(18 74 82)" />
      <circle cx="77" cy="84" fill="currentColor" opacity="0.48" r="10" />
      <ellipse cx="129" cy="102" fill="currentColor" opacity="0.62" rx="24" ry="16" transform="rotate(-15 129 102)" />
      <ellipse cx="159" cy="104" fill="currentColor" opacity="0.44" rx="22" ry="17" transform="rotate(8 159 104)" />
      <path d="M118 81 C138 55 162 58 184 50" fill="none" opacity="0.54" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      <path d="M139 71 C148 58 160 56 169 61 C157 70 149 73 139 71 Z" fill="currentColor" opacity="0.46" />
      <path d="M160 58 C169 45 181 43 189 47 C178 56 170 60 160 58 Z" fill="currentColor" opacity="0.4" />
      <path d="M114 84 C124 71 135 68 145 73 C134 82 125 86 114 84 Z" fill="currentColor" opacity="0.42" />
      <ellipse cx="44" cy="104" fill="currentColor" opacity="0.44" rx="5" ry="3" transform="rotate(-16 44 104)" />
      <ellipse cx="63" cy="106" fill="currentColor" opacity="0.36" rx="5" ry="3" transform="rotate(14 63 106)" />
    </svg>
  );
}
