import type { Dictionary } from "@/shared/lib/i18n/translate";
import { MESSAGES as core } from "./messages/core";
import { MESSAGES as identity } from "@/features/identity/messages";
import { MESSAGES as sample } from "@/features/sample/messages";
import { MESSAGES as reservations } from "@/features/reservations/messages";
import { NEWS_MESSAGES as news } from "@/features/news";
import { PERSONNEL_MESSAGES as personnel } from "@/features/personnel";
import { CURRICULUM_MESSAGES as curriculum } from "@/features/curriculum";
import { DOCUMENTS_MESSAGES as documents } from "@/features/documents";
import { ASSETS_MESSAGES as assets } from "@/features/assets";
import { ADMISSIONS_MESSAGES as admissions } from "@/features/admissions";
import { MAINTENANCE_MESSAGES as maintenance } from "@/features/maintenance";

/** พจนานุกรม UI ทั้งระบบ — feature ใหม่เพิ่มบรรทัด import ที่นี่ · key ต้องไม่ซ้ำข้าม feature */
export const UI_MESSAGES: Dictionary = {
  ...core,
  ...identity,
  ...sample,
  ...reservations,
  ...news,
  ...personnel,
  ...curriculum,
  ...documents,
  ...assets,
  ...admissions,
  ...maintenance,
};
