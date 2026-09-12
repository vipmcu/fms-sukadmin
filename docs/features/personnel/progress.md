# Progress Tracking & Quality Gates
## ระบบจัดการบุคลากร (Personnel Directory)

---

### 1. สถานะการพัฒนาตามขั้นตอน

| ขั้นตอน | รายละเอียดงาน | สถานะ | หมายเหตุ |
| :--- | :--- | :---: | :--- |
| **Phase 0: Blueprints** | 6 ไฟล์ใน `docs/features/personnel/` | [x] | Backfill จากโค้ดจริง |
| **Phase 1: Database** | Department + PersonnelProfile | [x] | |
| **Phase 2: Domain Logic** | Zod + services | [x] | |
| **Phase 3: Integration** | permissions / i18n / actions | [x] | |
| **Phase 4: Admin UI** | `/personnel/manage` | [x] | education/publications ยังไม่อยู่ในฟอร์ม |
| **Phase 5: Public Portal** | `/personnel`, `/personnel/[id]` | [x] | |
| **Phase 6: Quality Gate** | unit validations | [x] | ไม่มี int/e2e |

---

### 2. Quality Gate Checklist (`npm run check`)

- [x] Type Check
- [x] Tests Type Check
- [x] Lint
- [x] Module Boundary
- [x] Unit Tests (`validations.test.ts`)
- [ ] Integration Tests
- [ ] E2E Playwright

---

### 3. ช่องว่างที่ติดตามต่อ

| ข้อ | สถานะ |
| :--- | :--- |
| ฟอร์ม education / publications / userId | เปิดค้าง |
| อัปเดตโปรไฟล์อาจรีเซ็ต JSON เป็น `[]` ถ้าไม่ส่งมา | เปิดค้าง |
