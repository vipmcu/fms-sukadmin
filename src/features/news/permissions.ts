import type { PermissionDef } from "@/shared/lib/permission-def";

export const NEWS_P = {
  read: "news:read",
  create: "news:create",
  edit: "news:edit",
  publish: "news:publish",
  manage: "news:manage",
} as const;

export const NEWS_PERMISSIONS: readonly PermissionDef[] = [
  { code: NEWS_P.read, module: "news", action: "read", description: "ดูรายการข่าวสารและบทความ" },
  { code: NEWS_P.create, module: "news", action: "create", description: "สร้างข่าวสารและบทความใหม่" },
  { code: NEWS_P.edit, module: "news", action: "edit", description: "แก้ไขข่าวสารและบทความ" },
  { code: NEWS_P.publish, module: "news", action: "publish", description: "เผยแพร่หรือถอนการเผยแพร่ข่าว" },
  { code: NEWS_P.manage, module: "news", action: "manage", description: "จัดการหมวดหมู่ข่าวและการตั้งค่าทั้งหมด" },
];
