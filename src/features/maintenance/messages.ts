import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "maintenance.nav": { th: "แจ้งซ่อมบำรุง", en: "Maintenance" },
  "maintenance.title": { th: "ระบบแจ้งซ่อมและบริการออนไลน์", en: "Maintenance & Service Desk" },
  "maintenance.subtitle": { th: "แจ้งปัญหาอาคารสถานที่ โสตทัศนูปกรณ์ และติดตามงานซ่อมตาม SLA", en: "Service requests, facility & IT maintenance, and SLA tracking" },

  // Statuses
  "maintenance.status.open": { th: "รอรับเรื่อง", en: "Open" },
  "maintenance.status.assigned": { th: "มอบหมายช่างแล้ว", en: "Assigned" },
  "maintenance.status.in_progress": { th: "กำลังดำเนินการ", en: "In Progress" },
  "maintenance.status.waiting_parts": { th: "รออะไหล่/จัดซื้อ", en: "Waiting for Parts" },
  "maintenance.status.resolved": { th: "เสร็จสิ้น", en: "Resolved" },
  "maintenance.status.cancelled": { th: "ยกเลิกคำร้อง", en: "Cancelled" },

  // Priorities
  "maintenance.priority.low": { th: "ทั่วไป (7 วัน)", en: "Low (7 days)" },
  "maintenance.priority.medium": { th: "ปานกลาง (3 วัน)", en: "Medium (3 days)" },
  "maintenance.priority.high": { th: "ด่วน (1 วัน)", en: "High (24 hours)" },
  "maintenance.priority.critical": { th: "ด่วนที่สุด (2 ชม.)", en: "Critical (2 hours)" },

  // Fields
  "maintenance.field.ticketNo": { th: "หมายเลขแจ้งซ่อม", en: "Ticket No." },
  "maintenance.field.category": { th: "หมวดหมู่งานบริการ", en: "Category" },
  "maintenance.field.title": { th: "หัวข้อปัญหา / อาการชำรุด", en: "Title / Issue" },
  "maintenance.field.description": { th: "รายละเอียดปัญหา", en: "Description" },
  "maintenance.field.location": { th: "สถานที่เกิดเหตุ / ห้อง", en: "Location" },
  "maintenance.field.priority": { th: "ระดับความเร่งด่วน", en: "Priority" },
  "maintenance.field.requesterName": { th: "ชื่อผู้แจ้ง", en: "Requester Name" },
  "maintenance.field.requesterEmail": { th: "อีเมลผู้แจ้ง", en: "Requester Email" },
  "maintenance.field.requesterPhone": { th: "เบอร์โทรศัพท์ผู้แจ้ง", en: "Requester Phone" },
  "maintenance.field.technician": { th: "ช่างผู้รับผิดชอบ", en: "Assigned Technician" },
  "maintenance.field.slaDeadline": { th: "กำหนดเสร็จตาม SLA", en: "SLA Deadline" },
  "maintenance.field.resolutionNotes": { th: "บันทึกผลการซ่อม / แนวทางแก้ไข", en: "Resolution Notes" },
  "maintenance.field.partsCost": { th: "ค่าใช้จ่ายอะไหล่ (บาท)", en: "Parts Cost (THB)" },

  // Actions
  "maintenance.btn.newTicket": { th: "แจ้งซ่อม / ขอใช้บริการ", en: "Submit Request" },
  "maintenance.btn.assign": { th: "จ่ายงานให้ช่าง", en: "Assign Technician" },
  "maintenance.btn.resolve": { th: "บันทึกปิดงานซ่อม", en: "Resolve & Close" },
  "maintenance.btn.rate": { th: "ประเมินความพึงพอใจ", en: "Submit Rating" },
  "maintenance.btn.track": { th: "ค้นหาสถานะคำร้อง", en: "Track Ticket" },

  // Messages
  "maintenance.msg.created": { th: "ส่งคำร้องแจ้งซ่อมเรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการตาม SLA", en: "Maintenance ticket submitted successfully" },
  "maintenance.msg.assigned": { th: "จ่ายงานให้นายช่างเรียบร้อยแล้ว", en: "Ticket assigned to technician" },
  "maintenance.msg.resolved": { th: "ปิดงานซ่อมเรียบร้อยแล้ว", en: "Ticket resolved successfully" },
  "maintenance.msg.rated": { th: "ขอบคุณสำหรับการประเมินความพึงพอใจ", en: "Thank you for your rating" },
  "maintenance.msg.empty": { th: "ไม่พบข้อมูลรายการแจ้งซ่อม", en: "No service tickets found" },

  // RBAC & Permissions Dictionary
  "roles.module.maintenance": { th: "ระบบแจ้งซ่อมและบริการออนไลน์", en: "Maintenance & Service Desk" },
  "perm.maintenance:read": { th: "ดูรายการใบแจ้งซ่อมและสถานะงาน", en: "View service tickets and statuses" },
  "perm.maintenance:create": { th: "สร้างใบแจ้งซ่อมหรือคำขอใช้บริการ", en: "Create service and maintenance tickets" },
  "perm.maintenance:assign": { th: "จ่ายงานและมอบหมายช่างผู้รับผิดชอบ", en: "Assign tickets to technicians" },
  "perm.maintenance:resolve": { th: "บันทึกผลการซ่อมและปิดงานซ่อม", en: "Resolve and close service tickets" },
  "perm.maintenance:manage": { th: "จัดการหมวดหมู่งานบริการและเกณฑ์ SLA", en: "Manage service categories and SLA rules" },
};
