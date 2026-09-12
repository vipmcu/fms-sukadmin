# AI Coding Instructions & Rules: Curriculum Feature
## กฎเหล็กสำหรับ AI เมื่อเขียนหรือแก้โมดูลหลักสูตร

ปฏิบัติตาม `AGENTS.md` และกฎด้านล่างทุกครั้งที่แตะ `src/features/curriculum/`

---

### 1. ขอบเขตโมดูล

1. Logic อยู่ใน `src/features/curriculum/_internal/`
2. Public API: `index.ts`, `server.ts`, `actions.ts`
3. ภาควิชาอยู่ที่โมดูล personnel — เรียก `listDepartments` / `*DepartmentAction` จาก `@/features/personnel/server` และ `@/features/personnel/actions`
4. ไฟล์นอกโมดูลที่อนุญาต: `prisma/schema.prisma`, `src/permissions.ts`, `src/i18n/index.ts`, `src/app/(portal)/programs/**`, `src/app/(admin)/programs/**`, sidebar-nav

---

### 2. Multi-tenancy และความปลอดภัย

1. `tenantId` จาก session / `getPortalTenantId()`
2. Mapping สิทธิ์:
   - เปิดหน้า: `CURRICULUM_P.read`
   - สร้างโปรแกรม: `CURRICULUM_P.create`
   - แก้โปรแกรม / สร้าง-ลบรายวิชา: `CURRICULUM_P.edit`
   - ลบโปรแกรม: `CURRICULUM_P.manage`
3. หน้าบ้านกรอง `{ isActive: true }` และตรวจซ้ำที่หน้ารายละเอียด
4. เมื่อเพิ่ม `updateCourse` ให้กรองผ่าน `program.tenantId` — `deleteCourse` ปัจจุบันลบด้วย id อย่างเดียว อย่าขยายแบบนี้ถ้ายังไม่ใส่ tenant check

---

### 3. Server Actions และ Validation

1. `runAction()` + Zod + `zodErrorMap`
2. `revalidatePath("/programs")` หลัง mutation หลักสูตร
3. `departmentId` ว่างให้เก็บ `null` ไม่ใช่สตริงว่าง

---

### 4. i18n และ UI

1. `t("curriculum.<key>")` ทั้ง TH/EN
2. `@/shared/components/liyon`
3. ระดับการศึกษาใช้คีย์ `curriculum.level.*`

---

### 5. สิ่งที่ต้องรักษา

- `@@unique([tenantId, code])`
- ลบโปรแกรม cascade รายวิชา
- ลบภาควิชา SetNull ที่ `departmentId`
- อย่าแก้ `src/shared/styles/liyon/`
- ส่งงานเมื่อ `npm run check` ผ่าน
