import { prisma } from "@/shared/lib/infra/prisma";

export async function getPortalTenantId(): Promise<string> {
  const demo = await prisma.tenant.findFirst({ where: { code: "DEMO", isActive: true } });
  if (demo) return demo.id;
  // อย่าเลือก tenant จาก integration test (สร้างทีหลังสุด) — ใช้ tenant เก่าสุดที่ยัง active
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  return tenant?.id || "";
}
