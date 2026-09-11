"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { updateSettingsSchema } from "../validations/settings";
import { uploadFile } from "@/shared/lib/infra/storage";
import { errors } from "@/shared/lib/errors";
import { getTenantSettings, updateTenantSettings, type TenantSettings } from "../services/tenant.service";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function getSettingsAction(): Promise<ActionResult<TenantSettings>> {
  return runAction(async () => getTenantSettings((await requirePermission(P.settingsManage)).tenantId));
}

export async function updateSettingsAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    await updateTenantSettings({ tenantId: ctx.tenantId, actorId: ctx.userId, ...updateSettingsSchema.parse(input, { error: zodErrorMap(await getLocale()) }) });
    revalidatePath("/", "layout"); // data-palette บน <html> อ่านใหม่
  });
}

export async function uploadLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw errors.validation("validation", { file: ["ไม่พบไฟล์ที่อัปโหลด"] });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw errors.validation("validation", { file: ["กรุณาเลือกไฟล์รูปภาพ (PNG, JPG, WEBP, SVG) เท่านั้น"] });
    }

    if (file.size > MAX_FILE_SIZE) {
      throw errors.validation("validation", { file: ["ขนาดไฟล์ต้องไม่เกิน 2MB"] });
    }

    return await uploadFile({
      tenantId: ctx.tenantId,
      file,
      folder: "logos",
    });
  });
}
