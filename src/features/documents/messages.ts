import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "documents.nav": { th: "จัดการเอกสารและอนุมัติ", en: "E-Documents & Approvals" },
  "documents.title": { th: "ระบบบริหารจัดการและอนุมัติเอกสาร", en: "E-Documents & Approvals" },
  "documents.subtitle": { th: "ยื่นคำร้อง ติดตามสถานะ และดำเนินการลงนามอนุมัติเอกสารอิเล็กทรอนิกส์", en: "Submit requests, track status, and approve e-documents" },
  "documents.tab.inbox": { th: "คิวงานรอลงนาม", en: "Pending Signatures" },
  "documents.tab.my": { th: "คำร้องของฉัน", en: "My Requests" },
  "documents.tab.all": { th: "เอกสารทั้งหมด", en: "All Documents" },
  "documents.tab.types": { th: "ประเภทแบบฟอร์ม", en: "Document Types" },

  // Statuses
  "documents.status.draft": { th: "ฉบับร่าง", en: "Draft" },
  "documents.status.submitted": { th: "ยื่นคำร้องแล้ว", en: "Submitted" },
  "documents.status.in_review": { th: "กำลังพิจารณา", en: "In Review" },
  "documents.status.approved": { th: "อนุมัติแล้ว", en: "Approved" },
  "documents.status.rejected": { th: "ไม่อนุมัติ / ตีกลับ", en: "Rejected" },
  "documents.status.cancelled": { th: "ยกเลิกแล้ว", en: "Cancelled" },

  // Fields
  "documents.field.docNo": { th: "เลขที่เอกสาร", en: "Document No." },
  "documents.field.type": { th: "ประเภทเอกสาร", en: "Document Type" },
  "documents.field.title": { th: "เรื่อง / หัวข้อ", en: "Subject / Title" },
  "documents.field.content": { th: "รายละเอียดข้อความ", en: "Details" },
  "documents.field.requester": { th: "ผู้ยื่นคำร้อง", en: "Requester" },
  "documents.field.step": { th: "ขั้นตอนปัจจุบัน", en: "Current Step" },
  "documents.field.status": { th: "สถานะ", en: "Status" },
  "documents.field.createdAt": { th: "วันที่ยื่น", en: "Submitted Date" },
  "documents.field.comment": { th: "ความเห็น / หมายเหตุ", en: "Approval Comment" },

  // Buttons & Messages
  "documents.btn.create": { th: "ยื่นคำร้องใหม่", en: "New Request" },
  "documents.btn.approve": { th: "ลงนามอนุมัติ", en: "Sign & Approve" },
  "documents.btn.reject": { th: "ตีกลับ / ไม่อนุมัติ", en: "Reject" },
  "documents.btn.cancel": { th: "ยกเลิกคำร้อง", en: "Cancel Request" },
  "documents.msg.created": { th: "ยื่นคำร้องเอกสารเรียบร้อยแล้ว", en: "Document request submitted successfully" },
  "documents.msg.approved": { th: "ลงนามอนุมัติเอกสารเรียบร้อยแล้ว", en: "Document approved successfully" },
  "documents.msg.rejected": { th: "บันทึกการตีกลับเอกสารเรียบร้อยแล้ว", en: "Document rejected successfully" },
  "documents.msg.cancelled": { th: "ยกเลิกคำร้องเรียบร้อยแล้ว", en: "Document cancelled successfully" },
  "documents.msg.typeCreated": { th: "สร้างประเภทเอกสารเรียบร้อยแล้ว", en: "Document type created successfully" },
  "documents.msg.empty": { th: "ไม่มีรายการเอกสารในคิว", en: "No documents found" },

  // RBAC & Permissions Dictionary
  "roles.module.documents": { th: "ระบบบริหารจัดการและอนุมัติเอกสาร", en: "E-Documents & Approvals" },
  "perm.documents:read": { th: "ดูรายการเอกสารและคำร้อง", en: "View document requests" },
  "perm.documents:create": { th: "ยื่นคำร้องและสร้างเอกสารใหม่", en: "Submit document requests" },
  "perm.documents:approve": { th: "พิจารณาลงนามและอนุมัติเอกสาร", en: "Sign and approve documents" },
  "perm.documents:manage": { th: "จัดการประเภทเอกสารและเส้นทางอนุมัติทั้งหมด", en: "Manage document types and approval workflows" },
};
