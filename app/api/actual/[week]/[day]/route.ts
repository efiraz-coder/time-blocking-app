import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

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

    const actualDay = await prisma.actualDay.findFirst({
      where: { weekPlanId: weekId, dayOfWeek },
      include: { blocks: { orderBy: { startHour: "asc" } } },
    });

    return NextResponse.json(actualDay);
  } catch (error) {
    console.error("GET /api/actual", error);
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

    const week = await prisma.weekPlan.findUnique({ where: { id: weekId } });
    if (!week) {
      return NextResponse.json({ error: "Week not found" }, { status: 404 });
    }

    const body = await request.json();
    const { blocks } = body as { blocks: BlockInput[] };

    if (blocks && !Array.isArray(blocks)) {
      return NextResponse.json({ error: "blocks must be an array" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const actualDay = await tx.actualDay.upsert({
        where: {
          weekPlanId_dayOfWeek: { weekPlanId: weekId, dayOfWeek },
        },
        update: {},
        create: { weekPlanId: weekId, dayOfWeek },
      });

      await tx.timeBlock.deleteMany({ where: { actualDayId: actualDay.id } });

      if (blocks?.length) {
        await tx.timeBlock.createMany({
          data: blocks.map((b) => ({
            actualDayId: actualDay.id,
            startHour: Math.max(0, Math.min(23, b.startHour)),
            endHour: Math.max(1, Math.min(24, b.endHour)),
            category: b.category,
            note: b.note ?? null,
          })),
        });
      }

      return tx.actualDay.findUnique({
        where: { id: actualDay.id },
        include: { blocks: { orderBy: { startHour: "asc" } } },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/actual", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
