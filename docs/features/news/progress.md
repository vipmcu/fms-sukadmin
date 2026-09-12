# Progress Tracking & Quality Gates
## ระบบข่าวสารประชาสัมพันธ์ (News & Announcements)

---

### 1. สถานะการพัฒนาตามขั้นตอน

| ขั้นตอน | รายละเอียดงาน | สถานะ | หมายเหตุ |
| :--- | :--- | :---: | :--- |
| **Phase 0: Blueprints** | จัดทำ 6 ไฟล์พิมพ์เขียวใน `docs/features/news/` | [x] | Backfill จากโค้ดจริง |
| **Phase 1: Database** | Models + migration faculty core | [x] | `20260910082437` |
| **Phase 2: Domain Logic** | Zod, unit tests, services | [x] | validations.test.ts |
| **Phase 3: Integration** | Permissions, messages, actions, barrels | [x] | |
| **Phase 4: Admin UI** | `/news/manage` | [x] | ยังไม่มี UI แก้หมวดหมู่ |
| **Phase 5: Public Portal** | `/news`, `/news/[slug]` | [x] | |
| **Phase 6: Quality Gate** | type-check / lint / deps / unit | [x] | e2e โดเมนยังไม่มี |

---

### 2. Quality Gate Checklist (`npm run check`)

- [x] **Type Check:** `npm run type-check`
- [x] **Tests Type Check:** `npm run type-check:tests`
- [x] **Lint:** `npm run lint`
- [x] **Module Boundary:** `npm run deps:check`
- [x] **Unit Tests:** `npm run test` (รวม validations ของ news)
- [ ] **Integration Tests:** ยังไม่มี `news/*.int.test.ts`
- [ ] **E2E:** Playwright ยังไม่ครอบข่าว

---

### 3. ช่องว่างที่ติดตามต่อ

| ข้อ | สถานะ |
| :--- | :--- |
| Enforce `news:publish` | เปิดค้าง |
| `togglePublishArticleSchema` ยังไม่ถูกใช้ | เปิดค้าง |
| UI แก้/ลบหมวดหมู่, attachments, contentEn | เปิดค้าง |
