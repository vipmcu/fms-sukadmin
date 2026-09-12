# Implementation Plan
## ระบบข่าวสารประชาสัมพันธ์ (News & Announcements)

แผนตามลำดับการพึ่งพาของ VibeCore — งานที่ส่งแล้วทำเครื่องหมาย `[x]` ช่องว่างที่รู้แล้วยังเป็น `[ ]`

---

### Phase 1: Database & Migrations
- [x] **Task 1.1:** เพิ่ม `NewsStatus`, `NewsCategory`, `NewsArticle` ใน `prisma/schema.prisma` พร้อม `tenantId`
- [x] **Task 1.2:** ผูก relation บน `Tenant` และ `User` (`NewsAuthor`)
- [x] **Task 1.3:** Migration `20260910082437_add_faculty_core_modules`
- [x] **Task 1.4:** `npm run db:generate`

---

### Phase 2: Domain Skeleton & Validations
- [x] **Task 2.1:** สร้าง `src/features/news/` และ `_internal/`
- [x] **Task 2.2:** `permissions.ts` — `NEWS_P`
- [x] **Task 2.3:** `messages.ts` TH/EN
- [x] **Task 2.4:** `_internal/validations.ts`
- [x] **Task 2.5:** `_internal/validations.test.ts`

---

### Phase 3: Services
- [x] **Task 3.1:** `_internal/services.ts` — list/create/update category, list/get/create/update/delete article, increment viewCount
- [ ] **Task 3.2:** Service เผยแพร่แยกที่ใช้ `NEWS_P.publish` และ `togglePublishArticleSchema`

---

### Phase 4: Server Actions & Public API
- [x] **Task 4.1:** `_internal/actions.ts` ครอบ `runAction` + `requirePermission`
- [x] **Task 4.2:** `actions.ts` / `server.ts` / `index.ts`

---

### Phase 5: Central Integration
- [x] **Task 5.1:** ลงทะเบียนใน `src/permissions.ts`
- [x] **Task 5.2:** ลงทะเบียนใน `src/i18n/index.ts`
- [x] **Task 5.3:** Seed ข่าวตัวอย่างใน `prisma/seed.ts`

---

### Phase 6: Admin UI
- [x] **Task 6.1:** เมนู sidebar `/news/manage`
- [x] **Task 6.2:** หน้า `/(admin)/news/manage` + dialog สร้าง/แก้/ลบข่าว
- [x] **Task 6.3:** Dialog สร้างหมวดหมู่
- [ ] **Task 6.4:** UI แก้/ลบหมวดหมู่ และแนบ `attachments` / `contentEn`

---

### Phase 7: Portal UI
- [x] **Task 7.1:** `/(portal)/news` รายการ + กรอง + ปักหมุด
- [x] **Task 7.2:** `/(portal)/news/[slug]` รายละเอียด + viewCount
- [x] **Task 7.3:** วิดเจ็ตข่าวหน้าแรก 3 รายการ

---

### Phase 8: Verification
- [x] **Task 8.1:** Unit tests validation
- [ ] **Task 8.2:** Integration / e2e ของสร้างข่าวแล้วเห็นบน portal
