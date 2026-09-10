import { prisma } from "@/shared/lib/infra/prisma";
import { listResources } from "@/features/reservations/server";
import { FacilitiesCatalogClient } from "./_components/facilities-catalog-client";

export default async function FacilitiesCatalogPage() {
  const tenant = await prisma.tenant.findFirst({ where: { isActive: true } });
  const tenantId = tenant?.id || "";

  const resources = await listResources(tenantId, { isActive: true });

  return <FacilitiesCatalogClient resources={resources} />;
}
