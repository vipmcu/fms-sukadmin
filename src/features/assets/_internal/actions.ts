"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { ASSETS_P } from "../permissions";
import {
  createAssetItemSchema,
  updateAssetItemSchema,
  transferAssetSchema,
  createSupplyItemSchema,
  updateSupplyItemSchema,
  adjustStockSchema,
} from "./validations";
import {
  createAssetItem,
  updateAssetItem,
  transferAsset,
  deleteAssetItem,
  createSupplyItem,
  updateSupplyItem,
  adjustSupplyStock,
  type AssetItemDto,
  type SupplyItemDto,
} from "./services";

export async function createAssetItemAction(input: unknown): Promise<ActionResult<AssetItemDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ASSETS_P.create);
    const parsed = createAssetItemSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createAssetItem(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/inventory/assets");
    return result;
  });
}

export async function updateAssetItemAction(input: unknown): Promise<ActionResult<AssetItemDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ASSETS_P.edit);
    const parsed = updateAssetItemSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateAssetItem(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/inventory/assets");
    return result;
  });
}

export async function transferAssetAction(input: unknown): Promise<ActionResult<AssetItemDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ASSETS_P.transfer);
    const parsed = transferAssetSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await transferAsset(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/inventory/assets");
    return result;
  });
}

export async function deleteAssetItemAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(ASSETS_P.delete);
    await deleteAssetItem(ctx.tenantId, id, ctx.userId);
    revalidatePath("/inventory/assets");
  });
}

export async function createSupplyItemAction(input: unknown): Promise<ActionResult<SupplyItemDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ASSETS_P.suppliesManage);
    const parsed = createSupplyItemSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createSupplyItem(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/inventory/supplies");
    return result;
  });
}

export async function updateSupplyItemAction(input: unknown): Promise<ActionResult<SupplyItemDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ASSETS_P.suppliesManage);
    const parsed = updateSupplyItemSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateSupplyItem(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/inventory/supplies");
    return result;
  });
}

export async function adjustSupplyStockAction(input: unknown): Promise<ActionResult<SupplyItemDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ASSETS_P.suppliesManage);
    const parsed = adjustStockSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await adjustSupplyStock(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/inventory/supplies");
    return result;
  });
}
