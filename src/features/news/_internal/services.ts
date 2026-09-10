import { prisma } from "@/shared/lib/infra/prisma";
import type { NewsStatus, Prisma } from "@/generated/prisma";
import type {
  CreateNewsCategoryInput,
  UpdateNewsCategoryInput,
  CreateNewsArticleInput,
  UpdateNewsArticleInput,
} from "./validations";

export interface NewsCategoryDto {
  id: string;
  tenantId: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  color: string | null;
  order: number;
  articleCount?: number;
}

export interface NewsArticleDto {
  id: string;
  tenantId: string;
  categoryId: string;
  categoryNameTh: string;
  categoryNameEn: string;
  categoryColor: string | null;
  slug: string;
  titleTh: string;
  titleEn: string | null;
  contentTh: string;
  contentEn: string | null;
  excerptTh: string | null;
  excerptEn: string | null;
  coverImageUrl: string | null;
  status: NewsStatus;
  isPinned: boolean;
  viewCount: number;
  publishedAt: string | null;
  authorId: string;
  authorName: string;
  attachments: unknown[];
  createdAt: string;
  updatedAt: string;
}

export async function listNewsCategories(tenantId: string): Promise<NewsCategoryDto[]> {
  const items = await prisma.newsCategory.findMany({
    where: { tenantId },
    include: {
      _count: { select: { articles: true } },
    },
    orderBy: { order: "asc" },
  });

  return items.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    slug: c.slug,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    color: c.color,
    order: c.order,
    articleCount: c._count.articles,
  }));
}

export async function createNewsCategory(
  tenantId: string,
  input: CreateNewsCategoryInput
): Promise<NewsCategoryDto> {
  const created = await prisma.newsCategory.create({
    data: {
      tenantId,
      slug: input.slug,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      color: input.color || null,
      order: input.order,
    },
  });
  return {
    id: created.id,
    tenantId: created.tenantId,
    slug: created.slug,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    color: created.color,
    order: created.order,
  };
}

export async function updateNewsCategory(
  tenantId: string,
  input: UpdateNewsCategoryInput
): Promise<NewsCategoryDto> {
  const updated = await prisma.newsCategory.update({
    where: { id: input.id, tenantId },
    data: {
      slug: input.slug,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      color: input.color || null,
      order: input.order,
    },
  });
  return {
    id: updated.id,
    tenantId: updated.tenantId,
    slug: updated.slug,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    color: updated.color,
    order: updated.order,
  };
}

