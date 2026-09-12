"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { errors, FORBIDDEN_DIGEST } from "@/shared/lib/errors";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requireSession, hasPermission, requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "@/features/curriculum";
import { PERSONNEL_P } from "../permissions";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createPersonnelSchema,
  updatePersonnelSchema,
} from "./validations";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
  type DepartmentDto,
  type PersonnelProfileDto,
} from "./services";

async function requireDepartmentManagePermission() {
  const ctx = await requireSession();
  if (!hasPermission(ctx, PERSONNEL_P.manage) && !hasPermission(ctx, CURRICULUM_P.manage)) {
    const err = errors.forbidden(`forbidden:${PERSONNEL_P.manage}`);
    err.digest = FORBIDDEN_DIGEST;
    throw err;
  }
  return ctx;
}

function revalidateDepartmentPaths() {
  revalidatePath("/personnel");
  revalidatePath("/programs");
  revalidatePath("/programs/manage");
}

export async function createDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requireDepartmentManagePermission();
    const parsed = createDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDepartment(ctx.tenantId, parsed);
    revalidateDepartmentPaths();
    return result;
  });
}

export async function updateDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requireDepartmentManagePermission();
    const parsed = updateDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateDepartment(ctx.tenantId, parsed);
    revalidateDepartmentPaths();
    return result;
  });
}

export async function deleteDepartmentAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requireDepartmentManagePermission();
    await deleteDepartment(ctx.tenantId, id);
    revalidateDepartmentPaths();
  });
}

export async function createPersonnelAction(input: unknown): Promise<ActionResult<PersonnelProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.create);
    const parsed = createPersonnelSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createPersonnel(ctx.tenantId, parsed);
    revalidatePath("/personnel");
    return result;
  });
}

export async function updatePersonnelAction(input: unknown): Promise<ActionResult<PersonnelProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.edit);
    const parsed = updatePersonnelSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updatePersonnel(ctx.tenantId, parsed);
    revalidatePath("/personnel");
    return result;
  });
}

export async function deletePersonnelAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.manage);
    await deletePersonnel(ctx.tenantId, id);
    revalidatePath("/personnel");
  });
}
