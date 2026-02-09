"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { addWeeks, getCurrentWeekStart, getWeekStart } from "@/lib/date-utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function useWeekFromURL(): Date {
  const searchParams = useSearchParams();
  const weekParam = searchParams.get("week");

  return useMemo(() => {
    if (weekParam) {
      const parsed = new Date(weekParam + "T00:00:00");
      if (!isNaN(parsed.getTime())) {
        return getWeekStart(parsed);
      }
    }
    return getCurrentWeekStart();
  }, [weekParam]);
}

export default function WeekNavigator({ weekStart }: { weekStart: Date }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentWeekStr = toDateStr(getCurrentWeekStart());
  const isCurrentWeek = toDateStr(weekStart) === currentWeekStr;

  const navigateToWeek = useCallback(
    (newWeek: Date) => {
      const params = new URLSearchParams(searchParams.toString());
      const weekStr = toDateStr(newWeek);
      if (weekStr === currentWeekStr) {
        params.delete("week");
      } else {
        params.set("week", weekStr);
      }
      const qs = params.toString();
      const path = window.location.pathname;
      router.push(qs ? `${path}?${qs}` : path);
    },
    [router, searchParams, currentWeekStr]
  );

  const goBack = useCallback(() => navigateToWeek(addWeeks(weekStart, -1)), [weekStart, navigateToWeek]);
  const goForward = useCallback(() => navigateToWeek(addWeeks(weekStart, 1)), [weekStart, navigateToWeek]);
  const goToday = useCallback(() => navigateToWeek(getCurrentWeekStart()), [navigateToWeek]);

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
