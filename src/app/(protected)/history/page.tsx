import Link from "next/link";
import { CalendarPreview } from "@/components/history/calendar-preview";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getHistoryActiveDates } from "@/features/history/queries";

export const metadata = {
  title: "History",
};

export default async function HistoryPage() {
  const { activeDates, error } = await getHistoryActiveDates();
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
      <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
        <CalendarPreview activeDates={activeDates} selectedDate={latestDate} />
        {latestDate ? (
          <section className="rounded-md border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-bold text-card-foreground">Latest logged day</h2>
            <p className="mt-2 text-sm text-muted-foreground">{latestDate}</p>
            <Link
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#59CF95]"
              href={`/history/${latestDate}`}
            >
              View details
            </Link>
          </section>
        ) : (
          <EmptyState
            title="No history yet"
            description="Log food from Today and your active dates will appear here."
          />
        )}
      </div>
    </div>
  );
}
