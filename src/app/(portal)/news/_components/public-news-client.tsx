"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, Eye, Pin, Newspaper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/shared/lib/format";
import { useLocale } from "@/shared/lib/i18n/client";
import type { NewsArticleDto, NewsCategoryDto } from "@/features/news";

interface PublicNewsClientProps {
  categories: NewsCategoryDto[];
  articles: NewsArticleDto[];
}

export function PublicNewsClient({ categories, articles }: PublicNewsClientProps) {
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string>("ALL");

  const filtered = articles.filter((a) => {
    const matchCat = selectedCatId === "ALL" || a.categoryId === selectedCatId;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      a.titleTh.toLowerCase().includes(q) ||
      (a.titleEn && a.titleEn.toLowerCase().includes(q)) ||
      (a.excerptTh && a.excerptTh.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const pinnedArticle = articles.find((a) => a.isPinned);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Newspaper className="size-3.5" />
          ศูนย์ข่าวสารและกิจกรรมคณะ
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          ข่าวสารและประกาศประชาสัมพันธ์
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
          ติดตามความเคลื่อนไหว กิจกรรมวิชาการ การรับสมัครนักศึกษาใหม่ ผลงานวิจัย และข่าวสารสำคัญของคณะ
        </p>
      </div>

      {/* Featured Pinned News Banner (if available and no active search) */}
      {!search && selectedCatId === "ALL" && pinnedArticle && (
        <Link
          href={`/news/${pinnedArticle.slug}`}
          className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            <div className="md:col-span-7 relative h-64 md:h-80 bg-muted overflow-hidden">
              {pinnedArticle.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pinnedArticle.coverImageUrl}
                  alt={pinnedArticle.titleTh}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                  <Newspaper className="size-16 opacity-40" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-sm">
                <Pin className="size-3.5 fill-current" />
                ข่าวประชาสัมพันธ์เด่น
              </div>
            </div>

            <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                    {pinnedArticle.categoryNameTh}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    {pinnedArticle.publishedAt
                      ? formatDate(pinnedArticle.publishedAt, locale)
                      : ""}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {pinnedArticle.titleTh}
                </h2>

                {pinnedArticle.excerptTh && (
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {pinnedArticle.excerptTh}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="size-3.5" />
                  อ่านแล้ว {pinnedArticle.viewCount} ครั้ง
                </span>
                <span className="font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  อ่านรายละเอียด
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อข่าวหรือเนื้อหา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={locale === "en" ? "Search news and announcements" : "ค้นหาตามชื่อข่าวหรือเนื้อหา"}
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div role="group" aria-label="กรองหมวดหมู่ข่าวสาร (Filter by News Category)" className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={selectedCatId === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCatId("ALL")}
            aria-pressed={selectedCatId === "ALL"}
            className="text-xs h-8 rounded-full"
          >
            ทุกหมวดหมู่ ({articles.length})
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              variant={selectedCatId === c.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCatId(c.id)}
              aria-pressed={selectedCatId === c.id}
              className="text-xs h-8 rounded-full"
            >
              {c.nameTh}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-border bg-card">
          <Newspaper className="size-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="text-lg font-semibold text-foreground">ไม่พบบทความข่าวที่ตรงกับเงื่อนไข</h3>
          <p className="text-sm text-muted-foreground mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <Link
              key={a.id}
              href={`/news/${a.slug}`}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-xs hover:shadow-md hover:border-primary/50 transition-all"
            >
              <div>
                <div className="relative h-48 w-full bg-muted overflow-hidden">
                  {a.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.coverImageUrl}
                      alt={a.titleTh}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                      <Newspaper className="size-12 opacity-40" />
                    </div>
                  )}
                  {a.isPinned && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs">
                      <Pin className="size-3 fill-current" />
                      ปักหมุด
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
                      {a.categoryNameTh}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {a.publishedAt
                        ? formatDate(a.publishedAt, locale)
                        : ""}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {a.titleTh}
                  </h3>

                  {a.excerptTh && (
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {a.excerptTh}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 mt-2">
                <span className="flex items-center gap-1 pt-3">
                  <Eye className="size-3.5" />
                  {a.viewCount} ครั้ง
                </span>
                <span className="pt-3 font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  อ่านต่อ
                  <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
