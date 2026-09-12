# Data Model, Schemas & Dictionary
## ระบบจัดการหลักสูตร (Academic Programs & Curriculum)

---

### 1. Prisma Data Models & Enums

`Department` อยู่ในโมดูลบุคลากร ดู `docs/features/personnel/schema.md`

```prisma
enum DegreeLevel {
  BACHELOR
  MASTER
  DOCTORAL
  CERTIFICATE
}

model AcademicProgram {
  id                      String      @id @default(uuid()) @db.Uuid
  tenantId                String      @map("tenant_id") @db.Uuid
  code                    String      @db.VarChar(50)
  level                   DegreeLevel
  nameTh                  String      @map("name_th") @db.VarChar(255)
  nameEn                  String      @map("name_en") @db.VarChar(255)
  degreeTh                String      @map("degree_th") @db.VarChar(255)
  degreeEn                String      @map("degree_en") @db.VarChar(255)
  departmentId            String?     @map("department_id") @db.Uuid
  totalCredits            Int         @map("total_credits")
  durationYears           Float       @default(4.0) @map("duration_years")
  tuitionFeePerTerm       Float?      @map("tuition_fee_per_term")
  descriptionTh           String?     @map("description_th") @db.Text
  descriptionEn           String?     @map("description_en") @db.Text
  /// string[]
  careerOpportunities     Json        @default("[]") @map("career_opportunities") @db.JsonB
  curriculumPdfUrl        String?     @map("curriculum_pdf_url") @db.VarChar(500)
  isAcceptingApplications Boolean     @default(true) @map("is_accepting_applications")
  applicationLink         String?     @map("application_link") @db.VarChar(500)
  isActive                Boolean     @default(true) @map("is_active")
  order                   Int         @default(0)
  createdAt               DateTime    @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt               DateTime    @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant                  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  department      Department?             @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  courses         CurriculumCourse[]
  admissionQuotas AdmissionProgramQuota[]
  applications    StudentApplication[]

  @@unique([tenantId, code])
  @@index([tenantId, level, isActive])
  @@map("academic_programs")
}

model CurriculumCourse {
  id        String   @id @default(uuid()) @db.Uuid
  programId String   @map("program_id") @db.Uuid
  code      String   @db.VarChar(50)
  nameTh    String   @map("name_th") @db.VarChar(255)
  nameEn    String   @map("name_en") @db.VarChar(255)
  credits   Int
  year      Int
  semester  Int
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()

  program AcademicProgram @relation(fields: [programId], references: [id], onDelete: Cascade)

  @@index([programId, year, semester])
  @@map("curriculum_courses")
}
```

หมายเหตุ: `CurriculumCourse` ไม่มี `tenantId` ของตัวเอง — ขอบเขตผ่าน `programId`

---

### 2. Zod Validation Schemas

```ts
degreeLevelEnum = z.enum(["BACHELOR", "MASTER", "DOCTORAL", "CERTIFICATE"])

createProgramSchema = {
  code: min 2 max 50,
  level: degreeLevelEnum,
  nameTh/nameEn/degreeTh/degreeEn: min 1 max 255,
  departmentId: uuid optional nullable,
  totalCredits: int min 1,
  durationYears: number min 0.5 default 4,
  tuitionFeePerTerm: number min 0 optional,
  descriptionTh/En: optional,
  careerOpportunities: string[] default [],
  curriculumPdfUrl / applicationLink: url or "",
  isAcceptingApplications: boolean default true,
  isActive: boolean default true,
  order: int default 0,
}
updateProgramSchema = createProgramSchema + { id: uuid }

createCourseSchema = {
  programId: uuid,
  code: min 2 max 50,
  nameTh/nameEn: min 1 max 255,
  credits: int min 1,
  year: int 1-6,
  semester: int 1-3,
}
updateCourseSchema = createCourseSchema + { id: uuid } // ยังไม่มี service
```

---

### 3. คีย์คำแปลใน `messages.ts`

| Key | th | en |
| :--- | :--- | :--- |
| `curriculum.nav` | จัดการหลักสูตร | Curriculum & Programs |
| `curriculum.title` | ระบบจัดการหลักสูตรการศึกษา | Academic Programs & Curriculum |
| `curriculum.subtitle` | โครงสร้างหลักสูตร แผนการเรียน และการรับสมัครของคณะ | Academic curriculum, study plans, and admissions |
| `curriculum.tab.all` | หลักสูตรทั้งหมด | All Programs |
| `curriculum.tab.bachelor` | ปริญญาตรี | Bachelor's Degree |
| `curriculum.tab.master` | ปริญญาโท | Master's Degree |
| `curriculum.tab.doctoral` | ปริญญาเอก | Doctoral Degree |
| `curriculum.level.bachelor` | ปริญญาตรี | Bachelor's Degree |
| `curriculum.level.master` | ปริญญาโท | Master's Degree |
| `curriculum.level.doctoral` | ปริญญาเอก | Doctoral Degree |
| `curriculum.level.certificate` | ประกาศนียบัตร | Certificate |
| `curriculum.field.code` | รหัสหลักสูตร | Program Code |
| `curriculum.field.nameTh` | ชื่อหลักสูตร (ภาษาไทย) | Program Name (Thai) |
| `curriculum.field.nameEn` | ชื่อหลักสูตร (ภาษาอังกฤษ) | Program Name (English) |
| `curriculum.field.degreeTh` | ชื่อปริญญา (ไทย) | Degree Title (Thai) |
| `curriculum.field.degreeEn` | ชื่อปริญญา (อังกฤษ) | Degree Title (English) |
| `curriculum.field.level` | ระดับการศึกษา | Degree Level |
| `curriculum.field.credits` | หน่วยกิตรวม | Total Credits |
| `curriculum.field.duration` | ระยะเวลาศึกษา (ปี) | Duration (Years) |
| `curriculum.field.tuition` | ค่าธรรมเนียมต่อภาคการศึกษา (บาท) | Tuition Fee / Term (THB) |
| `curriculum.field.accepting` | สถานะเปิดรับสมัคร | Admissions Status |
| `curriculum.field.careers` | โอกาสทางวิชาชีพ / อาชีพที่รองรับ | Career Opportunities |
| `curriculum.btn.create` | เพิ่มหลักสูตรใหม่ | Add Program |
| `curriculum.btn.edit` | แก้ไข | Edit |
| `curriculum.btn.delete` | ลบ | Delete |
| `curriculum.msg.created` | บันทึกหลักสูตรใหม่เรียบร้อยแล้ว | Program created successfully |
| `curriculum.msg.updated` | อัปเดตข้อมูลหลักสูตรเรียบร้อยแล้ว | Program updated successfully |
| `curriculum.msg.deleted` | ลบหลักสูตรเรียบร้อยแล้ว | Program deleted successfully |
| `curriculum.msg.empty` | ไม่พบข้อมูลหลักสูตร | No programs found |
| `roles.module.curriculum` | ระบบจัดการหลักสูตรการศึกษา | Academic Programs & Curriculum |
| `perm.curriculum:read` | ดูข้อมูลหลักสูตรและแผนการศึกษา | View curriculum and study plans |
| `perm.curriculum:create` | สร้างหลักสูตรใหม่ | Create new academic program |
| `perm.curriculum:edit` | แก้ไขข้อมูลหลักสูตรและรายวิชา | Edit program and courses |
| `perm.curriculum:manage` | จัดการหลักสูตรและสถานะรับสมัครทั้งหมด | Manage programs and admission status |
