"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Pin,
  Eye,
  Calendar,
  FolderPlus,
  Newspaper,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
  LiyonSwitch,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/shared/lib/format";
import type { NewsArticleDto, NewsCategoryDto } from "@/features/news";
import {
  createArticleAction,
  updateArticleAction,
  deleteArticleAction,
  createNewsCategoryAction,
} from "@/features/news/actions";

interface NewsAdminClientProps {
  categories: NewsCategoryDto[];
  initialArticles: NewsArticleDto[];
  canManage: boolean;
  canCreate: boolean;
}

export function NewsAdminClient({
  categories,
  initialArticles,
  canManage,
  canCreate,
}: NewsAdminClientProps) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string>("ALL");

  // Article Dialog State
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<NewsArticleDto | null>(null);

  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [slug, setSlug] = useState("");
  const [titleTh, setTitleTh] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentTh, setContentTh] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [excerptTh, setExcerptTh] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("PUBLISHED");
  const [isPinned, setIsPinned] = useState(false);

  // Category Dialog State
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catNameTh, setCatNameTh] = useState("");
  const [catNameEn, setCatNameEn] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catColor, setCatColor] = useState("blue");

  const openCreateArticle = () => {
    setEditArticle(null);
    setCategoryId(categories[0]?.id || "");
    setSlug("");
    setTitleTh("");
    setTitleEn("");
    setContentTh("");
    setContentEn("");
    setExcerptTh("");
    setExcerptEn("");
    setCoverImageUrl("");
    setStatus("PUBLISHED");
    setIsPinned(false);
    setArticleDialogOpen(true);
  };

  const openEditArticle = (a: NewsArticleDto) => {
    setEditArticle(a);
    setCategoryId(a.categoryId);
    setSlug(a.slug);
    setTitleTh(a.titleTh);
    setTitleEn(a.titleEn || "");
    setContentTh(a.contentTh);
    setContentEn(a.contentEn || "");
    setExcerptTh(a.excerptTh || "");
    setExcerptEn(a.excerptEn || "");
    setCoverImageUrl(a.coverImageUrl || "");
    setStatus(a.status);
    setIsPinned(a.isPinned);
    setArticleDialogOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitleTh(val);
    if (!editArticle && !slug) {
      // Auto-generate basic slug from timestamp if non-latin
      const generated = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 50);
      if (generated) setSlug(generated);
      else setSlug(`news-${Date.now().toString().slice(-6)}`);
    }
  };

  const handleArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editArticle) {
        const res = await updateArticleAction({
          id: editArticle.id,
          categoryId,
          slug,
          titleTh,
          titleEn: titleEn || undefined,
          contentTh,
          contentEn: contentEn || undefined,
          excerptTh: excerptTh || undefined,
          excerptEn: excerptEn || undefined,
          coverImageUrl: coverImageUrl || undefined,
          status,
          isPinned,
        });
        if (res.ok) {
          toast.success(t("news.msg.updated"));
          setArticleDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error?.message || "เกิดข้อผิดพลาดในการบันทึก");
        }
      } else {
        const res = await createArticleAction({
          categoryId,
          slug: slug || `news-${Date.now().toString().slice(-6)}`,
          titleTh,
          titleEn: titleEn || undefined,
          contentTh,
          contentEn: contentEn || undefined,
          excerptTh: excerptTh || undefined,
          excerptEn: excerptEn || undefined,
          coverImageUrl: coverImageUrl || undefined,
          status,
          isPinned,
        });
        if (res.ok) {
          toast.success(t("news.msg.created"));
          setArticleDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error?.message || "เกิดข้อผิดพลาดในการสร้างข่าว");
        }
      }
    });
  };

  const handleDeleteArticle = (id: string, title: string) => {
    if (!confirm(`ยืนยันการลบบทความ "${title}"?`)) return;
    startTransition(async () => {
      const res = await deleteArticleAction(id);
      if (res.ok) {
        toast.success(t("news.msg.deleted"));
        router.refresh();
      } else {
        toast.error(res.error?.message || "ไม่สามารถลบข่าวได้");
      }
    });
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createNewsCategoryAction({
        nameTh: catNameTh,
        nameEn: catNameEn,
        slug: catSlug || `cat-${Date.now().toString().slice(-4)}`,
        color: catColor,
        order: categories.length + 1,
      });
      if (res.ok) {
        toast.success(t("news.msg.catCreated"));
        setCatDialogOpen(false);
        setCatNameTh("");
        setCatNameEn("");
        setCatSlug("");
        router.refresh();
      } else {
        toast.error(res.error?.message || "เกิดข้อผิดพลาดในการสร้างหมวดหมู่");
      }
    });
  };

  const filteredArticles = initialArticles.filter((a) => {
    const matchCat = selectedCatId === "ALL" || a.categoryId === selectedCatId;
    const matchSearch =
      !search ||
      a.titleTh.toLowerCase().includes(search.toLowerCase()) ||
      (a.titleEn && a.titleEn.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Newspaper className="size-6 text-primary" />
            {t("news.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("news.admin.desc")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCatDialogOpen(true)}
              className="flex items-center gap-1.5"
            >
              <FolderPlus className="size-4" />
              หมวดหมู่ข่าว ({categories.length})
            </Button>
          )}

          {canCreate && (
            <Button
              size="sm"
              onClick={openCreateArticle}
              className="flex items-center gap-1.5"
            >
              <Plus className="size-4" />
              {t("news.btn.create")}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("news.admin.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={selectedCatId === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCatId("ALL")}
            className="text-xs h-8"
          >
            ทั้งหมด ({initialArticles.length})
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              variant={selectedCatId === c.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCatId(c.id)}
              className="text-xs h-8"
            >
              {c.nameTh}
            </Button>
          ))}
        </div>
      </div>

      {/* Article List / Table */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card">
          <Newspaper className="size-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-semibold text-foreground">ไม่พบบทความข่าว</h3>
          <p className="text-xs text-muted-foreground mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่ม &quot;เขียนข่าวใหม่&quot; เพื่อเริ่มต้น
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((a) => (
            <div
              key={a.id}
              className="flex flex-col justify-between p-4 bg-card rounded-xl border border-border shadow-xs hover:border-primary/40 transition-colors"
            >
              <div className="space-y-2.5">
                {a.coverImageUrl && (
                  <div className="w-full h-36 rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.coverImageUrl}
                      alt={a.titleTh}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {a.categoryNameTh}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {a.isPinned && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        <Pin className="size-3 fill-current" />
                        ปักหมุด
                      </span>
                    )}
                    <StatusPill
                      tone={
                        a.status === "PUBLISHED"
                          ? "ok"
                          : a.status === "DRAFT"
                          ? "warn"
                          : "off"
                      }
                    >
                      {a.status === "PUBLISHED"
                        ? "เผยแพร่แล้ว"
                        : a.status === "DRAFT"
                        ? "ฉบับร่าง"
                        : "เก็บถาวร"}
                    </StatusPill>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-snug">
                  {a.titleTh}
                </h3>
                {a.excerptTh && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {a.excerptTh}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="size-3.5" />
                    {a.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {a.publishedAt
                      ? formatDate(a.publishedAt, "th")
                      : "ยังไม่เผยแพร่"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditArticle(a)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteArticle(a.id, a.titleTh)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Create/Edit Dialog */}
      <LiyonDialog open={articleDialogOpen} onOpenChange={setArticleDialogOpen} wide>
        <form onSubmit={handleArticleSubmit}>
          <LiyonDialogCloseButton label={t("btn.cancel")} />
          <LiyonDialogHeader
            title={editArticle ? "แก้ไขบทความข่าว" : "เขียนข่าวสารใหม่"}
            description="กรอกข้อมูลบทความประชาสัมพันธ์ รูปภาพหน้าปก และกำหนดการเผยแพร่"
          />

          <LiyonDialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="หมวดหมู่ข่าว">
                  <LiyonSelect
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameTh}
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label="สถานะการเผยแพร่">
                  <LiyonSelect
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")
                    }
                  >
                    <option value="PUBLISHED">เผยแพร่ทันที (Published)</option>
                    <option value="DRAFT">บันทึกเป็นฉบับร่าง (Draft)</option>
                    <option value="ARCHIVED">เก็บถาวร (Archived)</option>
                  </LiyonSelect>
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <LiyonField label="หัวข้อข่าว (ภาษาไทย)">
                    <input
                      required
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={titleTh}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="ระบุหัวข้อข่าว..."
                    />
                  </LiyonField>
                </div>

                <div>
                  <LiyonField label="Slug URL">
                    <input
                      required
                      className="w-full px-3 py-2 text-sm font-mono border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. tcas-2026"
                    />
                  </LiyonField>
                </div>
              </div>

              <LiyonField label="หัวข้อข่าว (ภาษาอังกฤษ) - ไม่บังคับ">
                <input
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="News title in English..."
                />
              </LiyonField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="คำโปรยสั้น (ภาษาไทย)">
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={excerptTh}
                    onChange={(e) => setExcerptTh(e.target.value)}
                    placeholder="สรุปสาระสำคัญสั้น ๆ เพื่อแสดงในหน้าแรก..."
                  />
                </LiyonField>

                <LiyonField label="คำโปรยสั้น (ภาษาอังกฤษ)">
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={excerptEn}
                    onChange={(e) => setExcerptEn(e.target.value)}
                    placeholder="Short summary in English..."
                  />
                </LiyonField>
              </div>

              <LiyonField label="URL รูปภาพหน้าปก (Cover Image URL)">
                <input
                  type="url"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                />
              </LiyonField>

              <LiyonField label="เนื้อหาข่าวฉบับเต็ม (ภาษาไทย)">
                <textarea
                  required
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={contentTh}
                  onChange={(e) => setContentTh(e.target.value)}
                  placeholder="รายละเอียดข่าว เนื้อหา Markdown หรือข้อความทั่วไป..."
                />
              </LiyonField>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <LiyonSwitch checked={isPinned} onCheckedChange={setIsPinned} />
                  <div>
                    <div className="text-sm font-medium text-foreground">ปักหมุดข่าวสำคัญ (Pin to Top)</div>
                    <div className="text-xs text-muted-foreground">แสดงเป็นข่าวแนะนำอันดับแรกบนหน้าเว็บไซต์</div>
                  </div>
                </label>
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setArticleDialogOpen(false)}
            >
              {t("btn.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("btn.saving") : editArticle ? t("btn.save") : t("news.btn.create")}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Category Dialog */}
      <LiyonDialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <form onSubmit={handleCategorySubmit}>
          <LiyonDialogCloseButton label={t("btn.close")} />
          <LiyonDialogHeader
            title="เพิ่มหมวดหมู่ข่าวใหม่"
            description="สร้างหมวดหมู่เพื่อจัดหมวดหมู่ข่าวสารและประกาศของคณะ"
          />

          <LiyonDialogBody>
            <div className="space-y-4">
              <LiyonField label="ชื่อหมวดหมู่ (ภาษาไทย)">
                <input
                  required
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={catNameTh}
                  onChange={(e) => setCatNameTh(e.target.value)}
                  placeholder="เช่น ข่าวบริการวิชาการ"
                />
              </LiyonField>

              <LiyonField label="ชื่อหมวดหมู่ (ภาษาอังกฤษ)">
                <input
                  required
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={catNameEn}
                  onChange={(e) => setCatNameEn(e.target.value)}
                  placeholder="e.g. Academic Services"
                />
              </LiyonField>

              <div className="grid grid-cols-2 gap-3">
                <LiyonField label="Slug URL">
                  <input
                    required
                    className="w-full px-3 py-2 text-sm font-mono border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="academic-services"
                  />
                </LiyonField>

                <LiyonField label="สีธีม">
                  <LiyonSelect
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                  >
                    <option value="blue">Blue</option>
                    <option value="emerald">Emerald</option>
                    <option value="amber">Amber</option>
                    <option value="purple">Purple</option>
                    <option value="rose">Rose</option>
                  </LiyonSelect>
                </LiyonField>
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCatDialogOpen(false)}
            >
              {t("btn.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("btn.saving") : "เพิ่มหมวดหมู่"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
