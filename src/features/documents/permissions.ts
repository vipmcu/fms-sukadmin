import type { PermissionDef } from "@/shared/lib/permission-def";

export const DOCUMENTS_P = {
  read: "documents:read",
  create: "documents:create",
  approve: "documents:approve",
  manage: "documents:manage",
} as const;

export const DOCUMENTS_PERMISSIONS: readonly PermissionDef[] = [
  { code: DOCUMENTS_P.read, module: "documents", action: "read", description: "ดูรายการเอกสารและคำร้อง" },
  { code: DOCUMENTS_P.create, module: "documents", action: "create", description: "ยื่นคำร้องและสร้างเอกสารใหม่" },
  { code: DOCUMENTS_P.approve, module: "documents", action: "approve", description: "พิจารณาลงนามและอนุมัติเอกสาร" },
  { code: DOCUMENTS_P.manage, module: "documents", action: "manage", description: "จัดการประเภทเอกสารและเส้นทางอนุมัติทั้งหมด" },
];
