# Implementation Plan
## ระบบจัดการหลักสูตร (Academic Programs & Curriculum)

---

### Phase 1: Database & Migrations
- [x] **Task 1.1:** `DegreeLevel`, `AcademicProgram`, `CurriculumCourse`
- [x] **Task 1.2:** `departmentId` optional + relations รับสมัคร
- [x] **Task 1.3:** Migration faculty core

---

### Phase 2: Validations
- [x] **Task 2.1:** โฟลเดอร์ feature + permissions + messages
- [x] **Task 2.2:** Zod + `validations.test.ts`

---

### Phase 3: Services
- [x] **Task 3.1:** CRUD โปรแกรม + list filter
- [x] **Task 3.2:** create/delete course
- [ ] **Task 3.3:** `updateCourse` + tenant check ตอนลบรายวิชา

---

### Phase 4: Server Actions & Public API
- [x] **Task 4.1:** actions + barrels

---

### Phase 5: Central Integration
- [x] **Task 5.1:** permissions / i18n / seed (CS-BSC, DS-MSC)

---

### Phase 6: Admin UI
- [x] **Task 6.1:** `/programs/manage` กรองระดับและภาควิชา
- [x] **Task 6.2:** Dialog หลักสูตร + จัดการภาควิชา
- [ ] **Task 6.3:** UI รายวิชาในหลักสูตร

---

### Phase 7: Portal UI
- [x] **Task 7.1:** `/programs` และ `/programs/[id]`

---

### Phase 8: Verification
- [x] **Task 8.1:** Unit validations
- [ ] **Task 8.2:** Integration / e2e
