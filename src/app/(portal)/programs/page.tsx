import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { listPrograms } from "@/features/curriculum/server";
import { PublicProgramsClient } from "./_components/public-programs-client";

export const metadata = {
  title: "หลักสูตรการศึกษา | คณะและสำนักงานบริหารส่วนกลาง",
  description: "ข้อมูลหลักสูตรระดับปริญญาตรี ปริญญาโท และปริญญาเอก เกณฑ์การรับสมัคร และแผนการเรียน",
};

export default async function PublicProgramsPage() {
  const tenantId = await getPortalTenantId();

  const programs = await listPrograms(tenantId, { isActive: true });

  return <PublicProgramsClient programs={programs} />;
}
