import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { listDepartments, listPersonnel } from "@/features/personnel/server";
import { PublicPersonnelClient } from "./_components/public-personnel-client";

export const metadata = {
  title: "ทำเนียบคณาจารย์และบุคลากร | คณะและสำนักงานบริหารส่วนกลาง",
  description: "ค้นหาข้อมูลคณาจารย์ นักวิจัย และบุคลากรสายสนับสนุนประจำคณะ",
};

export default async function PublicPersonnelPage() {
  const tenantId = await getPortalTenantId();

  const [departments, personnel] = await Promise.all([
    listDepartments(tenantId),
    listPersonnel(tenantId, { isActive: true }),
  ]);

  return <PublicPersonnelClient departments={departments} personnel={personnel} />;
}
