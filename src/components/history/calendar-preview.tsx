import { cn } from "@/lib/utils";

type CalendarPreviewProps = {
  selectedDate?: string;
  activeDates?: string[];
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarPreview({
  selectedDate,
  activeDates = [],
}: CalendarPreviewProps) {
  const selected = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
  const year = selected.getFullYear();
  const month = selected.getMonth();
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(selected);
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = firstDay.getDay();
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
  const activeDateSet = new Set(activeDates);
  const today = toLocalISODate(new Date());

  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="font-semibold text-card-foreground">{monthLabel}</h2>
        {selectedDate ? <p className="mt-1 text-xs text-muted-foreground">{selectedDate}</p> : null}
      </div>
      <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2">
        {Array.from({ length: totalCells }, (_, index) => {
          const day = index - leadingDays + 1;
          const isDisabled = day <= 0 || day > daysInMonth;
          const date = isDisabled ? "" : toLocalISODate(new Date(year, month, day));
          const isToday = date === today;
          const isSelected = Boolean(selectedDate && date === selectedDate);
          const hasLog = activeDateSet.has(date);

          return (
            <div
              aria-label={isDisabled ? undefined : `${monthLabel} ${day}`}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md border border-transparent text-sm font-semibold",
                isDisabled && "bg-transparent text-muted-foreground/35",
                !isDisabled && "bg-muted text-foreground",
                hasLog && "bg-primary/15 text-foreground",
                isToday && "border-primary",
                isSelected && "bg-primary text-primary-foreground",
              )}
              key={`${index}-${day}`}
            >
              {isDisabled ? "" : day}
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          Logged
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border border-primary" />
          Today
        </span>
      </div>
    </section>
  );
}

function toLocalISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
