import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "admissions.nav": { th: "รับสมัครนิสิตใหม่", en: "Student Admissions" },
  "admissions.title": { th: "ระบบรับสมัครนิสิตใหม่", en: "Student Admissions System" },
  "admissions.subtitle": { th: "ยื่นใบสมัครออนไลน์ ตรวจคุณสมบัติ และติดตามผลการคัดเลือก", en: "Online application, qualifications review, and admission results tracking" },

  // Statuses
  "admissions.status.draft": { th: "ฉบับร่าง", en: "Draft" },
  "admissions.status.submitted": { th: "ยื่นใบสมัครแล้ว", en: "Submitted" },
  "admissions.status.docs_approved": { th: "เอกสารผ่านการตรวจสอบ", en: "Documents Verified" },
  "admissions.status.docs_rejected": { th: "เอกสารไม่ผ่าน / รอแก้ไข", en: "Documents Rejected" },
  "admissions.status.interview_eligible": { th: "มีสิทธิ์เข้าสอบสัมภาษณ์", en: "Eligible for Interview" },
  "admissions.status.passed": { th: "ผ่านการคัดเลือกตัวจริง", en: "Admitted" },
  "admissions.status.rejected": { th: "ไม่ผ่านการคัดเลือก", en: "Not Admitted" },
  "admissions.status.cancelled": { th: "ยกเลิกใบสมัคร", en: "Cancelled" },

  // Fields
  "admissions.field.applicationNo": { th: "เลขที่ใบสมัคร", en: "Application No." },
  "admissions.field.round": { th: "รอบการรับสมัคร", en: "Admission Round" },
  "admissions.field.program": { th: "หลักสูตรที่สมัคร", en: "Program" },
  "admissions.field.nationalId": { th: "เลขประจำตัวประชาชน / Passport", en: "National ID / Passport" },
  "admissions.field.applicantName": { th: "ชื่อ-นามสกุล ผู้สมัคร", en: "Applicant Name" },
  "admissions.field.email": { th: "อีเมล", en: "Email" },
  "admissions.field.phone": { th: "เบอร์โทรศัพท์ติดต่อ", en: "Phone Number" },
  "admissions.field.schoolName": { th: "สถาบันการศึกษาเดิม", en: "School / Previous University" },
  "admissions.field.gpax": { th: "ผลการเรียนเฉลี่ยสะสม (GPAX)", en: "GPAX" },
  "admissions.field.score": { th: "คะแนนการประเมิน", en: "Score" },
  "admissions.field.comment": { th: "ความเห็นกรรมการ / ข้อเสนอแนะ", en: "Reviewer Comment" },
  "admissions.field.documents": { th: "เอกสารประกอบการสมัคร", en: "Attached Documents" },

  // Buttons & Actions
  "admissions.btn.apply": { th: "สมัครเรียนออนไลน์", en: "Apply Now" },
  "admissions.btn.submit": { th: "ส่งใบสมัคร", en: "Submit Application" },
  "admissions.btn.track": { th: "ตรวจสอบสถานะใบสมัคร", en: "Track Application" },
  "admissions.btn.createRound": { th: "สร้างรอบรับสมัครใหม่", en: "Create Round" },
  "admissions.btn.review": { th: "ตรวจเอกสาร / ให้คะแนน", en: "Review & Score" },
  "admissions.btn.export": { th: "ส่งออกข้อมูล (CSV)", en: "Export CSV" },

  // Messages
  "admissions.msg.submitted": { th: "ยื่นใบสมัครออนไลน์เรียบร้อยแล้ว กรุณาจดจำเลขที่ใบสมัครเพื่อติดตามผล", en: "Application submitted successfully. Please save your application number." },
  "admissions.msg.reviewed": { th: "บันทึกผลการตรวจสอบและคะแนนเรียบร้อยแล้ว", en: "Review result and score saved" },
  "admissions.msg.roundCreated": { th: "สร้างรอบการรับสมัครสำเร็จ", en: "Admission round created" },
  "admissions.msg.empty": { th: "ไม่พบข้อมูลใบสมัคร", en: "No applications found" },
  "admissions.msg.emptyRounds": { th: "ขณะนี้ยังไม่มีรอบการรับสมัครที่เปิดรับ", en: "No open admission rounds available at this time" },

  // RBAC & Permissions Dictionary
  "roles.module.admissions": { th: "ระบบรับสมัครนิสิตใหม่", en: "Student Admissions" },
  "perm.admissions:read": { th: "ดูข้อมูลรอบรับสมัครและรายชื่อผู้สมัคร", en: "View admission rounds and applications" },
  "perm.admissions:create": { th: "ยื่นใบสมัครออนไลน์", en: "Submit online application" },
  "perm.admissions:review": { th: "ตรวจคุณสมบัติและหลักฐานเอกสารผู้สมัคร", en: "Review applicant qualifications and documents" },
  "perm.admissions:score": { th: "บันทึกคะแนนสัมภาษณ์และตัดสินผลการคัดเลือก", en: "Score interviews and admit applicants" },
  "perm.admissions:export": { th: "ส่งออกรายชื่อผู้สมัครเป็นไฟล์ CSV/Excel", en: "Export applicant lists to CSV/Excel" },
  "perm.admissions:manage": { th: "จัดการรอบการรับสมัครและโควตาที่นั่ง", en: "Manage admission rounds and quotas" },
};