export async function listNewsArticles(
  tenantId: string,
  filter?: {
    status?: NewsStatus;
    categoryId?: string;
    isPinned?: boolean;
    search?: string;
    limit?: number;
  }
): Promise<NewsArticleDto[]> {
  const where: Prisma.NewsArticleWhereInput = { tenantId };

  if (filter?.status) where.status = filter.status;
  if (filter?.categoryId) where.categoryId = filter.categoryId;
  if (filter?.isPinned !== undefined) where.isPinned = filter.isPinned;

  if (filter?.search) {
    const q = filter.search.trim();
    where.OR = [
      { titleTh: { contains: q, mode: "insensitive" } },
      { titleEn: { contains: q, mode: "insensitive" } },
      { contentTh: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.newsArticle.findMany({
    where,
    include: {
      category: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: filter?.limit,
  });

  return items.map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryNameEn: a.category.nameEn,
    categoryColor: a.category.color,
    slug: a.slug,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    contentTh: a.contentTh,
    contentEn: a.contentEn,
    excerptTh: a.excerptTh,
    excerptEn: a.excerptEn,
    coverImageUrl: a.coverImageUrl,
    status: a.status,
    isPinned: a.isPinned,
    viewCount: a.viewCount,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    authorId: a.authorId,
    authorName: a.author.name,
    attachments: (a.attachments as unknown[]) ?? [],
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}

export async function getNewsArticleBySlug(
  tenantId: string,
  slug: string,
  trackView = true
): Promise<NewsArticleDto | null> {
  const article = await prisma.newsArticle.findFirst({
    where: { tenantId, slug },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
    },
  });
  if (!article) return null;

  if (trackView && article.status === "PUBLISHED") {
    await prisma.newsArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => null);
  }

  return {
    id: article.id,
    tenantId: article.tenantId,
    categoryId: article.categoryId,
    categoryNameTh: article.category.nameTh,
    categoryNameEn: article.category.nameEn,
    categoryColor: article.category.color,
    slug: article.slug,
    titleTh: article.titleTh,
    titleEn: article.titleEn,
    contentTh: article.contentTh,
    contentEn: article.contentEn,
    excerptTh: article.excerptTh,
    excerptEn: article.excerptEn,
    coverImageUrl: article.coverImageUrl,
    status: article.status,
    isPinned: article.isPinned,
    viewCount: article.viewCount,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    authorId: article.authorId,
    authorName: article.author.name,
    attachments: (article.attachments as unknown[]) ?? [],
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

export async function getNewsArticleById(
  tenantId: string,
  id: string
): Promise<NewsArticleDto | null> {
  const article = await prisma.newsArticle.findFirst({
    where: { tenantId, id },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
    },
  });
  if (!article) return null;

  return {
    id: article.id,
    tenantId: article.tenantId,
    categoryId: article.categoryId,
    categoryNameTh: article.category.nameTh,
    categoryNameEn: article.category.nameEn,
    categoryColor: article.category.color,
    slug: article.slug,
    titleTh: article.titleTh,
    titleEn: article.titleEn,
    contentTh: article.contentTh,
    contentEn: article.contentEn,
    excerptTh: article.excerptTh,
    excerptEn: article.excerptEn,
    coverImageUrl: article.coverImageUrl,
    status: article.status,
    isPinned: article.isPinned,
    viewCount: article.viewCount,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    authorId: article.authorId,
    authorName: article.author.name,
    attachments: (article.attachments as unknown[]) ?? [],
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

export async function createArticle(
  tenantId: string,
  authorId: string,
  input: CreateNewsArticleInput
): Promise<NewsArticleDto> {
  const created = await prisma.newsArticle.create({
    data: {
      tenantId,
      authorId,
      categoryId: input.categoryId,
      slug: input.slug,
      titleTh: input.titleTh,
      titleEn: input.titleEn || null,
      contentTh: input.contentTh,
      contentEn: input.contentEn || null,
      excerptTh: input.excerptTh || null,
      excerptEn: input.excerptEn || null,
      coverImageUrl: input.coverImageUrl || null,
      status: input.status,
      isPinned: input.isPinned,
      publishedAt: input.status === "PUBLISHED" ? new Date() : input.publishedAt ? new Date(input.publishedAt) : null,
      attachments: (input.attachments as unknown as Prisma.InputJsonValue) ?? [],
    },
  });

  return (await getNewsArticleBySlug(tenantId, created.slug, false))!;
}

export async function updateArticle(
  tenantId: string,
  input: UpdateNewsArticleInput
): Promise<NewsArticleDto> {
  const existing = await prisma.newsArticle.findFirst({ where: { id: input.id, tenantId } });
  if (!existing) throw new Error("ไม่พบบทความข่าว");

  const publishedAt =
    input.status === "PUBLISHED" && !existing.publishedAt
      ? new Date()
      : input.publishedAt
      ? new Date(input.publishedAt)
      : existing.publishedAt;

  const updated = await prisma.newsArticle.update({
    where: { id: input.id, tenantId },
    data: {
      categoryId: input.categoryId,
      slug: input.slug,
      titleTh: input.titleTh,
      titleEn: input.titleEn || null,
      contentTh: input.contentTh,
      contentEn: input.contentEn || null,
      excerptTh: input.excerptTh || null,
      excerptEn: input.excerptEn || null,
      coverImageUrl: input.coverImageUrl || null,
      status: input.status,
      isPinned: input.isPinned,
      publishedAt,
      attachments: (input.attachments as unknown as Prisma.InputJsonValue) ?? [],
    },
  });

  return (await getNewsArticleBySlug(tenantId, updated.slug, false))!;
}

export async function deleteArticle(tenantId: string, id: string): Promise<void> {
  await prisma.newsArticle.delete({ where: { id, tenantId } });
}
