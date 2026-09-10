import { z } from "zod";

export const newsStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createNewsCategorySchema = z.object({
  slug: z.string().min(2).max(100),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  color: z.string().max(50).optional().nullable(),
  order: z.number().int().default(0),
});

export const updateNewsCategorySchema = createNewsCategorySchema.extend({
  id: z.string().uuid(),
});

export const createNewsArticleSchema = z.object({
  categoryId: z.string().uuid(),
  slug: z.string().min(2).max(255),
  titleTh: z.string().min(1).max(500),
  titleEn: z.string().max(500).optional().nullable(),
  contentTh: z.string().min(1),
  contentEn: z.string().optional().nullable(),
  excerptTh: z.string().optional().nullable(),
  excerptEn: z.string().optional().nullable(),
  coverImageUrl: z.string().url().or(z.literal("")).optional().nullable(),
  status: newsStatusEnum.default("DRAFT"),
  isPinned: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
  attachments: z.array(z.record(z.string(), z.unknown())).default([]),
});

export const updateNewsArticleSchema = createNewsArticleSchema.extend({
  id: z.string().uuid(),
});

export const togglePublishArticleSchema = z.object({
  id: z.string().uuid(),
  status: newsStatusEnum,
});

export type CreateNewsCategoryInput = z.infer<typeof createNewsCategorySchema>;
export type UpdateNewsCategoryInput = z.infer<typeof updateNewsCategorySchema>;
export type CreateNewsArticleInput = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleSchema>;
