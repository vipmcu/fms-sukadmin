import type { PermissionDef } from "@/shared/lib/permission-def";

export const ADMISSIONS_P = {
  read: "admissions:read",
  create: "admissions:create",
  review: "admissions:review",
  score: "admissions:score",
  export: "admissions:export",
  manage: "admissions:manage",
} as const;

export const ADMISSIONS_PERMISSIONS: readonly PermissionDef[] = [
  { code: ADMISSIONS_P.read, module: "admissions", action: "read", description: "ดูข้อมูลรอบรับสมัครและรายชื่อผู้สมัคร" },
  { code: ADMISSIONS_P.create, module: "admissions", action: "create", description: "ยื่นใบสมัครออนไลน์" },
  { code: ADMISSIONS_P.review, module: "admissions", action: "review", description: "ตรวจคุณสมบัติและหลักฐานเอกสารผู้สมัคร" },
  { code: ADMISSIONS_P.score, module: "admissions", action: "score", description: "บันทึกคะแนนสัมภาษณ์และตัดสินผลการคัดเลือก" },
  { code: ADMISSIONS_P.export, module: "admissions", action: "export", description: "ส่งออกรายชื่อผู้สมัครเป็นไฟล์ CSV/Excel" },
  { code: ADMISSIONS_P.manage, module: "admissions", action: "manage", description: "จัดการรอบการรับสมัครและโควตาที่นั่ง" },
];
