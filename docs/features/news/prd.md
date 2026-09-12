# Product Requirements Document (PRD)
## ระบบข่าวสารประชาสัมพันธ์ (News & Announcements)

เอกสารนี้สะท้อนโค้ดที่ส่งแล้วใน `src/features/news/` (migration `20260910082437_add_faculty_core_modules`)

---

### 1. บทนำและวัตถุประสงค์ (Objective)

ระบบข่าวสารประชาสัมพันธ์เป็นช่องทางสื่อสารหลักของคณะ ใช้เผยแพร่ข่าว กิจกรรม และประกาศไปยังบุคคลภายนอกผ่าน Public Portal และให้เจ้าหน้าที่ PR จัดการเนื้อหาใน Admin Console

**เป้าหมายหลัก:**
1. รวมศูนย์ข่าวและประกาศภายใต้ Modular Monolith ของคณะ แยกตาม `tenant_id`
2. แสดงเฉพาะข่าวสถานะ `PUBLISHED` บนหน้าบ้าน (`/news`, `/news/[slug]`, วิดเจ็ตหน้าแรก 3 รายการ)
3. ให้เจ้าหน้าที่สร้าง แก้ไข ลบข่าว และสร้างหมวดหมู่จาก `/news/manage`
4. รองรับสองภาษา (หัวข้อ เนื้อหา หมวดหมู่ TH/EN) slug URL ปักหมุดข่าวเด่น และนับยอดอ่าน

---

### 2. กลุ่มผู้ใช้งานและสิทธิ์การเข้าถึง (User Personas & Roles)

| Persona / Role | คำอธิบายและบทบาทหน้าที่ | หน้าจอหลักที่ใช้งาน |
| :--- | :--- | :--- |
| **Guest** | อ่านข่าวที่เผยแพร่แล้ว ค้นหา กรองหมวดหมู่ ดูข่าวปักหมุด | Public Portal (`/(portal)/news`) |
| **News Author** | สร้างข่าวใหม่ กำหนดสถานะตอนสร้าง รวมถึงเผยแพร่ทันที | Admin (`/(admin)/news/manage`) |
| **News Editor** | แก้ไขข่าว เปลี่ยนหมวดหมู่ สถานะ ปักหมุด | Admin (`/(admin)/news/manage`) |
| **News Manager** | ลบข่าว และสร้างหมวดหมู่ข่าว | Admin (`/(admin)/news/manage`) |
| **System Administrator** | กำหนดบทบาทให้สิทธิ์ `news:*` | Admin (`/(admin)/users/roles`) |

---

### 3. ฟังก์ชันการทำงานหลัก (Functional Requirements)

#### RF-01: หมวดหมู่ข่าว (NewsCategory)
- สร้างหมวดหมู่: `slug`, `nameTh`, `nameEn`, `color?`, `order`
- `slug` ต้องไม่ซ้ำใน tenant เดียวกัน
- ลบหมวดหมู่ที่มีบทความไม่ได้ (`ON DELETE RESTRICT`)
- อัปเดตหมวดหมู่มีใน service/action แต่ **ยังไม่มี UI**

#### RF-02: บทความข่าว (NewsArticle)
- ฟิลด์บังคับ: `categoryId`, `slug`, `titleTh`, `contentTh`
- ฟิลด์เสริม: `titleEn`, `contentEn`, `excerptTh/En`, `coverImageUrl`, `attachments`, `isPinned`, `publishedAt`
- `authorId` มาจาก session ตอนสร้าง ไม่รับจาก client
- ลบแบบ hard delete ต้องมี `news:manage`

#### RF-03: สถานะการเผยแพร่ (NewsStatus)
- `DRAFT` (ค่าเริ่มต้น Zod/Prisma) — เห็นเฉพาะหลังบ้าน
- `PUBLISHED` — เห็นหน้าบ้าน; ตั้ง `publishedAt` อัตโนมัติถ้ายังว่าง
- `ARCHIVED` — ซ่อนจากหน้าบ้าน ยังเห็นหลังบ้าน
- การเปลี่ยนสถานะทำผ่านฟิลด์ `status` ใน create/update **ไม่มี action แยก publish**
- สิทธิ์ `news:publish` มีใน registry แต่ **ยังไม่ถูก enforce** — ผู้มี `news:create` / `news:edit` ตั้งสถานะได้

#### RF-04: หน้าบ้าน
- `/news` แสดงเฉพาะ `PUBLISHED` เรียง `isPinned desc`, `publishedAt desc`
- ข่าวปักหมุดรายการแรกเป็น hero banner
- `/news/[slug]` เพิ่ม `viewCount` เมื่อข่าวเป็น `PUBLISHED`; ถ้าไม่พบหรือไม่ใช่ PUBLISHED → `notFound()`
- หน้าแรกดึงข่าวล่าสุด 3 รายการ

#### RF-05: Audit และแคช
- Mutation เรียก `revalidatePath("/news")`
- ไม่มี `writeAudit` ในโมดูลนี้ (ต่างจาก documents/reservations)

---

### 4. ข้อกำหนดที่ไม่ใช่เชิงฟังก์ชัน (Non-Functional Requirements)

1. **Security & Multi-tenancy:** ทุก query กรอง `tenantId` จาก session หรือ `getPortalTenantId()` — ห้ามรับ `tenantId` จาก client
2. **i18n:** ข้อความ UI ผ่าน `t("news.*")` ทั้ง TH/EN
3. **Design:** ใช้คอมโพเนนต์จาก `@/shared/components/liyon`
4. **Boundaries:** logic อยู่ใน `_internal/` เท่านั้น

---

### 5. เกณฑ์การตรวจรับงาน (Acceptance Criteria)

- [x] Guest เห็นเฉพาะข่าว `PUBLISHED` ที่ `/news` และ `/news/[slug]`
- [x] ข่าว `DRAFT` / `ARCHIVED` เปิด slug แล้วได้ 404
- [x] สร้างข่าวต้องมี `titleTh` และ `contentTh`; slug ไม่ซ้ำใน tenant
- [x] ปักหมุดแล้วขึ้นก่อนในรายการและเป็น hero
- [x] อ่านรายละเอียดข่าว PUBLISHED แล้ว `viewCount` เพิ่มขึ้น
- [x] ผู้มี `news:create` สร้างข่าวได้; `news:edit` แก้ไขได้; `news:manage` ลบและสร้างหมวดหมู่ได้
- [x] ผ่าน `npm run check` ในชุดเทสต์ validation ของโมดูล
- [ ] Enforce `news:publish` แยกจากการแก้ฟิลด์ `status` (ช่องว่างที่รู้แล้ว)
- [ ] UI แก้ไข/ลบหมวดหมู่ และแนบไฟล์ `attachments`
