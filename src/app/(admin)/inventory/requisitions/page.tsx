import { requirePermission, hasPermission } from "@/features/identity/server";
import { ASSETS_P } from "@/features/assets";
import { listSupplyItems, listSupplyRequisitions } from "@/features/assets/server";
import { RequisitionsAdminClient } from "./_components/requisitions-admin-client";

export const metadata = {
  title: "คำขอเบิกวัสดุ | ระบบบริหารจัดการคณะ",
};

export default async function AdminRequisitionsPage() {
  const ctx = await requirePermission(ASSETS_P.read);
  const [requisitions, supplies] = await Promise.all([
    listSupplyRequisitions(ctx.tenantId),
    listSupplyItems(ctx.tenantId),
  ]);

  return (
    <RequisitionsAdminClient
      initialRequisitions={requisitions}
      supplies={supplies}
      canCreate={hasPermission(ctx, ASSETS_P.requisitionCreate)}
      canApprove={hasPermission(ctx, ASSETS_P.requisitionApprove)}
      canDispatch={hasPermission(ctx, ASSETS_P.suppliesManage)}
      currentUserId={ctx.userId}
    />
  );
}
