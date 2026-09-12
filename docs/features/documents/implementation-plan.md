# Implementation Plan
## ระบบบริหารจัดการและอนุมัติเอกสาร (E-Documents & Approvals)

---

### Phase 1: Database & Migrations
- [x] **Task 1.1:** `DocumentStatus`, `DocumentType`, `DocumentRequest`, `DocumentApprovalStep`
- [x] **Task 1.2:** Relation ผู้ยื่น / ผู้อนุมัติบน `User`
- [x] **Task 1.3:** Migration faculty core

---

### Phase 2: Validations & Workflow
- [x] **Task 2.1:** โฟลเดอร์ feature + permissions + messages
- [x] **Task 2.2:** Zod + `validations.test.ts`
- [x] **Task 2.3:** `workflow.ts` + `workflow.test.ts`

---

### Phase 3: Services
- [x] **Task 3.1:** CRUD ประเภท + ยื่นคำร้อง + เลขที่เอกสาร
- [x] **Task 3.2:** approve / reject / cancel + audit
- [ ] **Task 3.3:** ให้ `canCancelDocument` ตรงกับ service (DRAFT)
- [ ] **Task 3.4:** รายการ admin โหลด `approvalSteps` สำหรับ timeline

---

### Phase 4: Server Actions & Public API
- [x] **Task 4.1:** actions + barrels

---

### Phase 5: Central Integration
- [x] **Task 5.1:** permissions / i18n / seed ประเภทและคำร้องตัวอย่าง

---

### Phase 6: Admin UI
- [x] **Task 6.1:** `/documents` แท็บ กรอง ยื่น อนุมัติ ยกเลิก
- [x] **Task 6.2:** Dialog สร้างประเภทเอกสาร
- [ ] **Task 6.3:** UI แก้ประเภท, แนบไฟล์, ลายเซ็น, ฟิลด์ไดนามิก

---

### Phase 7: Portal UI
- [ ] **Task 7.1:** หน้าบ้านยื่น/ติดตามคำร้อง (ยังไม่มี — ตั้งใจเป็น admin-only ในรอบนี้)

---

### Phase 8: Verification
- [x] **Task 8.1:** Unit workflow + validations
- [ ] **Task 8.2:** Integration / e2e ของยื่นแล้วอนุมัติครบขั้น
