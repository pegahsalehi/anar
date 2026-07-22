export default function SettingsLoading() {
  return (
    <div aria-busy="true" className="space-y-7">
      <span className="sr-only">Loading settings</span>
      <div className="space-y-3">
        <div className="h-9 w-44 animate-pulse rounded-sm bg-muted" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded-sm bg-muted" />
      </div>

      <div className="grid gap-5">
        <SettingsAccordionSkeleton isOpen />
        <SettingsAccordionSkeleton />
        <SettingsAccordionSkeleton />
      </div>
    </div>
  );
}

function SettingsAccordionSkeleton({ isOpen = false }: { isOpen?: boolean }) {
  return (
    <section className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
        <div className="min-w-0 space-y-3">
          <div className="h-5 w-48 animate-pulse rounded-sm bg-muted" />
          <div className="h-4 w-full max-w-md animate-pulse rounded-sm bg-muted" />
          {!isOpen ? <div className="h-4 w-64 animate-pulse rounded-sm bg-muted" /> : null}
        </div>
        <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-muted" />
      </div>
      {isOpen ? (
        <div className="border-t border-border px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                className="h-32 animate-pulse rounded-md border border-border bg-background/60"
                key={`settings-goal-skeleton-${index}`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
