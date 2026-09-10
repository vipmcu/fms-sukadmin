import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P } from "@/features/curriculum";
import { listPrograms } from "@/features/curriculum/server";
import { listDepartments } from "@/features/personnel/server";
import { ProgramsAdminClient } from "../_components/programs-admin-client";

export default async function AdminProgramsPage() {
  const ctx = await requirePermission(CURRICULUM_P.read);

  const programs = await listPrograms(ctx.tenantId);
  const departments = await listDepartments(ctx.tenantId);

  return (
    <ProgramsAdminClient
      departments={departments}
      initialPrograms={programs}
      canManage={hasPermission(ctx, CURRICULUM_P.manage)}
      canCreate={hasPermission(ctx, CURRICULUM_P.create)}
    />
  );
}
