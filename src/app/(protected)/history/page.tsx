import { PageHeader } from "@/components/layout/page-header";
import { HistoryPageContent } from "@/features/history/components/history-page-content";
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
  const { activeDateCounts, activeDates, error, streak, weeklyProgress } =
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
      <HistoryPageContent
        activeDateCounts={activeDateCounts}
        activeDates={activeDates}
        selectedDate={latestDate}
        streak={streak}
        weeklyProgress={weeklyProgress}
      />
    </div>
  );
}
