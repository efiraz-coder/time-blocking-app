"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth-context";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Category,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  ALL_CATEGORIES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getAllWeeks, WeekData } from "@/lib/storage";

interface WeekEntry {
  label: string;
  data: Record<string, number>;
}

function computeWeekHours(weekData: WeekData): Record<string, number> {
  const hours: Record<string, number> = {};

  // Count from grid (plan)
  for (const [, cat] of Object.entries(weekData.grid)) {
    if (cat && cat !== "EMPTY") {
      hours[cat] = (hours[cat] ?? 0) + 1;
    }
  }

  // Count from reports (actual data)
  for (const [, report] of Object.entries(weekData.reports)) {
    for (const [, cat] of Object.entries(report.actual)) {
      if (cat && cat !== "EMPTY") {
        hours[cat] = (hours[cat] ?? 0) + 1;
      }
    }
    // Also count planned from reports if grid is empty
    for (const [, cat] of Object.entries(report.planned)) {
      if (cat && cat !== "EMPTY") {
        hours[cat] = (hours[cat] ?? 0) + 1;
      }
    }
  }

  return hours;
}

function formatWeekLabel(weekStartStr: string): string {
  const d = new Date(weekStartStr + "T00:00:00");
  const end = new Date(d);
  end.setDate(end.getDate() + 5); // Sunday + 5 = Friday

  const fmtDay = new Intl.DateTimeFormat("he-IL", { day: "numeric" });
  const fmtMonth = new Intl.DateTimeFormat("he-IL", { month: "short" });

  const startMonth = fmtMonth.format(d);
  const endMonth = fmtMonth.format(end);

  if (startMonth === endMonth) {
    return `שבוע ${fmtDay.format(d)}-${fmtDay.format(end)} ${endMonth}`;
  }
  return `שבוע ${fmtDay.format(d)} ${startMonth} - ${fmtDay.format(end)} ${endMonth}`;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<WeekEntry[]>([]);

  const CATS: Category[] = ALL_CATEGORIES;

  useEffect(() => {
    if (!user) return;
    const allWeeks = getAllWeeks(user);

    const entries: WeekEntry[] = allWeeks
      .map(({ weekStart, data }) => ({
        label: formatWeekLabel(weekStart),
        data: computeWeekHours(data),
      }))
      .filter((w) => Object.keys(w.data).length > 0); // Only show weeks with data

    setWeeks(entries);
  }, [user]);

  const isEmpty = weeks.length === 0;

  return (
    <AuthGuard>
    <AppShell>
      <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">היסטוריה שבועית</h1>
          <p className="text-muted-foreground mt-1">מעקב מגמות לאורך זמן</p>
        </header>

        {isEmpty ? (
          <div className="rounded-3xl bg-white shadow-apple p-12 text-center animate-slide-up">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-bold mb-2">אין היסטוריה עדיין</h3>
            <p className="text-muted-foreground text-sm">
              התחל לתכנן ולדווח כדי לראות מגמות לאורך זמן
            </p>
          </div>
        ) : (
          <>
            {/* Week Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {weeks.map((week, i) => (
                <div
                  key={week.label}
                  className="rounded-3xl bg-white shadow-apple p-5 animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <h3 className="text-sm font-bold mb-3 text-foreground/80">{week.label}</h3>
                  <div className="space-y-2">
                    {CATS.map((cat) => {
                      const hours = week.data[cat] ?? 0;
                      if (hours === 0) return null;
                      const maxHours = Math.max(...Object.values(week.data), 1);
                      const pct = (hours / maxHours) * 100;
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                              />
                              <span className="text-muted-foreground">{CATEGORY_LABELS[cat]}</span>
                            </div>
                            <span className="font-semibold">{hours}h</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat] }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Trends Table */}
            {weeks.length >= 2 && (
              <div className="rounded-3xl bg-white shadow-apple p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
                <h3 className="text-lg font-bold mb-4">מגמות</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">קטגוריה</th>
                        {weeks.map((w) => (
                          <th key={w.label} className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">
                            {w.label}
                          </th>
                        ))}
                        <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">מגמה</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CATS.map((cat) => {
                        const values = weeks.map((w) => w.data[cat] ?? 0);
                        const hasAnyData = values.some((v) => v > 0);
                        if (!hasAnyData) return null;
                        const first = values[0];
                        const last = values[values.length - 1];
                        const diff = last - first;
                        return (
                          <tr key={cat} className="border-b border-border/10 hover:bg-accent/30 transition-apple">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                                />
                                <span className="text-sm font-medium">{CATEGORY_LABELS[cat]}</span>
                              </div>
                            </td>
                            {values.map((v, i) => (
                              <td key={i} className="py-3 px-3 text-sm">{v}h</td>
                            ))}
                            <td className="py-3 px-3">
                              <div
                                className={cn(
                                  "flex items-center gap-1 text-sm font-semibold",
                                  diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "text-muted-foreground"
                                )}
                              >
                                {diff > 0 ? (
                                  <TrendingUp className="w-4 h-4" />
                                ) : diff < 0 ? (
                                  <TrendingDown className="w-4 h-4" />
                                ) : (
                                  <Minus className="w-4 h-4" />
                                )}
                                {diff >= 0 ? "+" : ""}{diff}h
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
    </AuthGuard>
  );
}
