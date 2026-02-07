/**
 * Get start of the Hebrew work week (Sunday) for any given date.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sunday
  d.setDate(d.getDate() - day); // go back to Sunday
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of the Hebrew work week (Thursday) for any given date.
 */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 4); // Sunday + 4 = Thursday
  return end;
}

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

/**
 * Format week range for display, handling cross-month correctly.
 * Examples: "5-9 בפברואר" or "28 בינואר - 1 בפברואר"
 */
export function formatWeekRange(date: Date): string {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  const fmtDay = new Intl.DateTimeFormat("he-IL", { day: "numeric" });
  const fmtMonth = new Intl.DateTimeFormat("he-IL", { month: "long" });

  const startMonth = fmtMonth.format(start);
  const endMonth = fmtMonth.format(end);

  if (startMonth === endMonth) {
    return `${fmtDay.format(start)}-${fmtDay.format(end)} ב${endMonth}`;
  }
  // Cross-month: "28 בינואר - 1 בפברואר"
  return `${fmtDay.format(start)} ב${startMonth} - ${fmtDay.format(end)} ב${endMonth}`;
}

/**
 * Get today's week start (Sunday).
 */
export function getCurrentWeekStart(): Date {
  return getWeekStart(new Date());
}

export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Get the actual Date for a specific day within a week.
 * dayOfWeek: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday
 */
export function getDateForDay(weekStart: Date, dayOfWeek: number): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayOfWeek);
  return d;
}

export function formatDay(date: Date): string {
  const dayNames = ["יום א'", "יום ב'", "יום ג'", "יום ד'", "יום ה'", "יום ו'", "שבת"];
  const fmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long" });
  return `${dayNames[date.getDay()]} ${fmt.format(date)}`;
}

/**
 * Format a date as ISO string (YYYY-MM-DD) for URL/API usage.
 */
export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}
