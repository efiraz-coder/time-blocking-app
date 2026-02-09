"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Copy,
  BarChart3,
  Bell,
  FileSpreadsheet,
  Calendar,
  FileText,
  PieChart,
  History,
  Zap,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { addWeeks, formatWeekRange, getCurrentWeekStart } from "@/lib/date-utils";
import { getWeekSummary, loadWeekPlan, copyFromPreviousWeek, saveWeekPlan, getAllWeeks } from "@/lib/storage";

export default function DashboardPage() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState<Date>(getCurrentWeekStart);
  const [reportedDays, setReportedDays] = useState(0);
  const [hasPlan, setHasPlan] = useState(false);
  const [weekCount, setWeekCount] = useState(0);
  const totalDays = 6; // א-ו
  const weekRange = formatWeekRange(weekStart);
  const progressPercent = (reportedDays / totalDays) * 100;

  // Load real data from localStorage
  useEffect(() => {
    if (!user) return;
    const summary = getWeekSummary(user, weekStart);
    setReportedDays(summary.reportedDays);

    const { grid } = loadWeekPlan(user, weekStart);
    const hasGridData = Object.values(grid).some((c) => c && c !== "EMPTY");
    setHasPlan(hasGridData);

    const allWeeks = getAllWeeks(user);
    setWeekCount(allWeeks.length);
  }, [user, weekStart]);

  const resetToCurrentWeek = () => setWeekStart(getCurrentWeekStart());

  const handleCopyFromLastWeek = useCallback(() => {
    if (!user) return;
    const prev = copyFromPreviousWeek(user, weekStart);
    if (prev) {
      saveWeekPlan(user, weekStart, prev.grid, prev.notes);
      setHasPlan(true);
      alert("הועתק בהצלחה מהשבוע הקודם!");
    } else {
      alert("לא נמצא תכנון בשבוע הקודם");
    }
  }, [user, weekStart]);

  const cards = [
    {
      title: "תכנון שבועי (א-ו)",
      href: "/plan",
      icon: Calendar,
      status: hasPlan ? "ready" as const : null,
      statusText: hasPlan ? "מוכן ✓" : "",
      gradient: "from-blue-50 to-indigo-50",
      iconColor: "text-blue-500",
    },
    {
      title: "דיווח יומי",
      href: "/report/0",
      icon: FileText,
      status: reportedDays > 0 ? (reportedDays >= totalDays ? "ready" as const : "missing" as const) : null,
      statusText: reportedDays > 0 ? (reportedDays >= totalDays ? "הושלם ✓" : `חסר ${totalDays - reportedDays} ימים ⏳`) : "",
      gradient: "from-amber-50 to-orange-50",
      iconColor: "text-amber-500",
    },
    {
      title: "סיכום שבועי",
      href: "/summary",
      icon: PieChart,
      status: (hasPlan || reportedDays > 0) ? "ready" as const : null,
      statusText: (hasPlan || reportedDays > 0) ? "מוכן ✓" : "",
      gradient: "from-emerald-50 to-teal-50",
      iconColor: "text-emerald-500",
    },
    {
      title: "היסטוריה שבועית",
      href: "/history",
      icon: History,
      status: weekCount > 0 ? "partial" as const : null,
      statusText: weekCount > 0 ? `${weekCount} שבועות` : "",
      gradient: "from-purple-50 to-violet-50",
      iconColor: "text-purple-500",
    },
    {
      title: "פעולות מהירות",
      href: "#",
      icon: Zap,
      status: null,
      statusText: "",
      gradient: "from-rose-50 to-pink-50",
      iconColor: "text-rose-500",
    },
  ];

  return (
    <AuthGuard>
    <AppShell>
      <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              תכנון זמן שבועי
            </h1>
            <p className="text-muted-foreground mt-1">שבוע {weekRange}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekStart((w) => addWeeks(w, -1))}
              className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white shadow-apple hover:shadow-apple-hover transition-apple text-muted-foreground hover:text-foreground"
              aria-label="שבוע קודם"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={resetToCurrentWeek}
              className="text-sm font-medium px-3 py-1.5 rounded-full bg-white shadow-apple hover:shadow-apple-hover transition-apple cursor-pointer"
            >
              שבוע נוכחי
            </button>
            <button
              onClick={() => setWeekStart((w) => addWeeks(w, 1))}
              className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white shadow-apple hover:shadow-apple-hover transition-apple text-muted-foreground hover:text-foreground"
              aria-label="שבוע הבא"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="mb-8 p-5 rounded-3xl bg-white shadow-apple animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold">
                דיווח שבועי: {reportedDays}/{totalDays} ימים
              </span>
            </div>
            {reportedDays >= totalDays ? (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                הושלם ✓
              </span>
            ) : reportedDays > 0 ? (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                בתהליך ⏳
              </span>
            ) : (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                טרם התחיל
              </span>
            )}
          </div>
          <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-green-400 to-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {["א'", "ב'", "ג'", "ד'", "ה'", "ו'"].map((label, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-1",
                    i < reportedDays ? "bg-green-400" : "bg-gray-200"
                  )}
                />
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Green CTA Card */}
        <Link href="/plan" className="block mb-8 group">
          <div className="relative h-[150px] md:h-[200px] rounded-3xl bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500 shadow-apple-lg hover:shadow-apple-hover transition-apple overflow-hidden flex items-center justify-center cursor-pointer group-hover:scale-[1.01] duration-300">
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute top-4 right-8 w-16 h-16 rounded-full bg-white/5" />
            <div className="relative z-10 text-center">
              <Sparkles className="w-10 h-10 text-white/80 mx-auto mb-3 animate-pulse" />
              <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">
                {hasPlan ? "ערוך תכנון שבועי" : "התחל תכנון שבוע חדש 👉"}
              </span>
              <p className="text-white/80 text-sm mt-2">
                {hasPlan ? "לחץ כדי לערוך את התכנון הקיים" : "לחץ כדי להתחיל לתכנן את השבוע שלך"}
              </p>
            </div>
          </div>
        </Link>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
            >
              {card.href !== "#" ? (
                <Link href={card.href} className="block group">
                  <div
                    className={cn(
                      "h-[120px] rounded-3xl bg-gradient-to-br p-5 shadow-apple hover:shadow-apple-hover transition-apple cursor-pointer group-hover:scale-[1.02] duration-300 flex flex-col justify-between",
                      card.gradient
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className={cn("w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm", card.iconColor)}>
                        <card.icon className="w-5 h-5" />
                      </div>
                      {card.status && (
                        <span className={cn(
                          "text-[11px] font-semibold px-2.5 py-1 rounded-full",
                          card.status === "ready" && "bg-green-100/80 text-green-700",
                          card.status === "missing" && "bg-amber-100/80 text-amber-700",
                          card.status === "partial" && "bg-purple-100/80 text-purple-700",
                        )}>
                          {card.statusText}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground/80">{card.title}</span>
                  </div>
                </Link>
              ) : (
                <div className={cn("h-[120px] rounded-3xl bg-gradient-to-br p-5 shadow-apple flex flex-col justify-between", card.gradient)}>
                  <div className={cn("w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm", card.iconColor)}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground/80 block">{card.title}</span>
                    <span className="text-xs text-muted-foreground">{card.statusText}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="rounded-3xl bg-white shadow-apple p-6 animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "backwards" }}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            פעולות מהירות
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Copy, label: "העתק משבוע שעבר", color: "text-blue-500 bg-blue-50", onClick: handleCopyFromLastWeek },
              { icon: BarChart3, label: "מלא לפי ממוצע", color: "text-emerald-500 bg-emerald-50", onClick: () => alert("בקרוב!") },
              { icon: Bell, label: "תזכורת דיווח", color: "text-amber-500 bg-amber-50", onClick: () => alert("בקרוב!") },
              { icon: FileSpreadsheet, label: "ייצוא Excel", color: "text-purple-500 bg-purple-50", onClick: () => alert("בקרוב!") },
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-accent transition-apple text-right group"
              >
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", action.color)}>
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-apple">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
    </AuthGuard>
  );
}
