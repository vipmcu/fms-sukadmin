"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { DOCUMENTS_P } from "../permissions";
import {
  createDocumentTypeSchema,
  updateDocumentTypeSchema,
  createDocumentRequestSchema,
  approveDocumentStepSchema,
  rejectDocumentStepSchema,
} from "./validations";
import {
  createDocumentType,
  updateDocumentType,
  createDocumentRequest,
  approveDocumentStep,
  rejectDocumentStep,
  cancelDocumentRequest,
  type DocumentTypeDto,
  type DocumentRequestDto,
} from "./services";

export async function createDocumentTypeAction(input: unknown): Promise<ActionResult<DocumentTypeDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENTS_P.manage);
    const parsed = createDocumentTypeSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDocumentType(ctx.tenantId, parsed);
    revalidatePath("/documents");
    return result;
  });
}

export async function updateDocumentTypeAction(input: unknown): Promise<ActionResult<DocumentTypeDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENTS_P.manage);
    const parsed = updateDocumentTypeSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateDocumentType(ctx.tenantId, parsed);
    revalidatePath("/documents");
    return result;
  });
}

export async function createDocumentRequestAction(input: unknown): Promise<ActionResult<DocumentRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENTS_P.create);
    const parsed = createDocumentRequestSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDocumentRequest(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/documents");
    return result;
  });
}

export async function approveDocumentStepAction(input: unknown): Promise<ActionResult<DocumentRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENTS_P.approve);
    const parsed = approveDocumentStepSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    // ใช้ role จาก roles ของ user หรือระบุตาม step
    const approverRole = "APPROVER";
    const result = await approveDocumentStep(ctx.tenantId, ctx.userId, approverRole, parsed);
    revalidatePath("/documents");
    return result;
  });
}

export async function rejectDocumentStepAction(input: unknown): Promise<ActionResult<DocumentRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENTS_P.approve);
    const parsed = rejectDocumentStepSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const approverRole = "APPROVER";
    const result = await rejectDocumentStep(ctx.tenantId, ctx.userId, approverRole, parsed);
    revalidatePath("/documents");
    return result;
  });
}

export async function cancelDocumentRequestAction(id: string): Promise<ActionResult<DocumentRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENTS_P.create);
    const result = await cancelDocumentRequest(ctx.tenantId, ctx.userId, id);
    revalidatePath("/documents");
    return result;
  });
}
