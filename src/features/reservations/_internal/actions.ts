"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { RESERVATIONS_P } from "../permissions";
import {
  createReservationSchema,
  approveReservationSchema,
  rejectReservationSchema,
  cancelReservationSchema,
  createResourceSchema,
  updateResourceSchema,
} from "./validations";
import {
  createReservation,
  approveReservation,
  rejectReservation,
  cancelReservation,
  createResource,
  updateResource,
  type ReservationDto,
  type ReservationResourceDto,
} from "./services";

export async function createReservationAction(input: unknown): Promise<ActionResult<ReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATIONS_P.create);
    const parsed = createReservationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createReservation(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/reservations");
    revalidatePath("/facilities");
    return result;
  });
}

export async function approveReservationAction(input: unknown): Promise<ActionResult<ReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATIONS_P.approve);
    const parsed = approveReservationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await approveReservation(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/reservations");
    revalidatePath("/facilities");
    return result;
  });
}

export async function rejectReservationAction(input: unknown): Promise<ActionResult<ReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATIONS_P.approve);
    const parsed = rejectReservationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await rejectReservation(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/reservations");
    revalidatePath("/facilities");
    return result;
  });
}

export async function cancelReservationAction(input: unknown): Promise<ActionResult<ReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATIONS_P.cancel);
    const parsed = cancelReservationSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const isManager = ctx.isSuperAdmin || ctx.permissions.includes(RESERVATIONS_P.manage) || ctx.permissions.includes(RESERVATIONS_P.approve);
    const result = await cancelReservation(ctx.tenantId, ctx.userId, isManager, parsed);
    revalidatePath("/reservations");
    revalidatePath("/facilities");
    return result;
  });
}

export async function createResourceAction(input: unknown): Promise<ActionResult<ReservationResourceDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATIONS_P.manage);
    const parsed = createResourceSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createResource(ctx.tenantId, parsed);
    revalidatePath("/reservations/resources");
    revalidatePath("/facilities");
    return result;
  });
}

export async function updateResourceAction(input: unknown): Promise<ActionResult<ReservationResourceDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(RESERVATIONS_P.manage);
    const parsed = updateResourceSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateResource(ctx.tenantId, parsed);
    revalidatePath("/reservations/resources");
    revalidatePath("/facilities");
    return result;
  });
}
