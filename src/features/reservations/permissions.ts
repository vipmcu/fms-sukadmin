import type { PermissionDef } from "@/shared/lib/permission-def";

export const RESERVATIONS_P = {
  read: "reservations:read",
  create: "reservations:create",
  cancel: "reservations:cancel",
  approve: "reservations:approve",
  manage: "reservations:manage",
} as const;

export const RESERVATIONS_PERMISSIONS: readonly PermissionDef[] = [
  { code: RESERVATIONS_P.read, module: "reservations", action: "read", description: "ดูรายการจองและปฏิทิน" },
  { code: RESERVATIONS_P.create, module: "reservations", action: "create", description: "ส่งคำขอจองห้องประชุมและยานพาหนะ" },
  { code: RESERVATIONS_P.cancel, module: "reservations", action: "cancel", description: "ยกเลิกคำขอจองของตนเอง" },
  { code: RESERVATIONS_P.approve, module: "reservations", action: "approve", description: "อนุมัติหรือปฏิเสธคำขอจอง" },
  { code: RESERVATIONS_P.manage, module: "reservations", action: "manage", description: "จัดการข้อมูลห้องประชุม ยานพาหนะ และเวลาปิดปรับปรุง" },
];
