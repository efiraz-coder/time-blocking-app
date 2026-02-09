import { Category } from "./constants";

// --- Types ---

export interface WeekGrid {
  [cellKey: string]: Category; // "0-8" = day 0, hour 8
}

export interface WeekNotes {
  [cellKey: string]: string;
}

export interface DayReport {
  planned: Record<number, Category>;
  actual: Record<number, Category>;
  plannedNotes: Record<number, string>;
  actualNotes: Record<number, string>;
}

export interface WeekData {
  grid: WeekGrid;
  notes: WeekNotes;
  reports: Record<number, DayReport>; // dayOfWeek -> report
}

export interface UserData {
  weeks: Record<string, WeekData>; // key = ISO date of week start (e.g. "2026-02-08")
}

// --- Helpers ---

function getStorageKey(username: string): string {
  return `tb_data_${username}`;
}

function weekKey(weekStart: Date): string {
  const d = new Date(weekStart);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

// --- Load / Save ---

export function loadUserData(username: string): UserData {
  try {
    const raw = localStorage.getItem(getStorageKey(username));
    if (raw) {
      return JSON.parse(raw) as UserData;
    }
  } catch {
    // corrupted data
  }
  return { weeks: {} };
}

function saveUserData(username: string, data: UserData): void {
  try {
    localStorage.setItem(getStorageKey(username), JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

// --- Week Plan (Grid) ---

export function loadWeekPlan(username: string, weekStart: Date): { grid: WeekGrid; notes: WeekNotes } {
  const data = loadUserData(username);
  const key = weekKey(weekStart);
  const week = data.weeks[key];
  return {
    grid: week?.grid ?? {},
    notes: week?.notes ?? {},
  };
}

export function saveWeekPlan(username: string, weekStart: Date, grid: WeekGrid, notes: WeekNotes): void {
  const data = loadUserData(username);
  const key = weekKey(weekStart);
  if (!data.weeks[key]) {
    data.weeks[key] = { grid: {}, notes: {}, reports: {} };
  }
  data.weeks[key].grid = grid;
  data.weeks[key].notes = notes;
  saveUserData(username, data);
}

// --- Day Report ---

export function loadDayReport(username: string, weekStart: Date, dayOfWeek: number): DayReport | null {
  const data = loadUserData(username);
  const key = weekKey(weekStart);
  const week = data.weeks[key];
  if (!week?.reports?.[dayOfWeek]) return null;
  return week.reports[dayOfWeek];
}

export function saveDayReport(username: string, weekStart: Date, dayOfWeek: number, report: DayReport): void {
  const data = loadUserData(username);
  const key = weekKey(weekStart);
  if (!data.weeks[key]) {
    data.weeks[key] = { grid: {}, notes: {}, reports: {} };
  }
  data.weeks[key].reports[dayOfWeek] = report;
  saveUserData(username, data);
}

// --- Summary helpers ---

export function getWeekSummary(username: string, weekStart: Date): {
  planned: Record<Category, number>;
  actual: Record<Category, number>;
  reportedDays: number;
  plannedDays: number;
} {
  const data = loadUserData(username);
  const key = weekKey(weekStart);
  const week = data.weeks[key];

  const planned: Record<string, number> = {};
  const actual: Record<string, number> = {};
  let reportedDays = 0;
  let plannedDays = 0;

  if (week) {
    // Count planned hours from grid
    for (const [, cat] of Object.entries(week.grid)) {
      if (cat && cat !== "EMPTY") {
        planned[cat] = (planned[cat] ?? 0) + 1;
      }
    }

    // Check if any cells in grid are non-empty
    const hasGridData = Object.values(week.grid).some((c) => c && c !== "EMPTY");
    if (hasGridData) plannedDays = 1; // At least the grid was used

    // Count actual hours from reports
    for (const [, report] of Object.entries(week.reports)) {
      const hasActual = Object.values(report.actual).some((c) => c && c !== "EMPTY");
      if (hasActual) reportedDays++;

      const hasPlanned = Object.values(report.planned).some((c) => c && c !== "EMPTY");
      if (hasPlanned) plannedDays++;

      for (const [, cat] of Object.entries(report.actual)) {
        if (cat && cat !== "EMPTY") {
          actual[cat] = (actual[cat] ?? 0) + 1;
        }
      }
    }
  }

  return {
    planned: planned as Record<Category, number>,
    actual: actual as Record<Category, number>,
    reportedDays,
    plannedDays,
  };
}

// --- History: get all saved weeks ---

export function getAllWeeks(username: string): { weekStart: string; data: WeekData }[] {
  const userData = loadUserData(username);
  return Object.entries(userData.weeks)
    .map(([weekStart, data]) => ({ weekStart, data }))
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart)); // newest first
}

// --- Copy from previous week ---

export function copyFromPreviousWeek(username: string, currentWeekStart: Date): { grid: WeekGrid; notes: WeekNotes } | null {
  const prev = new Date(currentWeekStart);
  prev.setDate(prev.getDate() - 7);
  const { grid, notes } = loadWeekPlan(username, prev);
  if (Object.keys(grid).length === 0) return null;
  return { grid, notes };
}
