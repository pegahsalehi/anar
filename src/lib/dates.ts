export type WeekStartsOn = "sunday" | "monday";

export function getLocalISODate(date = new Date(), timeZone = "UTC") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return date.toISOString().slice(0, 10);
  }

  return `${year}-${month}-${day}`;
}

export function getCurrentTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function parseISODate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function isISODate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function addISODays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function startOfWeek(value: string, weekStartsOn: WeekStartsOn = "monday") {
  const date = new Date(`${value}T00:00:00.000Z`);
  const day = date.getUTCDay();
  const offset = weekStartsOn === "sunday" ? day : (day + 6) % 7;
  return addISODays(value, -offset);
}

export function startOfISOWeek(value: string) {
  return startOfWeek(value, "monday");
}

export function getWeekDays(weekStart: string) {
  return Array.from({ length: 7 }, (_, index) => addISODays(weekStart, index));
}

export function getISOWeekDays(weekStart: string) {
  return getWeekDays(weekStart);
}
