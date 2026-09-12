# AI Coding Instructions & Rules: Personnel Feature
## กฎเหล็กสำหรับ AI เมื่อเขียนหรือแก้โมดูลบุคลากร

ปฏิบัติตาม `AGENTS.md` และกฎด้านล่างทุกครั้งที่แตะ `src/features/personnel/`

---

### 1. ขอบเขตโมดูล

1. Logic อยู่ใน `src/features/personnel/_internal/`
2. Public API: `index.ts`, `server.ts`, `actions.ts`
3. ไฟล์นอกโมดูลที่อนุญาตให้เชื่อม:
   - `prisma/schema.prisma` (`Department`, `PersonnelProfile`, enums)
   - `src/permissions.ts`, `src/i18n/index.ts`
   - `src/app/(portal)/personnel/**`, `src/app/(admin)/personnel/**`
   - `src/components/layout/sidebar-nav.ts`
4. ภาควิชาเป็นของโมดูลนี้ — หลักสูตรเรียกผ่าน `server.ts` / `actions.ts` ของ personnel ไม่ใช่ `_internal/`

---

### 2. Multi-tenancy และความปลอดภัย

1. `tenantId` จาก session หรือ `getPortalTenantId()` เท่านั้น
2. Mapping สิทธิ์:
   - เปิดหน้า admin: `PERSONNEL_P.read`
   - สร้างโปรไฟล์: `PERSONNEL_P.create`
   - แก้โปรไฟล์: `PERSONNEL_P.edit`
   - ลบโปรไฟล์: `PERSONNEL_P.manage`
   - CRUD ภาควิชา: `PERSONNEL_P.manage` **หรือ** `CURRICULUM_P.manage`
3. หน้าบ้านโหลด `{ isActive: true }` และตรวจซ้ำที่หน้ารายละเอียด

---

### 3. Server Actions และ Validation

1. ครอบด้วย `runAction()` + Zod + `zodErrorMap`
2. หลังแก้บุคลากร: `revalidatePath("/personnel")`
3. หลังแก้ภาควิชา: `revalidatePath("/personnel")`, `/programs`, `/programs/manage`
4. ลบภาควิชาต้องตรวจ `_count` ของ personnel / programs / assetItems แล้วโยน conflict

---

### 4. i18n และ UI

1. ข้อความผ่าน `t("personnel.<key>")` ทั้ง TH/EN ใน `messages.ts`
2. ใช้ `@/shared/components/liyon`
3. วันที่ผ่าน `formatDate`
4. อย่าใส่ `userId` จาก client เพื่อผูกโปรไฟล์คนอื่นโดยไม่ตรวจสิทธิ์

---

### 5. สิ่งที่ต้องรักษา

- `Department.code` unique ต่อ tenant
- `PersonnelProfile.userId` unique เมื่อมีค่า
- ลบภาควิชาแบบ Restrict ไม่ cascade ทับบุคลากร
- อย่าแก้ `src/shared/styles/liyon/`
- ส่งงานเมื่อ `npm run check` ผ่าน
