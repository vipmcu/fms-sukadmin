import type { PermissionDef } from "@/shared/lib/permission-def";

export const PERSONNEL_P = {
  read: "personnel:read",
  create: "personnel:create",
  edit: "personnel:edit",
  manage: "personnel:manage",
} as const;

export const PERSONNEL_PERMISSIONS: readonly PermissionDef[] = [
  { code: PERSONNEL_P.read, module: "personnel", action: "read", description: "ดูข้อมูลบุคลากรและทำเนียบ" },
  { code: PERSONNEL_P.create, module: "personnel", action: "create", description: "เพิ่มข้อมูลบุคลากรใหม่" },
  { code: PERSONNEL_P.edit, module: "personnel", action: "edit", description: "แก้ไขข้อมูลบุคลากร" },
  { code: PERSONNEL_P.manage, module: "personnel", action: "manage", description: "จัดการข้อมูลบุคลากรและภาควิชาทั้งหมด" },
];
