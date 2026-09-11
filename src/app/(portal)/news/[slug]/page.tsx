import { notFound } from "next/navigation";
import Link from "next/link";
import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { getNewsArticleBySlug, listNewsArticles } from "@/features/news/server";
import { ArrowLeft, Calendar, Eye, User, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/shared/lib/format";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const tenantId = await getPortalTenantId();

  const article = await getNewsArticleBySlug(tenantId, slug, false);
  if (!article) return { title: "ไม่พบบทความ | คณะและสำนักงานบริหารส่วนกลาง" };

  return {
    title: `${article.titleTh} | คณะและสำนักงานบริหารส่วนกลาง`,
    description: article.excerptTh || article.titleTh,
  };
}

export default async function PublicArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const tenantId = await getPortalTenantId();

  const article = await getNewsArticleBySlug(tenantId, slug, true);
  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  // Fetch recent other news
  const recentArticles = (await listNewsArticles(tenantId, { status: "PUBLISHED", limit: 4 }))
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/news" aria-label="ย้อนกลับไปหน้ารวมข่าว (Back to News)">
            <ArrowLeft className="size-4" />
            ย้อนกลับไปหน้ารวมข่าว
          </Link>
        </Button>
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
            {article.categoryNameTh}
          </span>
          {article.isPinned && (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              <Pin className="size-3 fill-current" />
              ข่าวเด่น
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {article.titleTh}
        </h1>

        {article.titleEn && (
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            {article.titleEn}
          </p>
        )}

        {/* Metadata bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center gap-1.5">
            <User className="size-4" />
            <span>โดย {article.authorName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            <span>
              เผยแพร่เมื่อ{" "}
              {article.publishedAt
                ? formatDate(article.publishedAt, "th")
                : "-"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Eye className="size-4" />
            <span>อ่านแล้ว {article.viewCount} ครั้ง</span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {article.coverImageUrl && (
        <div className="w-full rounded-2xl overflow-hidden border border-border bg-muted shadow-sm max-h-[460px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImageUrl}
            alt={article.titleTh}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed whitespace-pre-wrap font-normal">
        {article.contentTh}
      </div>

      {article.contentEn && (
        <div className="p-6 rounded-2xl bg-muted/40 border border-border space-y-2 mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            English Version
          </h3>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
            {article.contentEn}
          </div>
        </div>
      )}

      {/* Related News */}
      {recentArticles.length > 0 && (
        <div className="pt-12 mt-12 border-t border-border space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            ข่าวสารประชาสัมพันธ์อื่น ๆ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentArticles.map((ra) => (
              <Link
                key={ra.id}
                href={`/news/${ra.slug}`}
                className="group p-4 rounded-xl border border-border bg-card shadow-xs hover:border-primary/50 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
                    {ra.categoryNameTh}
                  </span>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {ra.titleTh}
                  </h3>
                </div>
                <div className="pt-3 mt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                  {ra.publishedAt
                    ? formatDate(ra.publishedAt, "th")
                    : ""}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
