import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { listAdmissionRounds } from "@/features/admissions/server";
import { listPrograms } from "@/features/curriculum/server";
import { PublicAdmissionsClient } from "./_components/public-admissions-client";

export const metadata = {
  title: "รับสมัครนิสิตใหม่ | ระบบรับสมัครออนไลน์",
  description: "ข้อมูลรอบการรับสมัคร โควตา เกณฑ์การคัดเลือก และสมัครเรียนออนไลน์",
};

export default async function PublicAdmissionsPage() {
  const tenantId = await getPortalTenantId();

  const [rounds, programs] = await Promise.all([
    listAdmissionRounds(tenantId),
    listPrograms(tenantId, { isActive: true }),
  ]);

  return <PublicAdmissionsClient rounds={rounds} programs={programs} />;
}
