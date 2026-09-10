import { requirePermission, hasPermission } from "@/features/identity/server";
import { ASSETS_P } from "@/features/assets";
import { listAssetCategories, listAssetItems } from "@/features/assets/server";
import { listDepartments, listPersonnel } from "@/features/personnel/server";
import { AssetsAdminClient } from "./_components/assets-admin-client";

export const metadata = {
  title: "ทะเบียนครุภัณฑ์ | ระบบบริหารจัดการคณะ",
};

export default async function AdminAssetsPage() {
  const ctx = await requirePermission(ASSETS_P.read);

  const [categories, items, departments, personnel] = await Promise.all([
    listAssetCategories(ctx.tenantId),
    listAssetItems(ctx.tenantId),
    listDepartments(ctx.tenantId),
    listPersonnel(ctx.tenantId, { isActive: true }),
  ]);

  return (
    <AssetsAdminClient
      categories={categories}
      initialItems={items}
      departments={departments}
      personnel={personnel}
      canCreate={hasPermission(ctx, ASSETS_P.create)}
      canEdit={hasPermission(ctx, ASSETS_P.edit)}
      canTransfer={hasPermission(ctx, ASSETS_P.transfer)}
      canDelete={hasPermission(ctx, ASSETS_P.delete)}
    />
  );
}
