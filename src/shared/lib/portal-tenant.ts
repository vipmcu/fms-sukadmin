import { prisma } from "@/shared/lib/infra/prisma";

export async function getPortalTenantId(): Promise<string> {
  // First prefer DEMO tenant if present, otherwise first active tenant
  const tenant =
    (await prisma.tenant.findFirst({ where: { code: "DEMO", isActive: true } })) ||
    (await prisma.tenant.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } }));
  return tenant?.id || "";
}
