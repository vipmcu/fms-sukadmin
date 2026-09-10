import type { PermissionDef } from "@/shared/lib/permission-def";

export const MAINTENANCE_P = {
  read: "maintenance:read",
  create: "maintenance:create",
  assign: "maintenance:assign",
  resolve: "maintenance:resolve",
  manage: "maintenance:manage",
} as const;

export const MAINTENANCE_PERMISSIONS: readonly PermissionDef[] = [
  { code: MAINTENANCE_P.read, module: "maintenance", action: "read", description: "ดูรายการใบแจ้งซ่อมและสถานะงาน" },
  { code: MAINTENANCE_P.create, module: "maintenance", action: "create", description: "สร้างใบแจ้งซ่อมหรือคำขอใช้บริการ" },
  { code: MAINTENANCE_P.assign, module: "maintenance", action: "assign", description: "จ่ายงานและมอบหมายช่างผู้รับผิดชอบ" },
  { code: MAINTENANCE_P.resolve, module: "maintenance", action: "resolve", description: "บันทึกผลการซ่อมและปิดงานซ่อม" },
  { code: MAINTENANCE_P.manage, module: "maintenance", action: "manage", description: "จัดการหมวดหมู่งานบริการและเกณฑ์ SLA" },
];
