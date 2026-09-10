"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { MAINTENANCE_P } from "../permissions";
import {
  createServiceTicketSchema,
  assignTicketSchema,
  updateTicketProgressSchema,
  resolveTicketSchema,
  rateTicketSchema,
} from "./validations";
import {
  createServiceTicket,
  assignServiceTicket,
  updateTicketProgress,
  resolveServiceTicket,
  rateServiceTicket,
  trackPublicTicket,
  type ServiceTicketDto,
  type TicketRatingDto,
} from "./services";

export async function createServiceTicketAction(input: unknown): Promise<ActionResult<ServiceTicketDto>> {
  return runAction(async () => {
    const tenantId = await getPortalTenantId();
    const parsed = createServiceTicketSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createServiceTicket(tenantId, parsed);
    revalidatePath("/maintenance");
    revalidatePath("/helpdesk");
    return result;
  });
}

export async function assignTicketAction(input: unknown): Promise<ActionResult<ServiceTicketDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(MAINTENANCE_P.assign);
    const parsed = assignTicketSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await assignServiceTicket(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/maintenance");
    return result;
  });
}

export async function updateTicketProgressAction(input: unknown): Promise<ActionResult<ServiceTicketDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(MAINTENANCE_P.resolve);
    const parsed = updateTicketProgressSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateTicketProgress(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/maintenance");
    return result;
  });
}

export async function resolveTicketAction(input: unknown): Promise<ActionResult<ServiceTicketDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(MAINTENANCE_P.resolve);
    const parsed = resolveTicketSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await resolveServiceTicket(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/maintenance");
    return result;
  });
}

export async function rateTicketAction(input: unknown): Promise<ActionResult<TicketRatingDto>> {
  return runAction(async () => {
    const tenantId = await getPortalTenantId();
    const parsed = rateTicketSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await rateServiceTicket(tenantId, parsed);
    revalidatePath("/helpdesk");
    return result;
  });
}

export async function trackTicketAction(
  ticketNo: string,
  phone: string
): Promise<ActionResult<ServiceTicketDto | null>> {
  return runAction(async () => {
    const tenantId = await getPortalTenantId();
    return await trackPublicTicket(tenantId, ticketNo, phone);
  });
}
