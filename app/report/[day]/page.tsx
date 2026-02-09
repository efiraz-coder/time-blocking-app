"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Eraser, Save, Check } from "lucide-react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { getDateForDay, formatDay, getCurrentWeekStart } from "@/lib/date-utils";
import {
  Category,
  CATEGORY_COLORS,
  CATEGORY_BG,
  CATEGORY_LABELS,
  ALL_CATEGORIES,
  HOURS,
  FRIDAY_HOURS,
  DAY_LABELS,
  WEEKDAYS,
} from "@/lib/constants";
import { loadDayReport, saveDayReport, DayReport } from "@/lib/storage";

export default function ReportDayPage({
  params,
}: {
  params: { day: string };
}) {
  const { user } = useAuth();
  const dayOfWeek = Math.max(0, Math.min(5, parseInt(params.day, 10) || 0));
  const isFriday = dayOfWeek === 5;
  const dayHours = isFriday ? FRIDAY_HOURS : HOURS;

  const [weekStart] = useState<Date>(getCurrentWeekStart);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  const dayDate = getDateForDay(weekStart, dayOfWeek);
  const dayLabel = formatDay(dayDate);

  // Start empty - no example data
  const [planned, setPlanned] = useState<Record<number, Category>>(() => {
    const state: Record<number, Category> = {};
    dayHours.forEach((h) => (state[h] = "EMPTY"));
    return state;
  });

  const [actual, setActual] = useState<Record<number, Category>>(() => {
    const state: Record<number, Category> = {};
    dayHours.forEach((h) => (state[h] = "EMPTY"));
    return state;
  });

  // Notes for both planned and actual
  const [plannedNotes, setPlannedNotes] = useState<Record<number, string>>({});
  const [actualNotes, setActualNotes] = useState<Record<number, string>>({});

  // Load saved data
  useEffect(() => {
    if (!user) return;
    const report = loadDayReport(user, weekStart, dayOfWeek);
    if (report) {
      const pState: Record<number, Category> = {};
      const aState: Record<number, Category> = {};
      dayHours.forEach((h) => {
        pState[h] = report.planned[h] ?? "EMPTY";
        aState[h] = report.actual[h] ?? "EMPTY";
      });
      setPlanned(pState);
      setActual(aState);
      setPlannedNotes(report.plannedNotes ?? {});
      setActualNotes(report.actualNotes ?? {});
    } else {
      // Reset to empty when switching days
      const emptyState: Record<number, Category> = {};
      dayHours.forEach((h) => (emptyState[h] = "EMPTY"));
      setPlanned({ ...emptyState });
      setActual({ ...emptyState });
      setPlannedNotes({});
      setActualNotes({});
    }
    setHasChanges(false);
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, weekStart, dayOfWeek]);

  // Editing state: "planned-8" or "actual-14"
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<Category>("PAID_WORK");
  // Which column is being painted: "planned" or "actual"
  const [activeColumn, setActiveColumn] = useState<"planned" | "actual">("actual");

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const handleSave = useCallback(() => {
    if (!user) return;
    const report: DayReport = { planned, actual, plannedNotes, actualNotes };
    saveDayReport(user, weekStart, dayOfWeek, report);
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [user, weekStart, dayOfWeek, planned, actual, plannedNotes, actualNotes]);

  const handleCellClick = useCallback(
    (column: "planned" | "actual", hour: number) => {
      if (editingCell) return; // don't change category while editing text
      if (column === "planned") {
        setPlanned((prev) => ({ ...prev, [hour]: selectedCategory }));
      } else {
        setActual((prev) => ({ ...prev, [hour]: selectedCategory }));
      }
      setHasChanges(true);
    },
    [selectedCategory, editingCell]
  );

  const handleDoubleClick = (column: "planned" | "actual", hour: number) => {
    setEditingCell(`${column}-${hour}`);
  };

  const handleNoteSubmit = (column: "planned" | "actual", hour: number, value: string) => {
    if (column === "planned") {
      setPlannedNotes((prev) => ({ ...prev, [hour]: value }));
    } else {
      setActualNotes((prev) => ({ ...prev, [hour]: value }));
    }
    setEditingCell(null);
    if (value.trim()) setHasChanges(true);
  };

  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, column: "planned" | "actual", hour: number) => {
    if (e.key === "Enter") {
      handleNoteSubmit(column, hour, (e.target as HTMLInputElement).value);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const renderCell = (column: "planned" | "actual", hour: number) => {
    const cat = column === "planned" ? planned[hour] : actual[hour];
    const notes = column === "planned" ? plannedNotes : actualNotes;
    const note = notes[hour] || "";
    const cellKey = `${column}-${hour}`;
    const isEditing = editingCell === cellKey;

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          defaultValue={note}
          onBlur={(e) => handleNoteSubmit(column, hour, e.target.value)}
          onKeyDown={(e) => handleNoteKeyDown(e, column, hour)}
          className="w-full h-11 rounded-xl border-2 border-primary/50 px-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          placeholder="כתוב כאן..."
          dir="rtl"
        />
      );
    }

    const isEmpty = cat === "EMPTY";
    const isActual = column === "actual";

    return (
      <button
        type="button"
        className={cn(
          "w-full h-11 rounded-xl flex items-center justify-center text-xs font-medium transition-apple relative",
          isEmpty && "bg-gray-50/80 hover:bg-gray-100",
          isActual && !isEmpty && "hover:scale-105 hover:shadow-md",
          !isActual && !isEmpty && "hover:scale-105 hover:shadow-md"
        )}
        style={
          !isEmpty
            ? isActual
              ? { backgroundColor: CATEGORY_BG[cat], color: CATEGORY_COLORS[cat] }
              : { backgroundColor: CATEGORY_COLORS[cat], color: "#fff", opacity: 0.85 }
            : undefined
        }
        onClick={() => handleCellClick(column, hour)}
        onDoubleClick={() => handleDoubleClick(column, hour)}
        title={`${hour}:00-${hour + 1}:00 ${CATEGORY_LABELS[cat]}${note ? ` - ${note}` : ""} | דאבל-קליק לכתיבה`}
      >
        {note ? (
          <span className="truncate px-1">{note}</span>
        ) : !isEmpty ? (
          CATEGORY_LABELS[cat]
        ) : (
          "—"
        )}
      </button>
    );
  };

  return (
    <AuthGuard>
    <AppShell>
      <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">דיווח יומי</h1>
            <p className="text-muted-foreground mt-1">
              {dayLabel}
              {isFriday && " (עד 14:00)"}
              {" "}&middot; לחיצה = צבע, דאבל-קליק = כתיבה
            </p>
          </div>
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl text-white shadow-apple hover:shadow-apple-hover transition-apple text-sm font-medium",
              saved ? "bg-green-500" : hasChanges ? "bg-primary" : "bg-gray-300 cursor-default"
            )}
            disabled={!hasChanges && !saved}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "נשמר!" : "שמור דיווח"}
          </button>
        </header>

        {/* Day Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {WEEKDAYS.map((d) => (
            <Link
              key={d}
              href={`/report/${d}`}
              className={cn(
                "px-4 py-2 rounded-2xl text-sm font-medium transition-apple min-h-[44px] flex items-center",
                d === dayOfWeek
                  ? "bg-primary text-white shadow-apple"
                  : "bg-white text-muted-foreground shadow-apple hover:shadow-apple-hover hover:text-foreground",
                d === 5 && d !== dayOfWeek && "text-orange-500"
              )}
            >
              {DAY_LABELS[d]}
            </Link>
          ))}
        </div>

        {/* Column Selector */}
        <div className="mb-4 flex gap-2 p-3 rounded-2xl bg-white shadow-apple">
          <span className="text-xs text-muted-foreground flex items-center ml-2">עמודה פעילה:</span>
          <button
            onClick={() => setActiveColumn("planned")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-apple",
              activeColumn === "planned"
                ? "bg-foreground/80 text-white shadow-sm"
                : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
            )}
          >
            תכנון
          </button>
          <button
            onClick={() => setActiveColumn("actual")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-apple",
              activeColumn === "actual"
                ? "bg-primary/80 text-white shadow-sm"
                : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
            )}
          >
            ביצוע
          </button>
        </div>

        {/* Legend */}
        <div className="mb-6 flex gap-4 p-4 rounded-2xl bg-white shadow-apple">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded-lg bg-foreground/80" />
            <span className="text-muted-foreground">תכנון</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-4 h-4 rounded-lg bg-primary/60" />
            <span className="text-muted-foreground">ביצוע</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto">
            דאבל-קליק לכתיבה בבלוק
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          <div className="flex-1">
            <div className="rounded-3xl bg-white shadow-apple overflow-hidden">
              <div className="grid grid-cols-[60px_1fr_1fr] text-center">
                <div className="p-3 bg-accent/50 text-xs font-semibold text-muted-foreground">שעה</div>
                <div className={cn(
                  "p-3 text-xs font-semibold cursor-pointer transition-apple",
                  activeColumn === "planned" ? "bg-foreground/10 text-foreground" : "bg-accent/50 text-muted-foreground"
                )} onClick={() => setActiveColumn("planned")}>
                  תכנון {activeColumn === "planned" && "✏️"}
                </div>
                <div className={cn(
                  "p-3 text-xs font-semibold cursor-pointer transition-apple",
                  activeColumn === "actual" ? "bg-primary/10 text-primary" : "bg-accent/50 text-muted-foreground"
                )} onClick={() => setActiveColumn("actual")}>
                  ביצוע {activeColumn === "actual" && "✏️"}
                </div>
              </div>

              {dayHours.map((hour) => {
                return (
                  <div key={hour} className="grid grid-cols-[60px_1fr_1fr] border-t border-border/20">
                    <div className="px-3 py-1 text-[11px] text-muted-foreground font-medium flex items-center justify-center bg-accent/20">
                      {String(hour).padStart(2, "0")}:00
                    </div>
                    <div className={cn("p-1", activeColumn === "planned" && "bg-foreground/[0.02]")}>
                      {renderCell("planned", hour)}
                    </div>
                    <div className={cn("p-1", activeColumn === "actual" && "bg-primary/[0.02]")}>
                      {renderCell("actual", hour)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Picker */}
          <div className="w-full lg:w-52 shrink-0">
            <div className="sticky top-6 rounded-3xl bg-white shadow-apple p-5">
              <h3 className="text-sm font-bold mb-3 text-foreground/80">
                סמן {activeColumn === "planned" ? "תכנון" : "ביצוע"}
              </h3>
              <div className="space-y-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium transition-apple min-h-[44px]",
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
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium transition-apple min-h-[44px]",
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
