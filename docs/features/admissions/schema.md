# Data Model & Validations: Student Admissions System
## โครงสร้างข้อมูลและข้อกำหนดความถูกต้อง

---

### 1. Prisma Models & Enums

```prisma
enum AdmissionStatus {
  DRAFT
  SUBMITTED
  DOCS_APPROVED
  DOCS_REJECTED
  INTERVIEW_ELIGIBLE
  PASSED
  REJECTED
  CANCELLED
}

model AdmissionRound {
  id               String               @id @default(uuid()) @db.Uuid
  tenantId         String               @map("tenant_id") @db.Uuid
  academicYear     Int                  @map("academic_year")
  roundName        String               @map("round_name") @db.VarChar(150)
  startDate        DateTime             @map("start_date") @db.Timestamptz()
  endDate          DateTime             @map("end_date") @db.Timestamptz()
  announcementDate DateTime?            @map("announcement_date") @db.Timestamptz()
  isActive         Boolean              @default(true) @map("is_active")
  createdAt        DateTime             @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt        DateTime             @updatedAt @map("updated_at") @db.Timestamptz()

  tenant           Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  quotas           AdmissionProgramQuota[]
  applications     StudentApplication[]

  @@map("admission_rounds")
}

model AdmissionProgramQuota {
  id           String          @id @default(uuid()) @db.Uuid
  roundId      String          @map("round_id") @db.Uuid
  programId    String          @map("program_id") @db.Uuid
  quotaSeats   Int             @map("quota_seats")
  tuitionFee   Decimal?        @map("tuition_fee") @db.Decimal(10, 2)
  criteriaTh   String?         @map("criteria_th") @db.Text
  createdAt    DateTime        @default(now()) @map("created_at") @db.Timestamptz()

  round        AdmissionRound  @relation(fields: [roundId], references: [id], onDelete: Cascade)
  program      AcademicProgram @relation(fields: [programId], references: [id], onDelete: Cascade)

  @@unique([roundId, programId])
  @@map("admission_program_quotas")
}

model StudentApplication {
  id              String          @id @default(uuid()) @db.Uuid
  tenantId        String          @map("tenant_id") @db.Uuid
  roundId         String          @map("round_id") @db.Uuid
  programId       String          @map("program_id") @db.Uuid
  applicationNo   String          @map("application_no") @db.VarChar(50)
  nationalId      String          @map("national_id") @db.VarChar(20)
  title           String?         @db.VarChar(20)
  applicantNameTh String          @map("applicant_name_th") @db.VarChar(255)
  applicantNameEn String?         @map("applicant_name_en") @db.VarChar(255)
  email           String          @db.VarChar(255)
  phone           String          @db.VarChar(50)
  schoolName      String?         @map("school_name") @db.VarChar(255)
  gpax            Float?
  /// Extra specific questions/answers
  formData        Json            @default("{}") @map("form_data") @db.JsonB
  /// [{ name: string, url: string, type: string, size?: number }]
  documents       Json            @default("[]") @db.JsonB
  status          AdmissionStatus @default(SUBMITTED)
  score           Float?
  reviewerComment String?         @map("reviewer_comment") @db.Text
  reviewedById    String?         @map("reviewed_by_id") @db.Uuid
  reviewedAt      DateTime?       @map("reviewed_at") @db.Timestamptz()
  createdAt       DateTime        @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime        @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  round           AdmissionRound  @relation(fields: [roundId], references: [id], onDelete: Cascade)
  program         AcademicProgram @relation(fields: [programId], references: [id], onDelete: Restrict)
  reviewedBy      User?           @relation(fields: [reviewedById], references: [id], onDelete: SetNull)

  @@unique([tenantId, applicationNo])
  @@unique([tenantId, roundId, programId, nationalId])
  @@index([tenantId, roundId, programId, status])
  @@map("student_applications")
}
```

---

### 2. Zod Validation Schemas

```ts
function validateThaiNationalId(id: string): boolean {
  if (id.length !== 13 || !/^[0-9]{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i)) * (13 - i);
  }
  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(id.charAt(12));
}

export const submitStudentApplicationSchema = z.object({
  roundId: z.string().uuid(),
  programId: z.string().uuid(),
  nationalId: z.string().refine(validateThaiNationalId, {
    message: "เลขประจำตัวประชาชน 13 หลักไม่ถูกต้อง",
  }),
  title: z.string().optional(),
  applicantNameTh: z.string().min(2).max(255),
  applicantNameEn: z.string().max(255).optional(),
  email: z.string().email(),
  phone: z.string().min(9).max(20),
  schoolName: z.string().max(255).optional(),
  gpax: z.number().min(0).max(4.0).optional(),
  formData: z.record(z.unknown()).optional(),
  documents: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).min(1, "ต้องแนบเอกสารประกอบการสมัครอย่างน้อย 1 รายการ"),
});
```
