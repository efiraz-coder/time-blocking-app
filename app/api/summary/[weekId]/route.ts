import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { weekId: string } }
) {
  try {
    const { weekId } = params;

    const week = await prisma.weekPlan.findUnique({
      where: { id: weekId },
      include: {
        plannedDays: { include: { blocks: true } },
        actualDays: { include: { blocks: true } },
      },
    });

    if (!week) {
      return NextResponse.json({ error: "Week not found" }, { status: 404 });
    }

    const plannedHours: Record<Category, number> = {
      PERSONAL: 0,
      FAMILY: 0,
      HOUSEHOLD: 0,
      RELATIONSHIP: 0,
      PAID_WORK: 0,
      UNPAID_WORK: 0,
      EMPTY: 0,
    };

    const actualHours: Record<Category, number> = { ...plannedHours };

    week.plannedDays.forEach((day) => {
      day.blocks.forEach((b) => {
        const hours = b.endHour - b.startHour;
        plannedHours[b.category] += hours;
      });
    });

    week.actualDays.forEach((day) => {
      day.blocks.forEach((b) => {
        const hours = b.endHour - b.startHour;
        actualHours[b.category] += hours;
      });
    });

    const summary = (Object.keys(plannedHours) as Category[]).map((cat) => ({
      category: cat,
      planned: plannedHours[cat],
      actual: actualHours[cat],
      diff: actualHours[cat] - plannedHours[cat],
      diffPercent:
        plannedHours[cat] > 0
          ? Math.round(
              ((actualHours[cat] - plannedHours[cat]) / plannedHours[cat]) * 100
            )
          : 0,
    }));

    return NextResponse.json({ week, summary });
  } catch (error) {
    console.error("GET /api/summary", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
