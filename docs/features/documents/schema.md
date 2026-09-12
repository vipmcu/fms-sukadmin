# Data Model, Schemas & Dictionary
## ระบบบริหารจัดการและอนุมัติเอกสาร (E-Documents & Approvals)

---

### 1. Prisma Data Models & Enums

```prisma
enum DocumentStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  APPROVED
  REJECTED
  CANCELLED
}

model DocumentType {
  id             String   @id @default(uuid()) @db.Uuid
  tenantId       String   @map("tenant_id") @db.Uuid
  code           String   @db.VarChar(50)
  nameTh         String   @map("name_th") @db.VarChar(255)
  nameEn         String   @map("name_en") @db.VarChar(255)
  descriptionTh  String?  @map("description_th") @db.Text
  /// [{ name: string, labelTh: string, type: "text"|"number"|"date"|"file", required: boolean }]
  requiredFields Json     @default("[]") @map("required_fields") @db.JsonB
  isActive       Boolean  @default(true) @map("is_active")
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt      DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant   Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  requests DocumentRequest[]

  @@unique([tenantId, code])
  @@map("document_types")
}

model DocumentRequest {
  id                  String         @id @default(uuid()) @db.Uuid
  tenantId            String         @map("tenant_id") @db.Uuid
  documentNo          String         @map("document_no") @db.VarChar(50)
  typeId              String         @map("type_id") @db.Uuid
  title               String         @db.VarChar(500)
  content             String         @db.Text
  metadata            Json           @default("{}") @db.JsonB
  /// [{ name: string, url: string, size?: number }]
  attachments         Json           @default("[]") @db.JsonB
  status              DocumentStatus @default(DRAFT)
  requesterId         String         @map("requester_id") @db.Uuid
  currentStep         Int            @default(1) @map("current_step")
  totalSteps          Int            @default(2) @map("total_steps")
  currentApproverRole String?        @map("current_approver_role") @db.VarChar(50)
  finalApprovedAt     DateTime?      @map("final_approved_at") @db.Timestamptz()
  rejectedAt          DateTime?      @map("rejected_at") @db.Timestamptz()
  rejectionReason     String?        @map("rejection_reason") @db.Text
  createdAt           DateTime       @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt           DateTime       @updatedAt @map("updated_at") @db.Timestamptz()

  tenant        Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  type          DocumentType           @relation(fields: [typeId], references: [id], onDelete: Restrict)
  requester     User                   @relation("DocumentRequester", fields: [requesterId], references: [id], onDelete: Restrict)
  approvalSteps DocumentApprovalStep[]

  @@unique([tenantId, documentNo])
  @@index([tenantId, status, requesterId])
  @@map("document_requests")
}

model DocumentApprovalStep {
  id           String         @id @default(uuid()) @db.Uuid
  documentId   String         @map("document_id") @db.Uuid
  stepNumber   Int            @map("step_number")
  approverRole String         @map("approver_role") @db.VarChar(50)
  approverId   String?        @map("approver_id") @db.Uuid
  status       DocumentStatus @default(SUBMITTED)
  comment      String?        @db.Text
  signatureUrl String?        @map("signature_url") @db.VarChar(500)
  actionAt     DateTime?      @map("action_at") @db.Timestamptz()
  createdAt    DateTime       @default(now()) @map("created_at") @db.Timestamptz()

  document DocumentRequest @relation(fields: [documentId], references: [id], onDelete: Cascade)
  approver User?           @relation("DocumentApprover", fields: [approverId], references: [id], onDelete: SetNull)

  @@unique([documentId, stepNumber])
  @@map("document_approval_steps")
}
```

`DocumentApprovalStep` ไม่มี `tenantId` ของตัวเอง — ขอบเขตผ่าน `documentId`

---

### 2. Zod Validation Schemas

