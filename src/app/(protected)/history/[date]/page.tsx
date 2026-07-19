import { CalendarPreview } from "@/components/history/calendar-preview";
import { PageHeader } from "@/components/layout/page-header";
import { DailySummary } from "@/components/nutrition/daily-summary";
import { FoodLogItem } from "@/components/nutrition/food-log-item";
import { EmptyState } from "@/components/ui/empty-state";
import { getHistoryDateData } from "@/features/history/queries";

export const metadata = {
  title: "History Day",
};

type HistoryDatePageProps = {
  params: Promise<{
    date: string;
  }>;
};

export default async function HistoryDatePage({ params }: HistoryDatePageProps) {
  const { date } = await params;
  const data = await getHistoryDateData(date);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={date}
        title="Day details"
        description="Compare the selected day's goals and logged food snapshots."
      />
      {data.error ? (
        <p className="rounded-md border border-coral/25 bg-coral/10 px-4 py-3 text-sm text-coral" role="alert">
          {data.error}
        </p>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
        <CalendarPreview activeDates={data.activeDates} selectedDate={date} />
        <div className="space-y-5">
          <DailySummary compact progress={data.progress} />
          <section className="space-y-3">
            <h2 className="text-base font-bold">Logged foods</h2>
            {data.logs.length > 0 ? (
              <div className="grid gap-3">
                {data.logs.map((log) => (
                  <FoodLogItem editable={false} key={log.id} log={log} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No food logged for this day"
                description="This date has no food log rows for your account."
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
