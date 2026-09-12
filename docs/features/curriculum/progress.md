# Progress Tracking & Quality Gates
## ระบบจัดการหลักสูตร (Academic Programs & Curriculum)

---

### 1. สถานะการพัฒนาตามขั้นตอน

| ขั้นตอน | รายละเอียดงาน | สถานะ | หมายเหตุ |
| :--- | :--- | :---: | :--- |
| **Phase 0: Blueprints** | 6 ไฟล์ใน `docs/features/curriculum/` | [x] | Backfill จากโค้ดจริง |
| **Phase 1: Database** | AcademicProgram + CurriculumCourse | [x] | |
| **Phase 2: Domain Logic** | Zod + services | [x] | |
| **Phase 3: Integration** | permissions / i18n / actions | [x] | |
| **Phase 4: Admin UI** | `/programs/manage` + ภาควิชา | [x] | ไม่มี UI รายวิชา |
| **Phase 5: Public Portal** | `/programs`, `/programs/[id]` | [x] | |
| **Phase 6: Quality Gate** | unit validations | [x] | ไม่มี int/e2e |

---

### 2. Quality Gate Checklist (`npm run check`)

- [x] Type Check
- [x] Tests Type Check
- [x] Lint
- [x] Module Boundary
- [x] Unit Tests
- [ ] Integration Tests
- [ ] E2E Playwright

---

### 3. ช่องว่างที่ติดตามต่อ

| ข้อ | สถานะ |
| :--- | :--- |
| UI จัดการรายวิชา | เปิดค้าง |
| `updateCourse` + tenant check ตอนลบรายวิชา | เปิดค้าง |
