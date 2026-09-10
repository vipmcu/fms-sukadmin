import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "news.nav": { th: "จัดการข่าวสารประชาสัมพันธ์", en: "News & Announcements" },
  "news.title": { th: "ระบบข่าวสารประชาสัมพันธ์", en: "News & Announcements" },
  "news.subtitle": { th: "จัดการข่าวสาร กิจกรรม และประกาศสำคัญของคณะ", en: "Manage faculty news, events, and announcements" },
  "news.tab.articles": { th: "บทความข่าวทั้งหมด", en: "All Articles" },
  "news.tab.categories": { th: "หมวดหมู่ข่าว", en: "Categories" },
  "news.tab.create": { th: "เขียนข่าวใหม่", en: "New Article" },

  // Statuses
  "news.status.draft": { th: "ฉบับร่าง", en: "Draft" },
  "news.status.published": { th: "เผยแพร่แล้ว", en: "Published" },
  "news.status.archived": { th: "เก็บถาวร", en: "Archived" },

  // Fields
  "news.field.titleTh": { th: "หัวข้อข่าว (ภาษาไทย)", en: "Title (Thai)" },
  "news.field.titleEn": { th: "หัวข้อข่าว (ภาษาอังกฤษ)", en: "Title (English)" },
  "news.field.category": { th: "หมวดหมู่", en: "Category" },
  "news.field.slug": { th: "Slug (URL)", en: "Slug (URL)" },
  "news.field.excerpt": { th: "เนื้อหาย่อ / สรุป", en: "Excerpt" },
  "news.field.content": { th: "เนื้อหาข่าวฉบับเต็ม", en: "Full Content" },
  "news.field.coverImage": { th: "รูปภาพหน้าปก (URL)", en: "Cover Image URL" },
  "news.field.status": { th: "สถานะการเผยแพร่", en: "Publishing Status" },
  "news.field.isPinned": { th: "ปักหมุดข่าวเด่น", en: "Pin Article" },
  "news.field.publishedAt": { th: "วันที่เผยแพร่", en: "Published Date" },
  "news.field.author": { th: "ผู้เขียน", en: "Author" },
  "news.field.views": { th: "ยอดการอ่าน", en: "Views" },

  // Buttons & Actions
  "news.btn.create": { th: "สร้างข่าวใหม่", en: "Create Article" },
  "news.btn.edit": { th: "แก้ไข", en: "Edit" },
  "news.btn.delete": { th: "ลบ", en: "Delete" },
  "news.btn.publish": { th: "เผยแพร่ทันที", en: "Publish Now" },
  "news.btn.unpublish": { th: "ถอนการเผยแพร่", en: "Unpublish" },
  "news.btn.save": { th: "บันทึกข้อมูล", en: "Save" },

  // Messages
  "news.admin.desc": { th: "จัดการข่าวสาร บทความประชาสัมพันธ์ และหมวดหมู่ข่าวของคณะ", en: "Manage faculty news articles, public announcements, and categories" },
  "news.admin.searchPlaceholder": { th: "ค้นหาข่าวสารประชาสัมพันธ์...", en: "Search announcements..." },
  "news.msg.created": { th: "สร้างบทความข่าวเรียบร้อยแล้ว", en: "Article created successfully" },
  "news.msg.updated": { th: "อัปเดตบทความข่าวเรียบร้อยแล้ว", en: "Article updated successfully" },
  "news.msg.deleted": { th: "ลบบทความข่าวเรียบร้อยแล้ว", en: "Article deleted successfully" },
  "news.msg.catCreated": { th: "เพิ่มหมวดหมู่ข่าวเรียบร้อยแล้ว", en: "Category created successfully" },
  "news.msg.empty": { th: "ไม่พบข้อมูลข่าวสารประชาสัมพันธ์", en: "No news articles found" },

  // RBAC & Permissions Dictionary
  "roles.module.news": { th: "ระบบข่าวสารประชาสัมพันธ์", en: "News & Announcements" },
  "perm.news:read": { th: "ดูรายการข่าวสารและบทความ", en: "View news articles and announcements" },
  "perm.news:create": { th: "สร้างและร่างบทความข่าวใหม่", en: "Create and draft new articles" },
  "perm.news:edit": { th: "แก้ไขบทความข่าว", en: "Edit news articles" },
  "perm.news:publish": { th: "เผยแพร่หรือถอนการเผยแพร่ข่าว", en: "Publish or unpublish articles" },
  "perm.news:manage": { th: "จัดการข่าวสาร หมวดหมู่ และลบบทความ", en: "Manage news, categories, and deletions" },
};
