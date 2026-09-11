"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { updateSettingsSchema } from "../validations/settings";
import fs from "node:fs/promises";
import path from "node:path";
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

    const EXT_MAP: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/svg+xml": "svg",
    };
    const ext = EXT_MAP[file.type] ?? "png";
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `logo-${ctx.tenantId}-${Date.now()}-${randomSuffix}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
    await fs.mkdir(uploadDir, { recursive: true });
    const targetPath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(targetPath, buffer);

    return { url: `/uploads/logos/${filename}` };
  });
}
