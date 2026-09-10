import { requirePermission, hasPermission } from "@/features/identity/server";
import { RESERVATIONS_P, listReservations } from "@/features/reservations/server";
import { InboxClient } from "./_components/inbox-client";

export default async function ReservationsInboxPage() {
  const ctx = await requirePermission(RESERVATIONS_P.approve);

  const reservations = await listReservations(ctx.tenantId);

  return (
    <InboxClient
      initialReservations={reservations}
      canManage={hasPermission(ctx, RESERVATIONS_P.manage)}
    />
  );
}
