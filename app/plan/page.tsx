"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  User,
  Home,
  Wrench,
  Heart,
  Briefcase,
  Coffee,
  Eraser,
  Pencil,
  Save,
  Check,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { formatWeekRange } from "@/lib/date-utils";
import WeekNavigator, { parseWeekParam } from "@/components/WeekNavigator";
import { useSearchParams } from "next/navigation";
import {
  Category,
  CATEGORY_COLORS,
  CATEGORY_BG,
  CATEGORY_LABELS,
  ALL_CATEGORIES,
  DAY_LABELS,
  HOURS,
  FRIDAY_HOURS,
  WEEKDAYS,
} from "@/lib/constants";
import { loadWeekPlan, saveWeekPlan, WeekGrid, WeekNotes } from "@/lib/storage";

const ICON_MAP: Record<Category, React.ComponentType<{ className?: string }>> = {
  PERSONAL: User,
  FAMILY: Home,
  HOUSEHOLD: Wrench,
  RELATIONSHIP: Heart,
  PAID_WORK: Briefcase,
  UNPAID_WORK: Coffee,
  EMPTY: Eraser,
};

function PlanContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [weekStart, setWeekStart] = useState<Date>(() => parseWeekParam(searchParams.get("week")));
  const [selectedCategory, setSelectedCategory] = useState<Category>("PAID_WORK");
  const [grid, setGrid] = useState<WeekGrid>({});
  const [notes, setNotes] = useState<WeekNotes>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const weekRange = formatWeekRange(weekStart);

  // Load data from localStorage on mount or when week changes
  useEffect(() => {
    if (!user) return;
    const { grid: savedGrid, notes: savedNotes } = loadWeekPlan(user, weekStart);

    // Build initial grid with EMPTY defaults
    const initialGrid: WeekGrid = {};
    WEEKDAYS.forEach((day) => {
      const hours = day === 5 ? FRIDAY_HOURS : HOURS;
      hours.forEach((hour) => {
        initialGrid[`${day}-${hour}`] = savedGrid[`${day}-${hour}`] ?? "EMPTY";
      });
    });
    setGrid(initialGrid);
    setNotes(savedNotes);
    setHasChanges(false);
    setSaved(false);
  }, [user, weekStart]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  const handleSave = useCallback(() => {
    if (!user) return;
    saveWeekPlan(user, weekStart, grid, notes);
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [user, weekStart, grid, notes]);

  const handleCellClick = useCallback(
    (day: number, hour: number) => {
      setGrid((prev) => ({
        ...prev,
        [`${day}-${hour}`]: selectedCategory,
      }));
      setHasChanges(true);
    },
    [selectedCategory]
  );

  const handleMouseDown = useCallback(
    (day: number, hour: number) => {
      if (editingCell) return;
      setIsDragging(true);
      handleCellClick(day, hour);
    },
    [handleCellClick, editingCell]
  );

  const handleMouseEnter = useCallback(
    (day: number, hour: number) => {
      if (isDragging && !editingCell) handleCellClick(day, hour);
    },
    [isDragging, handleCellClick, editingCell]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleDoubleClick = useCallback((day: number, hour: number) => {
    setEditingCell(`${day}-${hour}`);
    setIsDragging(false);
  }, []);

  const handleNoteChange = useCallback((key: string, value: string) => {
    setNotes((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleNoteSubmit = useCallback(() => setEditingCell(null), []);

  const handleNoteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleNoteSubmit();
      else if (e.key === "Escape") setEditingCell(null);
    },
    [handleNoteSubmit]
  );

  const getCellCategory = (day: number, hour: number): Category =>
    grid[`${day}-${hour}`] ?? "EMPTY";
  const getCellNote = (day: number, hour: number): string =>
    notes[`${day}-${hour}`] ?? "";

  const summary = ALL_CATEGORIES.map((cat) => ({
    category: cat,
    hours: Object.values(grid).filter((c) => c === cat).length,
  })).filter((s) => s.hours > 0);

  const totalHours = summary.reduce((sum, s) => sum + s.hours, 0);

  return (
    <AppShell>
      <div
        className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">תכנון שבועי</h1>
            <p className="text-muted-foreground mt-1">
              שבוע {weekRange} &middot; לחיצה = צבע, דאבל-קליק = כתיבה
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-2xl text-white shadow-apple hover:shadow-apple-hover transition-apple text-sm font-medium",
                saved ? "bg-green-500" : hasChanges ? "bg-primary" : "bg-gray-300 cursor-default"
              )}
              disabled={!hasChanges && !saved}
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "נשמר!" : "שמור תכנון"}
            </button>
            <WeekNavigator weekStart={weekStart} onWeekChange={setWeekStart} />
          </div>
        </header>

        <div className="flex gap-6 flex-col xl:flex-row">
          {/* Category Picker */}
          <div className="w-full xl:w-56 shrink-0 order-2 xl:order-1">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-3xl bg-white shadow-apple p-5">
                <h3 className="text-sm font-bold mb-3 text-foreground/80">בחר קטגוריה</h3>
                <div className="space-y-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const IconComp = ICON_MAP[cat];
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-apple",
                          isSelected ? "shadow-sm" : "hover:bg-accent"
                        )}
                        style={{
                          backgroundColor: isSelected ? CATEGORY_BG[cat] : undefined,
                          outline: isSelected ? `2px solid ${CATEGORY_COLORS[cat]}` : undefined,
                          outlineOffset: "1px",
                        }}
                      >
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                        >
                          <IconComp className="w-4 h-4" />
                        </span>
                        {CATEGORY_LABELS[cat]}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setSelectedCategory("EMPTY")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-apple",
                      selectedCategory === "EMPTY"
                        ? "bg-gray-100 shadow-sm outline outline-2 outline-offset-1 outline-gray-400"
                        : "hover:bg-accent"
                    )}
                  >
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-200 text-gray-500 shadow-sm shrink-0">
                      <Eraser className="w-4 h-4" />
                    </span>
                    מחק (ריק)
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 shadow-apple p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Pencil className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-700">טיפ</span>
                </div>
                <p className="text-[11px] text-blue-600/80 leading-relaxed">
                  <strong>לחיצה</strong> = צביעת תא בקטגוריה<br />
                  <strong>דאבל-קליק</strong> = כתיבת טקסט בתא<br />
                  <strong>גרירה</strong> = צביעת מספר תאים
                </p>
              </div>

              <div className="rounded-3xl bg-white shadow-apple p-5">
                <h3 className="text-sm font-bold mb-3 text-foreground/80">סיכום שעות</h3>
                {summary.length === 0 ? (
                  <p className="text-xs text-muted-foreground">לחץ על תאים כדי להתחיל</p>
                ) : (
                  <div className="space-y-2.5">
                    {summary.map(({ category, hours }) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[category] }}
                          />
                          <span className="text-xs">{CATEGORY_LABELS[category]}</span>
                        </div>
                        <span className="text-xs font-bold">{hours} שעות</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs font-bold">סה&quot;כ</span>
                      <span className="text-xs font-bold text-primary">{totalHours} שעות</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 order-1 xl:order-2">
            <div className="rounded-3xl bg-white shadow-apple overflow-hidden select-none">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="p-3 w-20 text-xs font-semibold text-muted-foreground bg-accent/50" />
                      {DAY_LABELS.map((label, i) => (
                        <th
                          key={i}
                          className={cn(
                            "p-3 text-sm font-bold bg-accent/50",
                            i === 5 ? "text-orange-500" : "text-foreground/80"
                          )}
                        >
                          {label}
                          {i === 5 && <span className="block text-[10px] font-normal text-orange-400">עד 14:00</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HOURS.map((hour) => (
                      <tr key={hour} className="group">
                        <td className="px-3 py-0 text-[11px] text-muted-foreground font-medium text-center bg-accent/30">
                          {String(hour).padStart(2, "0")}:00
                        </td>
                        {WEEKDAYS.map((day) => {
                          // Friday only until 14:00 (hours 6-13)
                          if (day === 5 && hour >= 14) {
                            return (
                              <td key={`${day}-${hour}`} className="p-0.5">
                                <div className="w-full h-10 rounded-xl bg-gray-100/50" />
                              </td>
                            );
                          }

                          const key = `${day}-${hour}`;
                          const cat = getCellCategory(day, hour);
                          const note = getCellNote(day, hour);
                          const color = CATEGORY_COLORS[cat];
                          const bg = CATEGORY_BG[cat];
                          const isEditing = editingCell === key;

                          return (
                            <td key={key} className="p-0.5">
                              {isEditing ? (
                                <div
                                  className="w-full h-10 rounded-xl border-2 border-primary/60 overflow-hidden"
                                  style={{ backgroundColor: cat !== "EMPTY" ? bg : "#F9FAFB" }}
                                >
                                  <input
                                    ref={inputRef}
                                    type="text"
                                    value={notes[key] ?? ""}
                                    onChange={(e) => handleNoteChange(key, e.target.value)}
                                    onBlur={handleNoteSubmit}
                                    onKeyDown={handleNoteKeyDown}
                                    placeholder="הקלד כאן..."
                                    className="w-full h-full px-2 text-[11px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50 text-right"
                                    dir="rtl"
                                  />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className={cn(
                                    "w-full h-10 rounded-xl border transition-all duration-150 relative group/cell",
                                    cat === "EMPTY"
                                      ? "bg-gray-50/50 border-gray-100 hover:border-gray-200 hover:shadow-sm"
                                      : "border-transparent hover:shadow-md",
                                    !note && "hover:scale-105"
                                  )}
                                  style={cat !== "EMPTY" ? { backgroundColor: bg, borderColor: `${color}40` } : undefined}
                                  onMouseDown={() => handleMouseDown(day, hour)}
                                  onMouseEnter={() => handleMouseEnter(day, hour)}
                                  onDoubleClick={() => handleDoubleClick(day, hour)}
                                  title={`${hour}:00-${hour + 1}:00 ${CATEGORY_LABELS[cat]}${note ? ` — ${note}` : ""}\nדאבל-קליק לכתיבה`}
                                >
                                  {note ? (
                                    <span
                                      className="text-[10px] font-medium leading-tight px-1.5 truncate block max-w-full"
                                      style={{ color: cat !== "EMPTY" ? color : "#6B7280" }}
                                    >
                                      {note}
                                    </span>
                                  ) : (
                                    cat !== "EMPTY" && (
                                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
                                    )
                                  )}
                                  {!note && (
                                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-40 transition-opacity pointer-events-none">
                                      <Pencil className="w-3 h-3 text-muted-foreground" />
                                    </span>
                                  )}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function PlanPage() {
  return (
    <AuthGuard>
      <PlanContent />
    </AuthGuard>
  );
}
