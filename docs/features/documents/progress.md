# Progress Tracking & Quality Gates
## ระบบบริหารจัดการและอนุมัติเอกสาร (E-Documents & Approvals)

---

### 1. สถานะการพัฒนาตามขั้นตอน

| ขั้นตอน | รายละเอียดงาน | สถานะ | หมายเหตุ |
| :--- | :--- | :---: | :--- |
| **Phase 0: Blueprints** | 6 ไฟล์ใน `docs/features/documents/` | [x] | Backfill จากโค้ดจริง |
| **Phase 1: Database** | types + requests + steps | [x] | |
| **Phase 2: Domain Logic** | Zod + workflow tests | [x] | |
| **Phase 3: Integration** | permissions / i18n / actions / audit | [x] | |
| **Phase 4: Admin UI** | `/documents` รวมแท็บ | [x] | โหลด `approvalSteps` ตอนเปิดรายละเอียดแล้ว |
| **Phase 5: Public Portal** | ไม่มีหน้าบ้าน | [ ] | ตั้งใจเป็น admin-only ในรอบนี้ |
| **Phase 6: Quality Gate** | unit workflow + validations | [x] | ไม่มี int/e2e |

---

### 2. Quality Gate Checklist (`npm run check`)

- [x] Type Check
- [x] Tests Type Check
- [x] Lint
- [x] Module Boundary
- [x] Unit Tests (`workflow.test.ts`, `validations.test.ts`)
- [ ] Integration Tests
- [ ] E2E Playwright

---

### 3. ช่องว่างที่ติดตามต่อ

| ข้อ | สถานะ |
| :--- | :--- |
| `nextRole` จาก `approverRoles` ใน metadata (ไม่ hardcode ใน workflow) | ปิดแล้ว |
| `canCancelDocument` รวม DRAFT สอดคล้อง service/UI | ปิดแล้ว |
| รายละเอียดโหลด `approvalSteps` ผ่าน `getDocumentRequestByIdAction` | ปิดแล้ว |
| attachments / signature / requiredFields UI | เปิดค้าง |
| Portal สำหรับผู้ยื่น | เปิดค้าง |
