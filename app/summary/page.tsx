"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { formatWeekRange, getCurrentWeekStart } from "@/lib/date-utils";
import {
  Category,
  CATEGORY_COLORS,
  CATEGORY_BG,
  CATEGORY_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
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

const MOCK_DATA: SummaryRow[] = [
  { category: "PAID_WORK", planned: 30, actual: 28, diff: -2, diffPercent: -7 },
  { category: "FAMILY", planned: 12, actual: 14, diff: 2, diffPercent: 17 },
  { category: "PERSONAL", planned: 8, actual: 6, diff: -2, diffPercent: -25 },
  { category: "HOUSEHOLD", planned: 6, actual: 7, diff: 1, diffPercent: 17 },
  { category: "RELATIONSHIP", planned: 4, actual: 5, diff: 1, diffPercent: 25 },
  { category: "UNPAID_WORK", planned: 5, actual: 5, diff: 0, diffPercent: 0 },
];

export default function SummaryPage() {
  const [weekStart] = useState<Date>(getCurrentWeekStart);

  const weekRange = formatWeekRange(weekStart);

  const chartData = MOCK_DATA.map((r) => ({
    name: CATEGORY_LABELS[r.category],
    תכנון: r.planned,
    בפועל: r.actual,
  }));

  return (
    <AuthGuard>
    <AppShell>
      <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">סיכום שבועי</h1>
          <p className="text-muted-foreground mt-1">שבוע {weekRange}</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {MOCK_DATA.map((row, i) => (
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
                {MOCK_DATA.map((row) => (
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
          <div className="h-80">
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
      </div>
    </AppShell>
    </AuthGuard>
  );
}
