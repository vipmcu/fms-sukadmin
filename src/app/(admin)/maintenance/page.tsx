import { requirePermission, hasPermission } from "@/features/identity/server";
import { MAINTENANCE_P } from "@/features/maintenance";
import {
  listServiceTickets,
  listServiceCategories,
  getMaintenanceStats,
} from "@/features/maintenance/server";
import { listPersonnel } from "@/features/personnel/server";
import { MaintenanceAdminClient } from "./_components/maintenance-admin-client";

export const metadata = {
  title: "ระบบแจ้งซ่อมและงานบริการ | ระบบบริหารจัดการคณะ",
};

export default async function AdminMaintenancePage() {
  const ctx = await requirePermission(MAINTENANCE_P.read);

  const [tickets, categories, stats, personnel] = await Promise.all([
    listServiceTickets(ctx.tenantId),
    listServiceCategories(ctx.tenantId),
    getMaintenanceStats(ctx.tenantId),
    listPersonnel(ctx.tenantId, { isActive: true }),
  ]);

  return (
    <MaintenanceAdminClient
      initialTickets={tickets}
      categories={categories}
      stats={stats}
      personnel={personnel}
      canCreate={hasPermission(ctx, MAINTENANCE_P.create)}
      canAssign={hasPermission(ctx, MAINTENANCE_P.assign)}
      canResolve={hasPermission(ctx, MAINTENANCE_P.resolve)}
      canManage={hasPermission(ctx, MAINTENANCE_P.manage)}
    />
  );
}
