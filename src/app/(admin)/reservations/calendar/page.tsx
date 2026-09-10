import { requirePermission, hasPermission } from "@/features/identity/server";
import { RESERVATIONS_P, listResources, listReservations } from "@/features/reservations/server";
import { CalendarClient } from "./_components/calendar-client";

export default async function ReservationsCalendarPage() {
  const ctx = await requirePermission(RESERVATIONS_P.read);

  const [resources, reservations] = await Promise.all([
    listResources(ctx.tenantId, { isActive: true }),
    listReservations(ctx.tenantId),
  ]);

  return (
    <CalendarClient
      initialReservations={reservations}
      resources={resources}
      canCreate={hasPermission(ctx, RESERVATIONS_P.create)}
      canApprove={hasPermission(ctx, RESERVATIONS_P.approve)}
      canManage={hasPermission(ctx, RESERVATIONS_P.manage)}
    />
  );
}
