import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { listAdmissionRounds } from "@/features/admissions/server";
import { listPrograms } from "@/features/curriculum/server";
import { ApplicationFormClient } from "./_components/application-form-client";

export const metadata = {
  title: "ยื่นใบสมัครออนไลน์ | ระบบรับสมัครนิสิตใหม่",
  description: "กรอกข้อมูลเพื่อยื่นใบสมัครคัดเลือกเข้าศึกษาต่อออนไลน์",
};

export default async function ApplyPage() {
  const tenantId = await getPortalTenantId();

  const [rounds, programs] = await Promise.all([
    listAdmissionRounds(tenantId),
    listPrograms(tenantId, { isActive: true }),
  ]);

  const openRounds = rounds.filter((r) => r.isOpen);

  return <ApplicationFormClient rounds={openRounds} programs={programs} />;
}
