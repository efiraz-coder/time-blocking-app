"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { addWeeks, getCurrentWeekStart, getWeekStart } from "@/lib/date-utils";

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

interface WeekNavigatorProps {
  weekStart: Date;
  onWeekChange: (newWeek: Date) => void;
}

export function parseWeekParam(param: string | null): Date {
  if (param) {
    const parsed = new Date(param + "T00:00:00");
    if (!isNaN(parsed.getTime())) {
      return getWeekStart(parsed);
    }
  }
  return getCurrentWeekStart();
}

export default function WeekNavigator({ weekStart, onWeekChange }: WeekNavigatorProps) {
  const currentWeekStr = toDateStr(getCurrentWeekStart());
  const isCurrentWeek = toDateStr(weekStart) === currentWeekStr;

  const goBack = () => onWeekChange(addWeeks(weekStart, -1));
  const goForward = () => onWeekChange(addWeeks(weekStart, 1));
  const goToday = () => onWeekChange(getCurrentWeekStart());

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goBack}
        className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white shadow-apple hover:shadow-apple-hover transition-apple text-muted-foreground hover:text-foreground"
        aria-label="שבוע קודם"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <button
        onClick={goToday}
        className={`text-sm font-medium px-3 py-1.5 rounded-full shadow-apple hover:shadow-apple-hover transition-apple cursor-pointer ${
          isCurrentWeek ? "bg-primary text-white" : "bg-white"
        }`}
      >
        שבוע נוכחי
      </button>
      <button
        onClick={goForward}
        className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-white shadow-apple hover:shadow-apple-hover transition-apple text-muted-foreground hover:text-foreground"
        aria-label="שבוע הבא"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>
  );
}
