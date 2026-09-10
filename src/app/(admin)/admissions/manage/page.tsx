import { requirePermission, hasPermission } from "@/features/identity/server";
import { ADMISSIONS_P } from "@/features/admissions";
import { listAdmissionRounds, listStudentApplications } from "@/features/admissions/server";
import { listPrograms } from "@/features/curriculum/server";
import { AdmissionsAdminClient } from "./_components/admissions-admin-client";

export const metadata = {
  title: "จัดการรับสมัครนิสิตใหม่ | ระบบบริหารจัดการคณะ",
};

export default async function AdminAdmissionsManagePage() {
  const ctx = await requirePermission(ADMISSIONS_P.read);

  const [rounds, applications, programs] = await Promise.all([
    listAdmissionRounds(ctx.tenantId),
    listStudentApplications(ctx.tenantId),
    listPrograms(ctx.tenantId),
  ]);

  return (
    <AdmissionsAdminClient
      rounds={rounds}
      initialApplications={applications}
      programs={programs}
      canManage={hasPermission(ctx, ADMISSIONS_P.manage)}
      canReview={hasPermission(ctx, ADMISSIONS_P.review)}
      canScore={hasPermission(ctx, ADMISSIONS_P.score)}
      canExport={hasPermission(ctx, ADMISSIONS_P.export)}
    />
  );
}
