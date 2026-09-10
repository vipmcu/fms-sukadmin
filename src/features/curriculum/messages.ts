import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "curriculum.nav": { th: "จัดการหลักสูตร", en: "Curriculum & Programs" },
  "curriculum.title": { th: "ระบบจัดการหลักสูตรการศึกษา", en: "Academic Programs & Curriculum" },
  "curriculum.subtitle": { th: "โครงสร้างหลักสูตร แผนการเรียน และการรับสมัครของคณะ", en: "Academic curriculum, study plans, and admissions" },
  "curriculum.tab.all": { th: "หลักสูตรทั้งหมด", en: "All Programs" },
  "curriculum.tab.bachelor": { th: "ปริญญาตรี", en: "Bachelor's Degree" },
  "curriculum.tab.master": { th: "ปริญญาโท", en: "Master's Degree" },
  "curriculum.tab.doctoral": { th: "ปริญญาเอก", en: "Doctoral Degree" },

  // Levels
  "curriculum.level.bachelor": { th: "ปริญญาตรี", en: "Bachelor's Degree" },
  "curriculum.level.master": { th: "ปริญญาโท", en: "Master's Degree" },
  "curriculum.level.doctoral": { th: "ปริญญาเอก", en: "Doctoral Degree" },
  "curriculum.level.certificate": { th: "ประกาศนียบัตร", en: "Certificate" },

  // Fields
  "curriculum.field.code": { th: "รหัสหลักสูตร", en: "Program Code" },
  "curriculum.field.nameTh": { th: "ชื่อหลักสูตร (ภาษาไทย)", en: "Program Name (Thai)" },
  "curriculum.field.nameEn": { th: "ชื่อหลักสูตร (ภาษาอังกฤษ)", en: "Program Name (English)" },
  "curriculum.field.degreeTh": { th: "ชื่อปริญญา (ไทย)", en: "Degree Title (Thai)" },
  "curriculum.field.degreeEn": { th: "ชื่อปริญญา (อังกฤษ)", en: "Degree Title (English)" },
  "curriculum.field.level": { th: "ระดับการศึกษา", en: "Degree Level" },
  "curriculum.field.credits": { th: "หน่วยกิตรวม", en: "Total Credits" },
  "curriculum.field.duration": { th: "ระยะเวลาศึกษา (ปี)", en: "Duration (Years)" },
  "curriculum.field.tuition": { th: "ค่าธรรมเนียมต่อภาคการศึกษา (บาท)", en: "Tuition Fee / Term (THB)" },
  "curriculum.field.accepting": { th: "สถานะเปิดรับสมัคร", en: "Admissions Status" },
  "curriculum.field.careers": { th: "โอกาสทางวิชาชีพ / อาชีพที่รองรับ", en: "Career Opportunities" },

  // Buttons & Messages
  "curriculum.btn.create": { th: "เพิ่มหลักสูตรใหม่", en: "Add Program" },
  "curriculum.btn.edit": { th: "แก้ไข", en: "Edit" },
  "curriculum.btn.delete": { th: "ลบ", en: "Delete" },
  "curriculum.msg.created": { th: "บันทึกหลักสูตรใหม่เรียบร้อยแล้ว", en: "Program created successfully" },
  "curriculum.msg.updated": { th: "อัปเดตข้อมูลหลักสูตรเรียบร้อยแล้ว", en: "Program updated successfully" },
  "curriculum.msg.deleted": { th: "ลบหลักสูตรเรียบร้อยแล้ว", en: "Program deleted successfully" },
  "curriculum.msg.empty": { th: "ไม่พบข้อมูลหลักสูตร", en: "No programs found" },

  // RBAC & Permissions Dictionary
  "roles.module.curriculum": { th: "ระบบจัดการหลักสูตรการศึกษา", en: "Academic Programs & Curriculum" },
  "perm.curriculum:read": { th: "ดูข้อมูลหลักสูตรและแผนการศึกษา", en: "View curriculum and study plans" },
  "perm.curriculum:create": { th: "สร้างหลักสูตรใหม่", en: "Create new academic program" },
  "perm.curriculum:edit": { th: "แก้ไขข้อมูลหลักสูตรและรายวิชา", en: "Edit program and courses" },
  "perm.curriculum:manage": { th: "จัดการหลักสูตรและสถานะรับสมัครทั้งหมด", en: "Manage programs and admission status" },
};
