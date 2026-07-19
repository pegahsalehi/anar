import { CalendarPreview } from "@/components/history/calendar-preview";
import { WeeklyProgressChart } from "@/components/history/weekly-progress-chart";
import { PageHeader } from "@/components/layout/page-header";
import { StreakCard } from "@/components/nutrition/streak-card";
import { getHistoryActiveDates } from "@/features/history/queries";

export const metadata = {
  title: "History",
};

type HistoryPageProps = {
  searchParams?: Promise<{
    week?: string | string[];
  }>;
};

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;
  const requestedWeek = Array.isArray(params?.week) ? params?.week[0] : params?.week;
  const { activeDates, error, streak, weeklyProgress } =
    await getHistoryActiveDates(requestedWeek);
  const latestDate = activeDates[0];

  return (
    <div className="space-y-7">
      <PageHeader
        title="History"
        description="Review days that have at least one logged food."
      />
      {error ? (
        <p className="rounded-md border border-coral/25 bg-coral/10 px-4 py-3 text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
      <StreakCard {...streak} />
      <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
        <CalendarPreview
          activeDates={activeDates}
          selectedDate={latestDate}
          weekStartsOn={weeklyProgress.weekStartsOn}
        />
        <WeeklyProgressChart data={weeklyProgress} />
      </div>
    </div>
  );
}
