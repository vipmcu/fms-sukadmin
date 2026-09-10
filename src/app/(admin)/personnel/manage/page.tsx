import { requirePermission, hasPermission } from "@/features/identity/server";
import { PERSONNEL_P } from "@/features/personnel";
import { listDepartments, listPersonnel } from "@/features/personnel/server";
import { PersonnelAdminClient } from "../_components/personnel-admin-client";

export default async function AdminPersonnelPage() {
  const ctx = await requirePermission(PERSONNEL_P.read);

  const departments = await listDepartments(ctx.tenantId);
  const personnel = await listPersonnel(ctx.tenantId);

  return (
    <PersonnelAdminClient
      departments={departments}
      initialPersonnel={personnel}
      canManage={hasPermission(ctx, PERSONNEL_P.manage)}
      canCreate={hasPermission(ctx, PERSONNEL_P.create)}
    />
  );
}
