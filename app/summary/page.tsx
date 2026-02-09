"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth-context";
import { formatWeekRange } from "@/lib/date-utils";
import WeekNavigator, { parseWeekParam } from "@/components/WeekNavigator";
import { useSearchParams } from "next/navigation";
import {
  Category,
  CATEGORY_COLORS,
  CATEGORY_BG,
  CATEGORY_LABELS,
  ALL_CATEGORIES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getWeekSummary, loadWeekPlan } from "@/lib/storage";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type SummaryRow = {
  category: Category;
  planned: number;
  actual: number;
  diff: number;
  diffPercent: number;
};

function SummaryContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [weekStart, setWeekStart] = useState<Date>(() => parseWeekParam(searchParams.get("week")));
  const [summaryData, setSummaryData] = useState<SummaryRow[]>([]);

  const weekRange = formatWeekRange(weekStart);

  // Load real data from localStorage
  useEffect(() => {
    if (!user) return;

    const weekSummary = getWeekSummary(user, weekStart);
    const { grid } = loadWeekPlan(user, weekStart);

    // Count planned hours from grid
    const plannedFromGrid: Record<string, number> = {};
    for (const [, cat] of Object.entries(grid)) {
      if (cat && cat !== "EMPTY") {
        plannedFromGrid[cat] = (plannedFromGrid[cat] ?? 0) + 1;
      }
    }

    // Merge with report-level planned
    const allPlanned = { ...plannedFromGrid };
    for (const [cat, hours] of Object.entries(weekSummary.planned)) {
      if (cat !== "EMPTY") {
        if (!allPlanned[cat]) {
          allPlanned[cat] = hours;
        }
      }
    }

    const rows: SummaryRow[] = ALL_CATEGORIES.map((cat) => {
      const planned = allPlanned[cat] ?? 0;
      const actual = weekSummary.actual[cat] ?? 0;
      const diff = actual - planned;
      const diffPercent = planned > 0 ? Math.round((diff / planned) * 100) : actual > 0 ? 100 : 0;
      return { category: cat, planned, actual, diff, diffPercent };
    }).filter((r) => r.planned > 0 || r.actual > 0);

    setSummaryData(rows);
  }, [user, weekStart]);

  const chartData = summaryData.map((r) => ({
    name: CATEGORY_LABELS[r.category],
    תכנון: r.planned,
    בפועל: r.actual,
  }));

  const isEmpty = summaryData.length === 0;

  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">סיכום שבועי</h1>
            <p className="text-muted-foreground mt-1">שבוע {weekRange}</p>
          </div>
          <WeekNavigator weekStart={weekStart} onWeekChange={setWeekStart} />
        </header>

        {isEmpty ? (
          <div className="rounded-3xl bg-white shadow-apple p-12 text-center animate-slide-up">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-bold mb-2">אין נתונים עדיין</h3>
            <p className="text-muted-foreground text-sm">
              התחל בתכנון שבועי ודיווח יומי כדי לראות סיכום כאן
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {summaryData.map((row, i) => (
                <div
                  key={row.category}
                  className="rounded-3xl p-5 shadow-apple animate-slide-up"
                  style={{
                    backgroundColor: CATEGORY_BG[row.category],
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[row.category] }}
                    />
                    <span className="text-sm font-semibold">{CATEGORY_LABELS[row.category]}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>תכנון: {row.planned}h</span>
                    <span>בפועל: {row.actual}h</span>
                  </div>
                  <div
                    className={cn(
                      "text-lg font-bold",
                      row.diff > 0 ? "text-green-600" : row.diff < 0 ? "text-red-500" : "text-foreground"
                    )}
                  >
                    {row.diff >= 0 ? "+" : ""}
                    {row.diff}h
                    <span className="text-xs font-normal mr-1">
                      ({row.diffPercent >= 0 ? "+" : ""}{row.diffPercent}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-3xl bg-white shadow-apple p-6 mb-8 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <h3 className="text-lg font-bold mb-4">תכנון מול ביצוע</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">קטגוריה</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">תכנון שבועי</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">בפועל שבועי</th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">פער</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.map((row) => (
                      <tr key={row.category} className="border-b border-border/10 hover:bg-accent/30 transition-apple">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: CATEGORY_COLORS[row.category] }}
                            />
                            <span className="text-sm font-medium">{CATEGORY_LABELS[row.category]}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-sm">{row.planned}h</td>
                        <td className="py-3 px-3 text-sm">{row.actual}h</td>
                        <td className="py-3 px-3 text-sm">
                          <span
                            className={cn(
                              "font-semibold",
                              row.diff > 0 ? "text-green-600" : row.diff < 0 ? "text-red-500" : ""
                            )}
                          >
                            {row.diff >= 0 ? "+" : ""}{row.diff}h ({row.diffPercent >= 0 ? "+" : ""}{row.diffPercent}%)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-3xl bg-white shadow-apple p-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
              <h3 className="text-lg font-bold mb-6">גרף השוואתי</h3>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: "#86868B" }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={70}
                      tick={{ fontSize: 12, fill: "#86868B" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="תכנון" fill="#60A5FA" radius={[0, 8, 8, 0]} />
                    <Bar dataKey="בפועל" fill="#34D399" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

export default function SummaryPage() {
  return (
    <AuthGuard>
      <SummaryContent />
    </AuthGuard>
  );
}
