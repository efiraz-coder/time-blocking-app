// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeekStart } from "@/lib/date-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekStartDate } = body;

    const start = weekStartDate
      ? getWeekStart(new Date(weekStartDate))
      : getWeekStart(new Date());

    if (isNaN(start.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // Upsert: return existing or create new
    const week = await prisma.weekPlan.upsert({
      where: {
        weekStartDate_userId: {
          weekStartDate: start,
          userId: null as unknown as string, // no auth yet
        },
      },
      update: {},
      create: { weekStartDate: start },
      include: { plannedDays: { include: { blocks: true } }, actualDays: { include: { blocks: true } } },
    });
    return NextResponse.json(week);
  } catch {
    // Upsert with null userId fails on unique, fallback to findFirst + create
    try {
      const body = await request.json().catch(() => ({}));
      const start = body?.weekStartDate
        ? getWeekStart(new Date(body.weekStartDate))
        : getWeekStart(new Date());

      let week = await prisma.weekPlan.findFirst({
        where: { weekStartDate: start, userId: null },
        include: { plannedDays: { include: { blocks: true } }, actualDays: { include: { blocks: true } } },
      });
      if (!week) {
        week = await prisma.weekPlan.create({
          data: { weekStartDate: start },
          include: { plannedDays: { include: { blocks: true } }, actualDays: { include: { blocks: true } } },
        });
      }
      return NextResponse.json(week);
    } catch (error) {
      console.error("POST /api/weeks", error);
      return NextResponse.json({ error: "Failed to create week" }, { status: 500 });
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    // If specific date requested, find that week
    if (dateStr) {
      const start = getWeekStart(new Date(dateStr));
      const week = await prisma.weekPlan.findFirst({
        where: { weekStartDate: start, userId: null },
        include: {
          plannedDays: { include: { blocks: { orderBy: { startHour: "asc" } } }, orderBy: { dayOfWeek: "asc" } },
          actualDays: { include: { blocks: { orderBy: { startHour: "asc" } } }, orderBy: { dayOfWeek: "asc" } },
        },
      });
      return NextResponse.json(week);
    }

    // Otherwise return recent weeks
    const weeks = await prisma.weekPlan.findMany({
      orderBy: { weekStartDate: "desc" },
      take: 10,
      include: {
        plannedDays: { include: { blocks: true } },
        actualDays: { include: { blocks: true } },
      },
    });
    return NextResponse.json(weeks);
  } catch (error) {
    console.error("GET /api/weeks", error);
    return NextResponse.json({ error: "Failed to fetch weeks" }, { status: 500 });
  }
}
