import { Suspense } from "react";
import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { listServiceCategories } from "@/features/maintenance/server";
import { PublicHelpdeskClient } from "./_components/public-helpdesk-client";

export const metadata = {
  title: "ศูนย์แจ้งซ่อมและขอใช้บริการออนไลน์ | Web Portal",
  description: "แจ้งปัญหาขัดข้อง โสตทัศนูปกรณ์ ไฟฟ้า ประปา แอร์ และติดตามสถานะงานซ่อม",
};

export default async function PublicHelpdeskPage() {
  const tenantId = await getPortalTenantId();
  const categories = await listServiceCategories(tenantId);

  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">กำลังโหลดระบบแจ้งซ่อม...</div>}>
      <PublicHelpdeskClient categories={categories} />
    </Suspense>
  );
}
