import { Flame } from "lucide-react";
import { formatInteger } from "@/lib/format";

type StreakCardProps = {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
};

export function StreakCard({ currentStreak, longestStreak, activeDays }: StreakCardProps) {
  return (
    <article className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-foreground">
          <Flame aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-card-foreground">Logging streak</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Based on days with at least one food log.
          </p>
        </div>
      </div>
      <p className="mt-6 text-4xl font-black leading-none text-card-foreground">
        {formatInteger(currentStreak)}
        <span className="ml-2 text-sm font-bold text-muted-foreground">days</span>
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-muted p-3">
          <p className="text-muted-foreground">Longest streak</p>
          <p className="mt-1 font-bold">{formatInteger(longestStreak)} days</p>
        </div>
        <div className="rounded-md bg-muted p-3">
          <p className="text-muted-foreground">Active days</p>
          <p className="mt-1 font-bold">{formatInteger(activeDays)} days</p>
        </div>
      </div>
    </article>
  );
}
