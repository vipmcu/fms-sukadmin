# AI Coding Instructions & Rules: News Feature
## กฎเหล็กสำหรับ AI เมื่อเขียนหรือแก้โมดูลข่าวสารประชาสัมพันธ์

ปฏิบัติตาม `AGENTS.md` และกฎด้านล่างทุกครั้งที่แตะ `src/features/news/`

---

### 1. ขอบเขตโมดูล (Modular Monolith Boundaries)

1. Business logic, Prisma queries, Zod schemas อยู่ใน `src/features/news/_internal/` เท่านั้น
2. Feature อื่นเรียกผ่าน Public API เท่านั้น:
   - `index.ts` — types, schemas, permissions, messages
   - `server.ts` — list/get/create/update/delete สำหรับ Server Components
   - `actions.ts` — Server Actions
3. ไฟล์นอกโมดูลที่อนุญาตให้เชื่อม:
   - `prisma/schema.prisma` (NewsStatus, NewsCategory, NewsArticle)
   - `src/permissions.ts`
   - `src/i18n/index.ts`
   - `src/app/(portal)/news/**` และ `src/app/(admin)/news/**`
   - `src/components/layout/sidebar-nav.ts`

---

### 2. Multi-tenancy และความปลอดภัย

1. ดึง `tenantId` จาก `requirePermission(...)` หรือ `getPortalTenantId()` — ไม่รับจาก payload
2. ทุก Server Action เรียก `requirePermission` ก่อนทำงาน:
   - อ่านหน้า admin: `NEWS_P.read`
   - สร้างข่าว: `NEWS_P.create`
   - แก้ข่าว: `NEWS_P.edit`
   - ลบข่าว / สร้างหมวดหมู่: `NEWS_P.manage`
3. เมื่อเพิ่ม action เผยแพร่แยก ให้ใช้ `NEWS_P.publish` — อย่าปล่อยให้ create/edit ตั้ง `PUBLISHED` โดยไม่มีสิทธิ์นี้ถ้ากำลังปิดช่องว่างนี้
4. หน้าบ้าน query `{ status: "PUBLISHED" }` เท่านั้น และตรวจซ้ำก่อนเรนเดอร์รายละเอียด

---

### 3. Server Actions และ Validation

1. ครอบด้วย `runAction()` คืน `ActionResult<T>`
2. Parse ด้วย Zod + `zodErrorMap(await getLocale())`
3. หลัง mutation เรียก `revalidatePath("/news")` และเส้นทางที่เกี่ยวข้อง
4. `authorId` มาจาก `ctx.userId` ตอนสร้าง

---

### 4. i18n และ UI

1. ข้อความ UI ผ่าน `t("news.<key>")` — เพิ่มคีย์ทั้ง `th` และ `en` ใน `messages.ts` แล้วลงทะเบียนใน `src/i18n/index.ts`
2. วันที่ผ่าน `formatDate` / `formatDateTime` (พ.ศ. / ค.ศ.)
3. ใช้คอมโพเนนต์จาก `@/shared/components/liyon`
4. Status pill: `DRAFT` = warning, `PUBLISHED` = success, `ARCHIVED` = neutral

---

### 5. สิ่งที่ต้องรักษาระหว่างแก้

- Slug unique ต่อ tenant (`@@unique([tenantId, slug])`)
- หมวดหมู่ที่มีบทความลบไม่ได้ (`onDelete: Restrict`)
- `togglePublishArticleSchema` มีอยู่แต่ยังไม่ถูกใช้ — ถ้าทำ publish แยก ให้ต่อ schema นี้แทนการสร้างซ้ำ
- อย่าแก้ `src/shared/styles/liyon/`
- ส่งงานเมื่อ `npm run check` ผ่าน
