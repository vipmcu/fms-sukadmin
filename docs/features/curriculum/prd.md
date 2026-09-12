# Product Requirements Document (PRD)
## ระบบจัดการหลักสูตร (Academic Programs & Curriculum)

เอกสารนี้สะท้อนโค้ดที่ส่งแล้วใน `src/features/curriculum/` รวมงานภาควิชาในหน้าหลักสูตร

---

### 1. บทนำและวัตถุประสงค์ (Objective)

ระบบหลักสูตรเก็บโครงสร้างโปรแกรมการศึกษาระดับปริญญา/ประกาศนียบัตร แผนรายวิชา และสถานะเปิดรับสมัคร เพื่อแสดงบน Portal และป้อนข้อมูลให้โมดูลรับสมัคร

**เป้าหมายหลัก:**
1. CRUD หลักสูตร (`AcademicProgram`) สองภาษา พร้อมหน่วยกิต ระยะเวลา ค่าธรรมเนียม อาชีพที่รองรับ
2. ผูกภาควิชา (`Department`) ได้แบบ optional
3. รายวิชา (`CurriculumCourse`) จัดกลุ่มตามปี/ภาค — มี service/action แล้ว **ยังไม่มี UI หลังบ้าน**
4. หน้าบ้านแสดงเฉพาะ `isActive = true`; ปุ่มสมัครตาม `isAcceptingApplications` + `applicationLink`

---

### 2. กลุ่มผู้ใช้งานและสิทธิ์การเข้าถึง

| Persona | สิทธิ์ | หน้าจอ |
| :--- | :--- | :--- |
| **Guest** | ไม่ต้อง login | `/(portal)/programs`, `/(portal)/programs/[id]` |
| **Curriculum Viewer** | `curriculum:read` | `/(admin)/programs/manage` |
| **Curriculum Creator** | `curriculum:create` | ปุ่มเพิ่มหลักสูตร |
| **Curriculum Editor** | `curriculum:edit` | แก้หลักสูตร, API รายวิชา |
| **Curriculum Manager** | `curriculum:manage` | ลบหลักสูตร, จัดการภาควิชา |
| **Admissions consumer** | ตามโมดูลรับสมัคร | เลือกโปรแกรมที่ active |

---

### 3. ฟังก์ชันการทำงานหลัก

#### RF-01: หลักสูตร
- บังคับ: `code`, `level`, `nameTh/En`, `degreeTh/En`, `totalCredits`
- `level`: `BACHELOR` | `MASTER` | `DOCTORAL` | `CERTIFICATE`
- `@@unique([tenantId, code])`
- `departmentId` ว่างได้; ลบภาควิชาแล้ว `SetNull`
- `isActive` คุม Portal; `isAcceptingApplications` คุมป้าย/ปุ่มสมัคร
- `careerOpportunities` เป็น JSON string[]; UI รับ comma-separated
- `curriculumPdfUrl` / `applicationLink` เป็น URL หรือว่าง

#### RF-02: รายวิชา
- `code`, `nameTh/En`, `credits` (≥1), `year` 1–6, `semester` 1–3
- ลบหลักสูตร cascade รายวิชา
- `updateCourseSchema` มีแต่ **ยังไม่มี service/action อัปเดต**

#### RF-03: ภาควิชาในหน้าหลักสูตร
- กรอง ALL / ตามภาควิชา / UNASSIGNED
- Modal CRUD ภาควิชาเมื่อมี `curriculum:manage` (หรือ personnel manage ฝั่ง action)
- ลบภาควิชาไม่ได้ถ้ามีโปรแกรม/บุคลากร/ครุภัณฑ์

#### RF-04: Portal
- รายการ active + กรองระดับ/ภาควิชา/ค้นหา
- รายละเอียด: สถิติ คำอธิบาย อาชีพ รายวิชาตามปี-ภาค ลิงก์สมัครและ PDF
- หลักสูตรไม่ active → 404

ไม่มีสถานะ published แยก — ใช้ `isActive` เท่านั้น

---

### 4. ข้อกำหนดที่ไม่ใช่เชิงฟังก์ชัน

1. `tenantId` จาก session / portal tenant
2. `t("curriculum.*")` ทั้ง TH/EN
3. `@/shared/components/liyon`
4. หลัง mutation `revalidatePath("/programs")`

---

### 5. เกณฑ์การตรวจรับงาน

- [x] Guest เห็นเฉพาะหลักสูตร `isActive`
- [x] รายละเอียดหลักสูตรที่ปิดใช้งานได้ 404
- [x] สร้างหลักสูตรต้องมีรหัส ชื่อ ปริญญา หน่วยกิต
- [x] ผูก/ถอดภาควิชาได้; กรอง UNASSIGNED ได้
- [x] ผู้มี `curriculum:create` สร้างได้; `edit` แก้ได้; `manage` ลบได้
- [x] รับสมัครอ่านรายการโปรแกรม active ได้
- [ ] UI จัดการรายวิชาในหลักสูตร
- [ ] `updateCourse` service/action
