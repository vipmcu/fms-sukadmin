"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { NEWS_P } from "../permissions";
import {
  createNewsArticleSchema,
  updateNewsArticleSchema,
  createNewsCategorySchema,
  updateNewsCategorySchema,
} from "./validations";
import {
  createArticle,
  updateArticle,
  deleteArticle,
  createNewsCategory,
  updateNewsCategory,
  type NewsArticleDto,
  type NewsCategoryDto,
} from "./services";

export async function createArticleAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.create);
    const parsed = createNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createArticle(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/news");
    return result;
  });
}

export async function updateArticleAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.edit);
    const parsed = updateNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateArticle(ctx.tenantId, parsed);
    revalidatePath("/news");
    return result;
  });
}

export async function deleteArticleAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.manage);
    await deleteArticle(ctx.tenantId, id);
    revalidatePath("/news");
  });
}

export async function createNewsCategoryAction(input: unknown): Promise<ActionResult<NewsCategoryDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.manage);
    const parsed = createNewsCategorySchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createNewsCategory(ctx.tenantId, parsed);
    revalidatePath("/news");
    return result;
  });
}

export async function updateNewsCategoryAction(input: unknown): Promise<ActionResult<NewsCategoryDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.manage);
    const parsed = updateNewsCategorySchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateNewsCategory(ctx.tenantId, parsed);
    revalidatePath("/news");
    return result;
  });
}
