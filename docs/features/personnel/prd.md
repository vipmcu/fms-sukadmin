# Product Requirements Document (PRD)
## ระบบจัดการบุคลากร (Personnel Directory)

เอกสารนี้สะท้อนโค้ดที่ส่งแล้วใน `src/features/personnel/`

---

### 1. บทนำและวัตถุประสงค์ (Objective)

ระบบทำเนียบบุคลากรเก็บประวัติคณาจารย์และสายสนับสนุน จัดสังกัดตามภาควิชา (`Department`) และเปิดให้บุคคลภายนอกค้นหาบน Public Portal

**เป้าหมายหลัก:**
1. ทำเนียบสองภาษา แยกสายวิชาการ (`ACADEMIC`) และสายสนับสนุน (`SUPPORT`)
2. ภาควิชาเป็นหน่วยองค์กรร่วมกับหลักสูตรและครุภัณฑ์
3. หน้าบ้านแสดงเฉพาะโปรไฟล์ `isActive = true`
4. หลังบ้าน CRUD บุคลากรและสร้างภาควิชา (แก้/ลบภาควิชาอยู่ที่หน้าหลักสูตรด้วย)

---

### 2. กลุ่มผู้ใช้งานและสิทธิ์การเข้าถึง (User Personas & Roles)

| Persona / Role | คำอธิบาย | หน้าจอหลัก |
| :--- | :--- | :--- |
| **Guest** | ค้นหาบุคลากรที่เปิดใช้งาน ดูความเชี่ยวชาญ การศึกษา ผลงาน | `/(portal)/personnel`, `/(portal)/personnel/[id]` |
| **Directory Viewer** | ดูทำเนียบหลังบ้านรวมโปรไฟล์ที่ปิดใช้งาน | `/(admin)/personnel/manage` |
| **HR Officer** | เพิ่ม/แก้ไขโปรไฟล์ | หน้าเดียวกัน |
| **Personnel Manager** | ลบโปรไฟล์ สร้างภาควิชา | หน้าเดียวกัน |
| **Curriculum Manager** | แก้/ลบภาควิชาได้ด้วยสิทธิ์ `curriculum:manage` | `/(admin)/programs/manage` |

---

### 3. ฟังก์ชันการทำงานหลัก (Functional Requirements)

#### RF-01: ภาควิชา (Department)
- ฟิลด์: `code`, `nameTh`, `nameEn`, `order`
- `@@unique([tenantId, code])`
- ลบไม่ได้ถ้ามี personnel / programs / assetItems
- สร้างจากหน้าบุคลากร; แก้/ลบจากหน้าหลักสูตร
- `create/update/deleteDepartmentAction` รับ `personnel:manage` **หรือ** `curriculum:manage`

#### RF-02: โปรไฟล์บุคลากร (PersonnelProfile)
- บังคับ: `departmentId`, `prefixTh`, `firstNameTh`, `lastNameTh`
- ประเภท: `ACADEMIC` | `SUPPORT`
- ตำแหน่งทางวิชาการ: `NONE` | `LECTURER` | `ASST_PROF` | `ASSOC_PROF` | `PROF`
- อีเมลตรวจรูปแบบ Zod แต่ **ไม่ unique** ในตารางบุคลากร
- `userId` optional, `@unique` — ผูกบัญชีได้หนึ่งโปรไฟล์ต่อผู้ใช้ (UI ยังไม่เปิดฟิลด์นี้)
- `education`, `expertise`, `publications` เป็น JSON — หน้า admin ส่ง expertise เป็น comma-separated; education/publications ยังไม่อยู่ในฟอร์มแก้
- `avatarUrl` เป็น URL ภายนอก ไม่มีอัปโหลดไฟล์ในโมดูลนี้

#### RF-03: การมองเห็น
- Portal list: `isActive: true` เท่านั้น
- Portal detail: `notFound()` ถ้าไม่มีหรือไม่ active
- Admin: เห็นทุกสถานะ

#### RF-04: ผู้บริโภคข้ามโมดูล
- หลักสูตรใช้ภาควิชาจัดกลุ่มโปรแกรม
- ครุภัณฑ์เลือกผู้รับผิดชอบจากโปรไฟล์
- แจ้งซ่อมเลือกช่างจากโปรไฟล์
- Dashboard นับบุคลากรที่ active

---

### 4. ข้อกำหนดที่ไม่ใช่เชิงฟังก์ชัน

1. ทุก query กรอง `tenantId` จาก session / portal tenant
2. ข้อความ UI ผ่าน `t("personnel.*")`
3. ใช้ `@/shared/components/liyon`
4. ลบภาควิชาต้องตรวจ conflict ก่อน ไม่ cascade ทับบุคลากร (`onDelete: Restrict`)

---

### 5. เกณฑ์การตรวจรับงาน (Acceptance Criteria)

- [x] Guest เห็นเฉพาะบุคลากรที่ `isActive`
- [x] รายละเอียดคนที่ปิดใช้งานได้ 404
- [x] อีเมลไม่ถูกต้องถูก Zod ปฏิเสธ
- [x] สร้างภาควิชาได้จากหน้าบุคลากรเมื่อมี `personnel:manage`
- [x] ลบภาควิชาที่มีบุคลากร/หลักสูตร/ครุภัณฑ์ไม่ได้
- [x] ผู้มี `personnel:create` เพิ่มโปรไฟล์ได้; `personnel:edit` แก้ได้; `personnel:manage` ลบได้
- [ ] ฟอร์ม admin แก้ education / publications / ผูก `userId`
- [ ] e2e ของทำเนียบ
