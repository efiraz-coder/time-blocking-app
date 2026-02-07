// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const weekStart = new Date(2025, 1, 2);
  weekStart.setHours(0, 0, 0, 0);

  const week = await prisma.weekPlan.create({
    data: { weekStartDate: weekStart },
  });

  for (let dayOfWeek = 0; dayOfWeek < 5; dayOfWeek++) {
    const plannedDay = await prisma.plannedDay.create({
      data: { weekPlanId: week.id, dayOfWeek },
    });

    const blocks = [
      { startHour: 8, endHour: 12, category: "PAID_WORK" as const },
      { startHour: 12, endHour: 13, category: "PERSONAL" as const },
      { startHour: 13, endHour: 17, category: "PAID_WORK" as const },
      { startHour: 17, endHour: 20, category: "FAMILY" as const },
    ];

    for (const b of blocks) {
      await prisma.timeBlock.create({
        data: {
          plannedDayId: plannedDay.id,
          startHour: b.startHour,
          endHour: b.endHour,
          category: b.category,
        },
      });
    }

    if (dayOfWeek < 3) {
      const actualDay = await prisma.actualDay.create({
        data: { weekPlanId: week.id, dayOfWeek },
      });

      const actualBlocks = [
        { startHour: 8, endHour: 11, category: "PAID_WORK" as const },
        { startHour: 11, endHour: 12, category: "PERSONAL" as const },
        { startHour: 12, endHour: 13, category: "PERSONAL" as const },
        { startHour: 13, endHour: 16, category: "PAID_WORK" as const },
        { startHour: 16, endHour: 20, category: "FAMILY" as const },
      ];

      for (const b of actualBlocks) {
        await prisma.timeBlock.create({
          data: {
            actualDayId: actualDay.id,
            startHour: b.startHour,
            endHour: b.endHour,
            category: b.category,
          },
        });
      }
    }
  }

  console.log("Seed completed: week with 5 planned days + 3 reported days");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