```ts
documentStatusEnum = z.enum([
  "DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED", "CANCELLED",
])

createDocumentTypeSchema = {
  code: min 2 max 50,
  nameTh / nameEn: min 1 max 255,
  descriptionTh: optional,
  requiredFields: record[] default [],
  isActive: boolean default true,
}
updateDocumentTypeSchema = createDocumentTypeSchema + { id: uuid }

createDocumentRequestSchema = {
  typeId: uuid,
  title: min 1 max 500,
  content: min 1,
  metadata: record default {},
  attachments: record[] default [],
  totalSteps: int min 1 default 2,
  currentApproverRole: max 50 default "DEPT_HEAD",
}

approveDocumentStepSchema = {
  documentId: uuid,
  comment: optional,
  signatureUrl: url or "",
}

rejectDocumentStepSchema = {
  documentId: uuid,
  rejectionReason: min 1,
}

cancelDocumentRequestSchema = { id: uuid }
```

---

### 3. คีย์คำแปลใน `messages.ts`

| Key | th | en |
| :--- | :--- | :--- |
| `documents.nav` | จัดการเอกสารและอนุมัติ | E-Documents & Approvals |
| `documents.title` | ระบบบริหารจัดการและอนุมัติเอกสาร | E-Documents & Approvals |
| `documents.subtitle` | ยื่นคำร้อง ติดตามสถานะ และดำเนินการลงนามอนุมัติเอกสารอิเล็กทรอนิกส์ | Submit requests, track status, and approve e-documents |
| `documents.tab.inbox` | คิวงานรอลงนาม | Pending Signatures |
| `documents.tab.my` | คำร้องของฉัน | My Requests |
| `documents.tab.all` | เอกสารทั้งหมด | All Documents |
| `documents.tab.types` | ประเภทแบบฟอร์ม | Document Types |
| `documents.status.draft` | ฉบับร่าง | Draft |
| `documents.status.submitted` | ยื่นคำร้องแล้ว | Submitted |
| `documents.status.in_review` | กำลังพิจารณา | In Review |
| `documents.status.approved` | อนุมัติแล้ว | Approved |
| `documents.status.rejected` | ไม่อนุมัติ / ตีกลับ | Rejected |
| `documents.status.cancelled` | ยกเลิกแล้ว | Cancelled |
| `documents.field.docNo` | เลขที่เอกสาร | Document No. |
| `documents.field.type` | ประเภทเอกสาร | Document Type |
| `documents.field.title` | เรื่อง / หัวข้อ | Subject / Title |
| `documents.field.content` | รายละเอียดข้อความ | Details |
| `documents.field.requester` | ผู้ยื่นคำร้อง | Requester |
| `documents.field.step` | ขั้นตอนปัจจุบัน | Current Step |
| `documents.field.status` | สถานะ | Status |
| `documents.field.createdAt` | วันที่ยื่น | Submitted Date |
| `documents.field.comment` | ความเห็น / หมายเหตุ | Approval Comment |
| `documents.btn.create` | ยื่นคำร้องใหม่ | New Request |
| `documents.btn.approve` | ลงนามอนุมัติ | Sign & Approve |
| `documents.btn.reject` | ตีกลับ / ไม่อนุมัติ | Reject |
| `documents.btn.cancel` | ยกเลิกคำร้อง | Cancel Request |
| `documents.msg.created` | ยื่นคำร้องเอกสารเรียบร้อยแล้ว | Document request submitted successfully |
| `documents.msg.approved` | ลงนามอนุมัติเอกสารเรียบร้อยแล้ว | Document approved successfully |
| `documents.msg.rejected` | บันทึกการตีกลับเอกสารเรียบร้อยแล้ว | Document rejected successfully |
| `documents.msg.cancelled` | ยกเลิกคำร้องเรียบร้อยแล้ว | Document cancelled successfully |
| `documents.msg.typeCreated` | สร้างประเภทเอกสารเรียบร้อยแล้ว | Document type created successfully |
| `documents.msg.empty` | ไม่มีรายการเอกสารในคิว | No documents found |
| `roles.module.documents` | ระบบบริหารจัดการและอนุมัติเอกสาร | E-Documents & Approvals |
| `perm.documents:read` | ดูรายการเอกสารและคำร้อง | View document requests |
| `perm.documents:create` | ยื่นคำร้องและสร้างเอกสารใหม่ | Submit document requests |
| `perm.documents:approve` | พิจารณาลงนามและอนุมัติเอกสาร | Sign and approve documents |
| `perm.documents:manage` | จัดการประเภทเอกสารและเส้นทางอนุมัติทั้งหมด | Manage document types and approval workflows |
