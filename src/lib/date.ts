export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getWeekIsoDates(reference: Date = new Date()): string[] {
  const start = new Date(reference);
  start.setDate(start.getDate() - start.getDay()); // back up to Sunday

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toIsoDate(d);
  });
}

/**
 * "Today" as the app server sees it (`new Date()`) is the server's own clock —
 * on Vercel that's UTC, not the visiting user's local date. Near midnight
 * that's off by a day. This resolves the wall-clock date in the user's saved
 * IANA timezone instead, using the en-CA locale's YYYY-MM-DD formatting.
 */
export function getTodayIsoInTimezone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
  } catch {
    return toIsoDate(new Date());
  }
}

export function getWeekIsoDatesInTimezone(timezone: string): string[] {
  const [year, month, day] = getTodayIsoInTimezone(timezone).split("-").map(Number);
  return getWeekIsoDates(new Date(year, month - 1, day));
}

export function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function formatLongDateWithOrdinal(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekdayMonth = date.toLocaleDateString("en-US", { weekday: "long", month: "long" });
  return `${weekdayMonth} ${day}${ordinalSuffix(day)}`;
}
