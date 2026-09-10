import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { listNewsCategories, listNewsArticles } from "@/features/news/server";
import { PublicNewsClient } from "./_components/public-news-client";

export const metadata = {
  title: "ข่าวสารประชาสัมพันธ์ | คณะและสำนักงานบริหารส่วนกลาง",
  description: "ติดตามข่าวสาร กิจกรรมวิชาการ และประกาศสำคัญของคณะ",
};

export default async function PublicNewsPage() {
  const tenantId = await getPortalTenantId();

  const [categories, articles] = await Promise.all([
    listNewsCategories(tenantId),
    listNewsArticles(tenantId, { status: "PUBLISHED" }),
  ]);

  return <PublicNewsClient categories={categories} articles={articles} />;
}
