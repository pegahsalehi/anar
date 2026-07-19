"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SeedSpec = {
  blur?: number;
  height: number;
  left: string;
  opacity: number;
  rotate: number;
  top: string;
  width: number;
};

const loginPageSeeds: SeedSpec[] = [
  { height: 24, left: "23%", opacity: 0.14, rotate: -28, top: "11%", width: 13 },
  { height: 18, left: "41%", opacity: 0.1, rotate: 18, top: "4%", width: 10 },
  { height: 31, left: "55%", opacity: 0.09, rotate: 41, top: "20%", width: 16 },
  { height: 16, left: "68%", opacity: 0.12, rotate: -14, top: "8%", width: 9 },
  { height: 26, left: "35%", opacity: 0.11, rotate: 33, top: "34%", width: 14 },
  { height: 20, left: "12%", opacity: 0.08, rotate: 10, top: "37%", width: 11 },
  { height: 34, left: "49%", opacity: 0.08, rotate: -42, top: "50%", width: 18 },
  { height: 19, left: "72%", opacity: 0.09, rotate: 26, top: "45%", width: 10 },
  { height: 23, left: "29%", opacity: 0.1, rotate: -5, top: "63%", width: 12 },
  { height: 15, left: "58%", opacity: 0.08, rotate: 52, top: "72%", width: 8 },
  { height: 28, left: "16%", opacity: 0.07, rotate: -34, top: "75%", width: 15 },
  { height: 17, left: "78%", opacity: 0.06, rotate: -10, top: "67%", width: 9, blur: 0.4 },
];

const loginCardSeeds: SeedSpec[] = [
  { height: 18, left: "6%", opacity: 0.13, rotate: 24, top: "16%", width: 10 },
  { height: 26, left: "27%", opacity: 0.1, rotate: -31, top: "5%", width: 14 },
  { height: 15, left: "47%", opacity: 0.11, rotate: 42, top: "28%", width: 8 },
  { height: 22, left: "65%", opacity: 0.08, rotate: -12, top: "12%", width: 12 },
  { height: 16, left: "38%", opacity: 0.07, rotate: 16, top: "49%", width: 9 },
  { height: 20, left: "78%", opacity: 0.06, rotate: -38, top: "42%", width: 11 },
];

const legacySeedPatterns = {
  topRight: [
    "h-3 w-2 opacity-[0.13]",
    "h-4 w-2.5 opacity-[0.09]",
    "h-2.5 w-1.5 opacity-[0.12]",
    "h-3.5 w-2 opacity-[0.08]",
    "h-2 w-1.5 opacity-[0.1]",
    "h-3 w-2 opacity-[0.07]",
  ],
  bottomLeft: [
    "h-4 w-2.5 opacity-[0.1]",
    "h-3 w-2 opacity-[0.12]",
    "h-2.5 w-1.5 opacity-[0.08]",
    "h-3.5 w-2 opacity-[0.09]",
    "h-2 w-1.5 opacity-[0.11]",
  ],
  lowerRight: [
    "h-2.5 w-1.5 opacity-[0.1]",
    "h-3.5 w-2 opacity-[0.08]",
    "h-4 w-2.5 opacity-[0.09]",
    "h-2 w-1.5 opacity-[0.12]",
    "h-3 w-2 opacity-[0.07]",
    "h-2.5 w-1.5 opacity-[0.11]",
  ],
} as const;

type LegacySeedPatternVariant = keyof typeof legacySeedPatterns;

export function AuthPageSeedDecorations() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-20 z-0 h-72 w-72 sm:-left-14 sm:bottom-6 lg:left-0 lg:bottom-8"
      >
        <span className="absolute inset-8 rounded-full bg-soft-border/50 blur-3xl" />
        <span className="absolute bottom-8 left-10 h-32 w-44 rotate-[-16deg] rounded-[999px] bg-soft-border/35 blur-2xl" />
        <SeedCluster seeds={loginPageSeeds} />
      </div>
    );
  }

  return (
    <>
      <LegacySeedPattern className="right-8 top-24 sm:right-12 lg:right-16" variant="topRight" />
      <LegacySeedPattern className="bottom-12 left-8 sm:left-12 lg:left-16" variant="bottomLeft" />
      <LegacySeedPattern className="bottom-16 right-8 sm:right-12 lg:right-20" variant="lowerRight" />
    </>
  );
}

export function AuthCardSeedDecorations() {
  const pathname = usePathname();

  if (pathname !== "/login") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-12 -top-12 z-0 h-40 w-44"
    >
      <span className="absolute inset-4 rounded-full bg-soft-border/45 blur-2xl" />
      <SeedCluster seeds={loginCardSeeds} />
    </div>
  );
}

function SeedCluster({ seeds }: { seeds: SeedSpec[] }) {
  return (
    <>
      {seeds.map((seed, index) => (
        <span
          className="absolute rounded-full bg-soft-border shadow-[0_8px_20px_rgb(226_231_228_/_0.14)]"
          key={`auth-seed-${index}`}
          style={{
            filter: seed.blur ? `blur(${seed.blur}px)` : undefined,
            height: seed.height,
            left: seed.left,
            opacity: seed.opacity,
            top: seed.top,
            transform: `rotate(${seed.rotate}deg)`,
            width: seed.width,
          }}
        />
      ))}
    </>
  );
}

function LegacySeedPattern({
  className,
  variant,
}: {
  className?: string;
  variant: LegacySeedPatternVariant;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute hidden grid-cols-3 gap-3 min-[1400px]:grid",
        className,
      )}
    >
      {legacySeedPatterns[variant].map((seedClassName, index) => (
        <span
          className={cn("rotate-45 rounded-full bg-soft-border", seedClassName)}
          key={`seed-${index}`}
        />
      ))}
    </div>
  );
}
