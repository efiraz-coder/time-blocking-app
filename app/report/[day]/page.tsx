"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Eraser, Save } from "lucide-react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { cn } from "@/lib/utils";
import { getDateForDay, formatDay, getCurrentWeekStart } from "@/lib/date-utils";
import {
  Category,
  CATEGORY_COLORS,
  CATEGORY_BG,
  CATEGORY_LABELS,
  ALL_CATEGORIES,
  HOURS,
  DAY_LABELS,
} from "@/lib/constants";

export default function ReportDayPage({
  params,
}: {
  params: { day: string };
}) {
  const dayOfWeek = Math.max(0, Math.min(4, parseInt(params.day, 10) || 0));
  const [weekStart] = useState<Date>(getCurrentWeekStart);
  const [hasChanges, setHasChanges] = useState(false);

  const dayDate = getDateForDay(weekStart, dayOfWeek);
  const dayLabel = formatDay(dayDate);

  const [planned] = useState<Record<number, Category>>(() => {
    const state: Record<number, Category> = {};
    HOURS.forEach((h) => (state[h] = "EMPTY"));
    state[8] = "PAID_WORK";
    state[9] = "PAID_WORK";
    state[10] = "PAID_WORK";
    state[11] = "PERSONAL";
    state[14] = "PAID_WORK";
    state[15] = "PAID_WORK";
    state[16] = "FAMILY";
    state[17] = "FAMILY";
    return state;
  });

  const [actual, setActual] = useState<Record<number, Category>>(() => {
    const state: Record<number, Category> = {};
    HOURS.forEach((h) => (state[h] = planned[h] as Category));
    state[11] = "PAID_WORK";
    state[14] = "PERSONAL";
    return state;
  });

  const [selectedCategory, setSelectedCategory] = useState<Category>("PAID_WORK");

  const handleActualClick = useCallback(
    (hour: number) => {
      setActual((prev) => ({ ...prev, [hour]: selectedCategory }));
      setHasChanges(true);
    },
    [selectedCategory]
  );

  return (
    <AuthGuard>
    <AppShell>
      <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">דיווח יומי</h1>
            <p className="text-muted-foreground mt-1">{dayLabel} &middot; תכנון מול ביצוע</p>
          </div>
          {hasChanges && (
            <button
              onClick={() => { setHasChanges(false); alert("נשמר! (כרגע מקומי בלבד)"); }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-white shadow-apple hover:shadow-apple-hover transition-apple text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              שמור דיווח
            </button>
          )}
        </header>

        {/* Day Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[0, 1, 2, 3, 4].map((d) => (
            <Link
              key={d}
              href={`/report/${d}`}
              className={cn(
                "px-4 py-2 rounded-2xl text-sm font-medium transition-apple",
                d === dayOfWeek
                  ? "bg-primary text-white shadow-apple"
                  : "bg-white text-muted-foreground shadow-apple hover:shadow-apple-hover hover:text-foreground"
              )}
            >
              {DAY_LABELS[d]}
            </Link>
          ))}
        </div>

        {/* Legend */}
        <div className="mb-6 flex gap-4 p-4 rounded-2xl bg-white shadow-apple">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded-lg bg-foreground/80" />
            <span className="text-muted-foreground">תכנון</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded-lg bg-primary/60" />
            <span className="text-muted-foreground">ביצוע (לחץ לשינוי)</span>
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          <div className="flex-1">
            <div className="rounded-3xl bg-white shadow-apple overflow-hidden">
              <div className="grid grid-cols-[60px_1fr_1fr] text-center">
                <div className="p-3 bg-accent/50 text-xs font-semibold text-muted-foreground">שעה</div>
                <div className="p-3 bg-accent/50 text-xs font-semibold text-muted-foreground">תכנון</div>
                <div className="p-3 bg-accent/50 text-xs font-semibold text-muted-foreground">ביצוע</div>
              </div>

              {HOURS.map((hour) => {
                const plannedCat = planned[hour] ?? "EMPTY";
                const actualCat = actual[hour] ?? "EMPTY";
                const match = plannedCat === actualCat;
                return (
                  <div key={hour} className="grid grid-cols-[60px_1fr_1fr] border-t border-border/20">
                    <div className="px-3 py-1 text-[11px] text-muted-foreground font-medium flex items-center justify-center bg-accent/20">
                      {String(hour).padStart(2, "0")}:00
                    </div>
                    <div className="p-1">
                      <div
                        className={cn(
                          "h-11 rounded-xl flex items-center justify-center text-xs font-medium transition-apple",
                          plannedCat === "EMPTY" && "bg-gray-50/50"
                        )}
                        style={
                          plannedCat !== "EMPTY"
                            ? { backgroundColor: CATEGORY_COLORS[plannedCat], color: "#fff", opacity: 0.85 }
                            : undefined
                        }
                        title={`${hour}:00-${hour + 1}:00 ${CATEGORY_LABELS[plannedCat]} (תכנון)`}
                      >
                        {plannedCat !== "EMPTY" && CATEGORY_LABELS[plannedCat]}
                      </div>
                    </div>
                    <div className="p-1">
                      <button
                        type="button"
                        className={cn(
                          "w-full h-11 rounded-xl flex items-center justify-center text-xs font-medium transition-apple hover:scale-105 hover:shadow-md",
                          actualCat === "EMPTY" && "bg-gray-50/80 hover:bg-gray-100",
                          !match && actualCat !== "EMPTY" && "ring-2 ring-amber-300/50"
                        )}
                        style={
                          actualCat !== "EMPTY"
                            ? { backgroundColor: CATEGORY_BG[actualCat], color: CATEGORY_COLORS[actualCat] }
                            : undefined
                        }
                        onClick={() => handleActualClick(hour)}
                        title={`${hour}:00-${hour + 1}:00 ${CATEGORY_LABELS[actualCat]} - לחץ לשינוי`}
                      >
                        {actualCat !== "EMPTY" ? CATEGORY_LABELS[actualCat] : "—"}
                        {!match && actualCat !== "EMPTY" && <span className="mr-1 text-[10px]">⚡</span>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Picker */}
          <div className="w-full lg:w-52 shrink-0">
            <div className="sticky top-6 rounded-3xl bg-white shadow-apple p-5">
              <h3 className="text-sm font-bold mb-3 text-foreground/80">סמן ביצוע</h3>
              <div className="space-y-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium transition-apple",
                      selectedCategory === cat ? "shadow-sm" : "hover:bg-accent"
                    )}
                    style={{
                      backgroundColor: selectedCategory === cat ? CATEGORY_BG[cat] : undefined,
                      outline: selectedCategory === cat ? `2px solid ${CATEGORY_COLORS[cat]}` : undefined,
                      outlineOffset: "1px",
                    }}
                  >
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                    >
                      <span className="text-[10px]">
                        {cat === "PERSONAL" ? "👤" : cat === "FAMILY" ? "🏠" : cat === "HOUSEHOLD" ? "🔧" : cat === "RELATIONSHIP" ? "💜" : cat === "PAID_WORK" ? "💼" : "☕"}
                      </span>
                    </span>
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedCategory("EMPTY")}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium transition-apple",
                    selectedCategory === "EMPTY"
                      ? "bg-gray-100 shadow-sm outline outline-2 outline-offset-1 outline-gray-400"
                      : "hover:bg-accent"
                  )}
                >
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center bg-gray-200 text-gray-500 shrink-0">
                    <Eraser className="w-3 h-3" />
                  </span>
                  מחק
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
    </AuthGuard>
  );
}
