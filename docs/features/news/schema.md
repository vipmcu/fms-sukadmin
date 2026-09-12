# Data Model, Schemas & Dictionary
## ระบบข่าวสารประชาสัมพันธ์ (News & Announcements)

---

### 1. Prisma Data Models & Enums

โค้ดที่อยู่ใน `prisma/schema.prisma` แล้ว (migration `20260910082437_add_faculty_core_modules`):

```prisma
enum NewsStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model NewsCategory {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @map("tenant_id") @db.Uuid
  slug      String   @db.VarChar(100)
  nameTh    String   @map("name_th") @db.VarChar(255)
  nameEn    String   @map("name_en") @db.VarChar(255)
  color     String?  @db.VarChar(50)
  order     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant   Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  articles NewsArticle[]

  @@unique([tenantId, slug])
  @@map("news_categories")
}

model NewsArticle {
  id            String     @id @default(uuid()) @db.Uuid
  tenantId      String     @map("tenant_id") @db.Uuid
  categoryId    String     @map("category_id") @db.Uuid
  slug          String     @db.VarChar(255)
  titleTh       String     @map("title_th") @db.VarChar(500)
  titleEn       String?    @map("title_en") @db.VarChar(500)
  contentTh     String     @map("content_th") @db.Text
  contentEn     String?    @map("content_en") @db.Text
  excerptTh     String?    @map("excerpt_th") @db.Text
  excerptEn     String?    @map("excerpt_en") @db.Text
  coverImageUrl String?    @map("cover_image_url") @db.VarChar(500)
  status        NewsStatus @default(DRAFT)
  isPinned      Boolean    @default(false) @map("is_pinned")
  viewCount     Int        @default(0) @map("view_count")
  publishedAt   DateTime?  @map("published_at") @db.Timestamptz()
  authorId      String     @map("author_id") @db.Uuid
  /// [{ name: string, url: string, size?: number }]
  attachments   Json       @default("[]") @db.JsonB
  createdAt     DateTime   @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime   @updatedAt @map("updated_at") @db.Timestamptz()

  tenant   Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  category NewsCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  author   User         @relation("NewsAuthor", fields: [authorId], references: [id], onDelete: Restrict)

  @@unique([tenantId, slug])
  @@index([tenantId, status, publishedAt])
  @@index([tenantId, categoryId])
  @@map("news_articles")
}
```

---

### 2. Zod Validation Schemas

อยู่ใน `src/features/news/_internal/validations.ts`:

```ts
newsStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"])

createNewsCategorySchema = {
  slug: z.string().min(2).max(100),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  color: z.string().max(50).optional().nullable(),
  order: z.number().int().default(0),
}

updateNewsCategorySchema = createNewsCategorySchema + { id: z.string().uuid() }

createNewsArticleSchema = {
  categoryId: z.string().uuid(),
  slug: z.string().min(2).max(255),
  titleTh: z.string().min(1).max(500),
  titleEn: z.string().max(500).optional().nullable(),
  contentTh: z.string().min(1),
  contentEn: z.string().optional().nullable(),
  excerptTh / excerptEn: optional nullable,
  coverImageUrl: z.string().url().or(z.literal("")).optional().nullable(),
  status: newsStatusEnum.default("DRAFT"),
  isPinned: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
  attachments: z.array(z.record(z.string(), z.unknown())).default([]),
}

updateNewsArticleSchema = createNewsArticleSchema + { id: z.string().uuid() }

togglePublishArticleSchema = { id: uuid, status: newsStatusEnum } // มีแต่ยังไม่ถูกใช้
```

---

### 3. คีย์คำแปลใน `messages.ts`

ทุกคีย์ต้องมีทั้ง `th` และ `en`:

| Key | th | en |
| :--- | :--- | :--- |
| `news.nav` | จัดการข่าวสารประชาสัมพันธ์ | News & Announcements |
| `news.title` | ระบบข่าวสารประชาสัมพันธ์ | News & Announcements |
| `news.subtitle` | จัดการข่าวสาร กิจกรรม และประกาศสำคัญของคณะ | Manage faculty news, events, and announcements |
| `news.tab.articles` | บทความข่าวทั้งหมด | All Articles |
| `news.tab.categories` | หมวดหมู่ข่าว | Categories |
| `news.tab.create` | เขียนข่าวใหม่ | New Article |
| `news.status.draft` | ฉบับร่าง | Draft |
| `news.status.published` | เผยแพร่แล้ว | Published |
| `news.status.archived` | เก็บถาวร | Archived |
| `news.field.titleTh` | หัวข้อข่าว (ภาษาไทย) | Title (Thai) |
| `news.field.titleEn` | หัวข้อข่าว (ภาษาอังกฤษ) | Title (English) |
| `news.field.category` | หมวดหมู่ | Category |
| `news.field.slug` | Slug (URL) | Slug (URL) |
| `news.field.excerpt` | เนื้อหาย่อ / สรุป | Excerpt |
| `news.field.content` | เนื้อหาข่าวฉบับเต็ม | Full Content |
| `news.field.coverImage` | รูปภาพหน้าปก (URL) | Cover Image URL |
| `news.field.status` | สถานะการเผยแพร่ | Publishing Status |
| `news.field.isPinned` | ปักหมุดข่าวเด่น | Pin Article |
| `news.field.publishedAt` | วันที่เผยแพร่ | Published Date |
| `news.field.author` | ผู้เขียน | Author |
| `news.field.views` | ยอดการอ่าน | Views |
| `news.btn.create` | สร้างข่าวใหม่ | Create Article |
| `news.btn.edit` | แก้ไข | Edit |
| `news.btn.delete` | ลบ | Delete |
| `news.btn.publish` | เผยแพร่ทันที | Publish Now |
| `news.btn.unpublish` | ถอนการเผยแพร่ | Unpublish |
| `news.btn.save` | บันทึกข้อมูล | Save |
| `news.admin.desc` | จัดการข่าวสาร บทความประชาสัมพันธ์ และหมวดหมู่ข่าวของคณะ | Manage faculty news articles, public announcements, and categories |
| `news.admin.searchPlaceholder` | ค้นหาข่าวสารประชาสัมพันธ์... | Search announcements... |
| `news.msg.created` | สร้างบทความข่าวเรียบร้อยแล้ว | Article created successfully |
| `news.msg.updated` | อัปเดตบทความข่าวเรียบร้อยแล้ว | Article updated successfully |
| `news.msg.deleted` | ลบบทความข่าวเรียบร้อยแล้ว | Article deleted successfully |
| `news.msg.catCreated` | เพิ่มหมวดหมู่ข่าวเรียบร้อยแล้ว | Category created successfully |
| `news.msg.empty` | ไม่พบข้อมูลข่าวสารประชาสัมพันธ์ | No news articles found |
| `roles.module.news` | ระบบข่าวสารประชาสัมพันธ์ | News & Announcements |
| `perm.news:read` | ดูรายการข่าวสารและบทความ | View news articles and announcements |
| `perm.news:create` | สร้างและร่างบทความข่าวใหม่ | Create and draft new articles |
| `perm.news:edit` | แก้ไขบทความข่าว | Edit news articles |
| `perm.news:publish` | เผยแพร่หรือถอนการเผยแพร่ข่าว | Publish or unpublish articles |
| `perm.news:manage` | จัดการข่าวสาร หมวดหมู่ และลบบทความ | Manage news, categories, and deletions |
