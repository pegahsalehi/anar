import { MobileAppLoadingScreen } from "@/components/ui/mobile-app-loading-screen";

export default function TodayLoading() {
  return (
    <div aria-busy="true" className="space-y-7">
      <MobileAppLoadingScreen />
      <span className="sr-only">Loading today</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="h-4 w-48 animate-pulse rounded-sm bg-muted" />
          <div className="h-9 w-72 animate-pulse rounded-sm bg-muted" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded-sm bg-muted" />
        </div>
        <div className="h-12 w-32 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="space-y-4">
        <div className="h-44 animate-pulse rounded-md border border-border bg-card shadow-sm" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              className="aspect-square animate-pulse rounded-md border border-border bg-card shadow-sm"
              key={`today-summary-skeleton-${index}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="h-5 w-32 animate-pulse rounded-sm bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded-sm bg-muted" />
        </div>
        <div className="h-48 animate-pulse rounded-md border border-border bg-card shadow-sm" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="h-5 w-28 animate-pulse rounded-sm bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded-sm bg-muted" />
        </div>
        <div className="h-48 animate-pulse rounded-md border border-border bg-card shadow-sm" />
      </div>
    </div>
  );
}
