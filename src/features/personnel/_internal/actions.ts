"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
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
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
  type DepartmentDto,
  type PersonnelProfileDto,
} from "./services";

export async function createDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.manage);
    const parsed = createDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDepartment(ctx.tenantId, parsed);
    revalidatePath("/personnel");
    return result;
  });
}

export async function updateDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.manage);
    const parsed = updateDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateDepartment(ctx.tenantId, parsed);
    revalidatePath("/personnel");
    return result;
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
