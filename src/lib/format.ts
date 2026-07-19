const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  style: "percent",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatInteger(value: number) {
  return integerFormatter.format(value);
}

export function formatDecimal(value: number) {
  return decimalFormatter.format(value);
}

export function formatCalories(value: number) {
  return `${integerFormatter.format(Math.round(value))} cal`;
}

export function formatGram(value: number) {
  return `${decimalFormatter.format(value)} g`;
}

export function formatPercent(value: number) {
  return percentFormatter.format(value);
}

export function formatDate(date: Date) {
  return dateFormatter.format(date);
}

export function formatTime(date: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(date);
}
