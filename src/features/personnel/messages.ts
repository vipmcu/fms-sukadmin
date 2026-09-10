import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "personnel.nav": { th: "จัดการบุคลากร", en: "Personnel Directory" },
  "personnel.title": { th: "ระบบจัดการข้อมูลบุคลากร", en: "Personnel Directory" },
  "personnel.subtitle": { th: "ทำเนียบคณาจารย์และบุคลากรสายสนับสนุนประจำคณะ", en: "Faculty members and administrative support staff directory" },
  "personnel.tab.all": { th: "บุคลากรทั้งหมด", en: "All Personnel" },
  "personnel.tab.academic": { th: "สายวิชาการ (คณาจารย์)", en: "Academic Staff" },
  "personnel.tab.support": { th: "สายสนับสนุนวิชาการ", en: "Support Staff" },
  "personnel.tab.departments": { th: "ภาควิชา / สาขาวิชา", en: "Departments" },

  // Types & Positions
  "personnel.type.academic": { th: "สายวิชาการ", en: "Academic" },
  "personnel.type.support": { th: "สายสนับสนุน", en: "Support" },
  "personnel.pos.none": { th: "—", en: "—" },
  "personnel.pos.lecturer": { th: "อาจารย์", en: "Lecturer" },
  "personnel.pos.asst_prof": { th: "ผู้ช่วยศาสตราจารย์ (ผศ.)", en: "Assistant Professor" },
  "personnel.pos.assoc_prof": { th: "รองศาสตราจารย์ (รศ.)", en: "Associate Professor" },
  "personnel.pos.prof": { th: "ศาสตราจารย์ (ศ.)", en: "Professor" },

  // Fields
  "personnel.field.name": { th: "ชื่อ - นามสกุล", en: "Name - Surname" },
  "personnel.field.department": { th: "ภาควิชา / สังกัด", en: "Department" },
  "personnel.field.position": { th: "ตำแหน่งทางวิชาการ", en: "Academic Position" },
  "personnel.field.type": { th: "สายงาน", en: "Staff Type" },
  "personnel.field.email": { th: "อีเมล", en: "Email" },
  "personnel.field.phone": { th: "เบอร์โทรศัพท์ / เบอร์ภายใน", en: "Phone / Extension" },
  "personnel.field.officeRoom": { th: "ห้องพักอาจารย์", en: "Office Room" },
  "personnel.field.expertise": { th: "ความเชี่ยวชาญ", en: "Areas of Expertise" },
  "personnel.field.education": { th: "ประวัติการศึกษา", en: "Education" },
  "personnel.field.status": { th: "สถานะ", en: "Status" },

  "personnel.pos.asstProf": { th: "ผู้ช่วยศาสตราจารย์ (ผศ.)", en: "Assistant Professor" },
  "personnel.pos.assocProf": { th: "รองศาสตราจารย์ (รศ.)", en: "Associate Professor" },

  // Buttons & Messages
  "personnel.btn.create": { th: "เพิ่มบุคลากรใหม่", en: "Add Personnel" },
  "personnel.btn.edit": { th: "แก้ไขข้อมูล", en: "Edit" },
  "personnel.btn.delete": { th: "ลบ", en: "Delete" },
  "personnel.msg.created": { th: "บันทึกข้อมูลบุคลากรใหม่เรียบร้อยแล้ว", en: "Personnel created successfully" },
  "personnel.msg.updated": { th: "อัปเดตข้อมูลบุคลากรเรียบร้อยแล้ว", en: "Personnel updated successfully" },
  "personnel.msg.deleted": { th: "ลบข้อมูลบุคลากรเรียบร้อยแล้ว", en: "Personnel deleted successfully" },
  "personnel.msg.empty": { th: "ไม่พบข้อมูลบุคลากร", en: "No personnel found" },

  // RBAC & Permissions Dictionary
  "roles.module.personnel": { th: "ระบบจัดการข้อมูลบุคลากร", en: "Personnel Directory" },
  "perm.personnel:read": { th: "ดูข้อมูลบุคลากรและทำเนียบ", en: "View personnel directory" },
  "perm.personnel:create": { th: "เพิ่มข้อมูลบุคลากรใหม่", en: "Create new personnel profile" },
  "perm.personnel:edit": { th: "แก้ไขข้อมูลบุคลากร", en: "Edit personnel profile" },
  "perm.personnel:manage": { th: "จัดการข้อมูลบุคลากรและภาควิชาทั้งหมด", en: "Manage personnel and departments" },
};
