// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Category } from "@/lib/constants";

type BlockInput = { startHour: number; endHour: number; category: Category; note?: string };

export async function GET(
  request: NextRequest,
  { params }: { params: { week: string; day: string } }
) {
  try {
    const { week: weekId, day: dayStr } = params;
    const dayOfWeek = parseInt(dayStr, 10);

    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 4) {
      return NextResponse.json({ error: "Invalid day (0-4)" }, { status: 400 });
    }

    const plannedDay = await prisma.plannedDay.findFirst({
      where: { weekPlanId: weekId, dayOfWeek },
      include: { blocks: { orderBy: { startHour: "asc" } } },
    });

    return NextResponse.json(plannedDay);
  } catch (error) {
    console.error("GET /api/planned", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { week: string; day: string } }
) {
  try {
    const { week: weekId, day: dayStr } = params;
    const dayOfWeek = parseInt(dayStr, 10);

    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 4) {
      return NextResponse.json({ error: "Invalid day (0-4)" }, { status: 400 });
    }

    // Verify week exists
    const week = await prisma.weekPlan.findUnique({ where: { id: weekId } });
    if (!week) {
      return NextResponse.json({ error: "Week not found" }, { status: 404 });
    }

    const body = await request.json();
    const { blocks } = body as { blocks: BlockInput[] };

    // Validate blocks
    if (blocks && !Array.isArray(blocks)) {
      return NextResponse.json({ error: "blocks must be an array" }, { status: 400 });
    }

    // Transaction: upsert day, delete old blocks, create new ones
    const result = await prisma.$transaction(async (tx: any) => {
      const plannedDay = await tx.plannedDay.upsert({
        where: {
          weekPlanId_dayOfWeek: { weekPlanId: weekId, dayOfWeek },
        },
        update: {},
        create: { weekPlanId: weekId, dayOfWeek },
      });

      await tx.timeBlock.deleteMany({ where: { plannedDayId: plannedDay.id } });

      if (blocks?.length) {
        await tx.timeBlock.createMany({
          data: blocks.map((b) => ({
            plannedDayId: plannedDay.id,
            startHour: Math.max(0, Math.min(23, b.startHour)),
            endHour: Math.max(1, Math.min(24, b.endHour)),
            category: b.category,
            note: b.note ?? null,
          })),
        });
      }

      return tx.plannedDay.findUnique({
        where: { id: plannedDay.id },
        include: { blocks: { orderBy: { startHour: "asc" } } },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/planned", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
