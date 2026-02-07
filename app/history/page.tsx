"use client";

import AppShell from "@/components/AppShell";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Category,
  CATEGORY_COLORS,
  CATEGORY_BG,
  CATEGORY_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const WEEKS = [
  { label: "שבוע 1-7 פבר'", data: { PAID_WORK: 30, FAMILY: 12, PERSONAL: 8, HOUSEHOLD: 6, RELATIONSHIP: 4, UNPAID_WORK: 5 } as Record<string, number> },
  { label: "שבוע 8-14 פבר'", data: { PAID_WORK: 32, FAMILY: 14, PERSONAL: 7, HOUSEHOLD: 5, RELATIONSHIP: 5, UNPAID_WORK: 4 } as Record<string, number> },
  { label: "שבוע 15-21 פבר'", data: { PAID_WORK: 28, FAMILY: 16, PERSONAL: 9, HOUSEHOLD: 7, RELATIONSHIP: 3, UNPAID_WORK: 6 } as Record<string, number> },
];

const CATS: Category[] = ["PAID_WORK", "FAMILY", "PERSONAL", "HOUSEHOLD", "RELATIONSHIP", "UNPAID_WORK"];

export default function HistoryPage() {
  return (
    <AppShell>
      <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">היסטוריה שבועית</h1>
          <p className="text-muted-foreground mt-1">מעקב מגמות לאורך זמן</p>
        </header>

        {/* Week Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {WEEKS.map((week, i) => (
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
                  const maxHours = Math.max(...Object.values(week.data));
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
        <div className="rounded-3xl bg-white shadow-apple p-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <h3 className="text-lg font-bold mb-4">מגמות</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">קטגוריה</th>
                  {WEEKS.map((w) => (
                    <th key={w.label} className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">
                      {w.label}
                    </th>
                  ))}
                  <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">מגמה</th>
                </tr>
              </thead>
              <tbody>
                {CATS.map((cat) => {
                  const values = WEEKS.map((w) => w.data[cat] ?? 0);
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
      </div>
    </AppShell>
  );
}
