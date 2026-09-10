import { requirePermission, hasPermission } from "@/features/identity/server";
import { NEWS_P } from "@/features/news";
import { listNewsCategories, listNewsArticles } from "@/features/news/server";
import { NewsAdminClient } from "../_components/news-admin-client";

export default async function AdminNewsPage() {
  const ctx = await requirePermission(NEWS_P.read);

  const categories = await listNewsCategories(ctx.tenantId);
  const articles = await listNewsArticles(ctx.tenantId);

  return (
    <NewsAdminClient
      categories={categories}
      initialArticles={articles}
      canManage={hasPermission(ctx, NEWS_P.manage)}
      canCreate={hasPermission(ctx, NEWS_P.create)}
    />
  );
}
