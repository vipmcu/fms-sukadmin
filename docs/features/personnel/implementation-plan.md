# Implementation Plan
## ระบบจัดการบุคลากร (Personnel Directory)

---

### Phase 1: Database & Migrations
- [x] **Task 1.1:** เพิ่ม `PersonnelType`, `AcademicPosition`, `Department`, `PersonnelProfile`
- [x] **Task 1.2:** Relation กับ Tenant, User, AcademicProgram, AssetItem
- [x] **Task 1.3:** Migration `20260910082437_add_faculty_core_modules`

---

### Phase 2: Validations
- [x] **Task 2.1:** โฟลเดอร์ `src/features/personnel/`
- [x] **Task 2.2:** `permissions.ts` / `messages.ts`
- [x] **Task 2.3:** Zod schemas + `validations.test.ts`

---

### Phase 3: Services
- [x] **Task 3.1:** CRUD ภาควิชา รวมกันลบเมื่อมี dependents
- [x] **Task 3.2:** CRUD บุคลากร + `listPersonnel` filter type/department/isActive/search
- [ ] **Task 3.3:** อัปเดตไม่ทับ `education`/`publications` เมื่อฟอร์มไม่ส่งมา

---

### Phase 4: Server Actions & Public API
- [x] **Task 4.1:** actions ครอบ `runAction` + สิทธิ์
- [x] **Task 4.2:** barrels `index.ts` / `server.ts` / `actions.ts`

---

### Phase 5: Central Integration
- [x] **Task 5.1:** `src/permissions.ts` + `src/i18n/index.ts`
- [x] **Task 5.2:** Seed ภาควิชาและโปรไฟล์ตัวอย่าง

---

### Phase 6: Admin UI
- [x] **Task 6.1:** `/personnel/manage` กริด + dialog
- [x] **Task 6.2:** Dialog สร้างภาควิชา
- [ ] **Task 6.3:** ฟอร์ม education / publications / ผูก userId

---

### Phase 7: Portal UI
- [x] **Task 7.1:** `/personnel` ค้นหา กรองภาควิชา/สาย
- [x] **Task 7.2:** `/personnel/[id]` รายละเอียด

---

### Phase 8: Verification
- [x] **Task 8.1:** Unit tests validation
- [ ] **Task 8.2:** Integration / e2e
