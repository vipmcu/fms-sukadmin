"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { ADMISSIONS_P } from "../permissions";
import {
  createAdmissionRoundSchema,
  submitStudentApplicationSchema,
  reviewApplicationSchema,
} from "./validations";
import {
  createAdmissionRound,
  submitStudentApplication,
  reviewStudentApplication,
  trackPublicApplication,
  type AdmissionRoundDto,
  type StudentApplicationDto,
  type PublicApplicationStatusDto,
} from "./services";

export async function createAdmissionRoundAction(input: unknown): Promise<ActionResult<AdmissionRoundDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ADMISSIONS_P.manage);
    const parsed = createAdmissionRoundSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createAdmissionRound(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/admissions/manage");
    revalidatePath("/admissions");
    return result;
  });
}

export async function submitStudentApplicationAction(input: unknown): Promise<ActionResult<StudentApplicationDto>> {
  return runAction(async () => {
    const tenantId = await getPortalTenantId();
    const parsed = submitStudentApplicationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await submitStudentApplication(tenantId, parsed);
    revalidatePath("/admissions/manage");
    return result;
  });
}

export async function reviewStudentApplicationAction(input: unknown): Promise<ActionResult<StudentApplicationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ADMISSIONS_P.review);
    const parsed = reviewApplicationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await reviewStudentApplication(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/admissions/manage");
    return result;
  });
}

export async function trackApplicationAction(
  nationalId: string,
  applicationNo: string
): Promise<ActionResult<PublicApplicationStatusDto | null>> {
  return runAction(async () => {
    const tenantId = await getPortalTenantId();
    return await trackPublicApplication(tenantId, nationalId, applicationNo);
  });
}
