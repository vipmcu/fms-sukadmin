import { requirePermission, hasPermission } from "@/features/identity/server";
import { ASSETS_P } from "@/features/assets";
import { listSupplyItems } from "@/features/assets/server";
import { SuppliesAdminClient } from "./_components/supplies-admin-client";

export const metadata = {
  title: "คลังวัสดุสิ้นเปลือง | ระบบบริหารจัดการคณะ",
};

export default async function AdminSuppliesPage() {
  const ctx = await requirePermission(ASSETS_P.read);
  const items = await listSupplyItems(ctx.tenantId);

  return (
    <SuppliesAdminClient
      initialItems={items}
      canManage={hasPermission(ctx, ASSETS_P.suppliesManage)}
    />
  );
}
