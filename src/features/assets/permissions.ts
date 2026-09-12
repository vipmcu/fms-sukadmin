import type { PermissionDef } from "@/shared/lib/permission-def";

export const ASSETS_P = {
  read: "assets:read",
  create: "assets:create",
  edit: "assets:edit",
  delete: "assets:delete",
  transfer: "assets:transfer",
  dispose: "assets:dispose",
  suppliesManage: "assets:supplies_manage",
  requisitionCreate: "assets:requisition_create",
  requisitionApprove: "assets:requisition_approve",
} as const;

export const ASSETS_PERMISSIONS: readonly PermissionDef[] = [
  { code: ASSETS_P.read, module: "assets", action: "read", description: "ดูรายการครุภัณฑ์และวัสดุสิ้นเปลือง" },
  { code: ASSETS_P.create, module: "assets", action: "create", description: "ลงทะเบียนครุภัณฑ์และวัสดุใหม่" },
  { code: ASSETS_P.edit, module: "assets", action: "edit", description: "แก้ไขข้อมูลครุภัณฑ์และสต็อกวัสดุ" },
  { code: ASSETS_P.delete, module: "assets", action: "delete", description: "ลบรายการครุภัณฑ์" },
  { code: ASSETS_P.transfer, module: "assets", action: "transfer", description: "โอนย้ายสถานที่และผู้ถือครองครุภัณฑ์" },
  { code: ASSETS_P.dispose, module: "assets", action: "dispose", description: "อนุมัติแทงจำหน่ายครุภัณฑ์" },
  { code: ASSETS_P.suppliesManage, module: "assets", action: "supplies_manage", description: "บริหารคลังและการรับเข้า/ตัดจ่ายวัสดุ" },
  { code: ASSETS_P.requisitionCreate, module: "assets", action: "requisition_create", description: "ยื่นคำขอเบิกวัสดุสิ้นเปลือง" },
  { code: ASSETS_P.requisitionApprove, module: "assets", action: "requisition_approve", description: "อนุมัติหรือปฏิเสธคำขอเบิกวัสดุ" },
];
