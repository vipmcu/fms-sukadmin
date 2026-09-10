import type { PermissionDef } from "@/shared/lib/permission-def";

export const CURRICULUM_P = {
  read: "curriculum:read",
  create: "curriculum:create",
  edit: "curriculum:edit",
  manage: "curriculum:manage",
} as const;

export const CURRICULUM_PERMISSIONS: readonly PermissionDef[] = [
  { code: CURRICULUM_P.read, module: "curriculum", action: "read", description: "ดูข้อมูลหลักสูตรและแผนการศึกษา" },
  { code: CURRICULUM_P.create, module: "curriculum", action: "create", description: "สร้างหลักสูตรใหม่" },
  { code: CURRICULUM_P.edit, module: "curriculum", action: "edit", description: "แก้ไขข้อมูลหลักสูตรและรายวิชา" },
  { code: CURRICULUM_P.manage, module: "curriculum", action: "manage", description: "จัดการหลักสูตรและสถานะรับสมัครทั้งหมด" },
];
