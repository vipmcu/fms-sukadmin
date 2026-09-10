import { requirePermission, hasPermission } from "@/features/identity/server";
import { RESERVATIONS_P, listResources } from "@/features/reservations/server";
import { ResourcesClient } from "./_components/resources-client";

export default async function ReservationsResourcesPage() {
  const ctx = await requirePermission(RESERVATIONS_P.manage);

  const resources = await listResources(ctx.tenantId);

  return (
    <ResourcesClient
      initialResources={resources}
      canApprove={hasPermission(ctx, RESERVATIONS_P.approve)}
    />
  );
}
