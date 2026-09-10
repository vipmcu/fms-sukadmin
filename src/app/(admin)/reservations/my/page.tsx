import { requirePermission, hasPermission } from "@/features/identity/server";
import { RESERVATIONS_P, listResources, listReservations } from "@/features/reservations/server";
import { MyBookingsClient } from "./_components/my-bookings-client";

export default async function MyReservationsPage() {
  const ctx = await requirePermission(RESERVATIONS_P.create);

  const [resources, myBookings] = await Promise.all([
    listResources(ctx.tenantId, { isActive: true }),
    listReservations(ctx.tenantId, { requesterId: ctx.userId }),
  ]);

  return (
    <MyBookingsClient
      initialBookings={myBookings}
      resources={resources}
      canApprove={hasPermission(ctx, RESERVATIONS_P.approve)}
      canManage={hasPermission(ctx, RESERVATIONS_P.manage)}
    />
  );
}
