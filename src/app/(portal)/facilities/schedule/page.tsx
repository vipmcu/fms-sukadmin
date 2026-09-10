import { prisma } from "@/shared/lib/infra/prisma";
import { listPublicSchedules } from "@/features/reservations/server";
import { PublicScheduleClient } from "./_components/public-schedule-client";

export default async function PublicSchedulePage() {
  const tenant = await prisma.tenant.findFirst({ where: { isActive: true } });
  const tenantId = tenant?.id || "";

  const schedules = await listPublicSchedules(tenantId);

  return <PublicScheduleClient initialSchedules={schedules} />;
}
