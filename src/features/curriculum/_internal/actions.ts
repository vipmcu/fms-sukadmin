"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { CURRICULUM_P } from "../permissions";
import {
  createProgramSchema,
  updateProgramSchema,
  createCourseSchema,
} from "./validations";
import {
  createProgram,
  updateProgram,
  deleteProgram,
  createCourse,
  deleteCourse,
  type AcademicProgramDto,
  type CurriculumCourseDto,
} from "./services";

export async function createProgramAction(input: unknown): Promise<ActionResult<AcademicProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.create);
    const parsed = createProgramSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createProgram(ctx.tenantId, parsed);
    revalidatePath("/programs");
    return result;
  });
}

export async function updateProgramAction(input: unknown): Promise<ActionResult<AcademicProgramDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.edit);
    const parsed = updateProgramSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateProgram(ctx.tenantId, parsed);
    revalidatePath("/programs");
    return result;
  });
}

export async function deleteProgramAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.manage);
    await deleteProgram(ctx.tenantId, id);
    revalidatePath("/programs");
  });
}

export async function createCourseAction(input: unknown): Promise<ActionResult<CurriculumCourseDto>> {
  return runAction(async () => {
    await requirePermission(CURRICULUM_P.edit);
    const parsed = createCourseSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createCourse(parsed);
    revalidatePath("/programs");
    return result;
  });
}

export async function deleteCourseAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    await requirePermission(CURRICULUM_P.edit);
    await deleteCourse(id);
    revalidatePath("/programs");
  });
}
