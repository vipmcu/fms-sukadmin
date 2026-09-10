import type { PermissionDef } from "@/shared/lib/permission-def";
import { IDENTITY_PERMISSIONS } from "@/features/identity/permissions";
import { SAMPLE_PERMISSIONS } from "@/features/sample/permissions";
import { RESERVATIONS_PERMISSIONS } from "@/features/reservations/permissions";
import { NEWS_PERMISSIONS } from "@/features/news";
import { PERSONNEL_PERMISSIONS } from "@/features/personnel";
import { CURRICULUM_PERMISSIONS } from "@/features/curriculum";
import { DOCUMENTS_PERMISSIONS } from "@/features/documents";
import { ASSETS_PERMISSIONS } from "@/features/assets";
import { ADMISSIONS_PERMISSIONS } from "@/features/admissions";
import { MAINTENANCE_PERMISSIONS } from "@/features/maintenance";

/** สิทธิ์ทั้งระบบ — feature ใหม่เพิ่มบรรทัดที่นี่ · seed เขียนลง permissions ทุกครั้ง */
export const ALL_PERMISSIONS: readonly PermissionDef[] = [
  ...IDENTITY_PERMISSIONS,
  ...SAMPLE_PERMISSIONS,
  ...RESERVATIONS_PERMISSIONS,
  ...NEWS_PERMISSIONS,
  ...PERSONNEL_PERMISSIONS,
  ...CURRICULUM_PERMISSIONS,
  ...DOCUMENTS_PERMISSIONS,
  ...ASSETS_PERMISSIONS,
  ...ADMISSIONS_PERMISSIONS,
  ...MAINTENANCE_PERMISSIONS,
];

const codes = ALL_PERMISSIONS.map((p) => p.code);
if (new Set(codes).size !== codes.length) throw new Error("permission code ซ้ำใน ALL_PERMISSIONS");
