# Technical Architecture & System Flow
## ระบบบริหารจัดการและอนุมัติเอกสาร (E-Documents & Approvals)

---

### 1. สถาปัตยกรรมระดับโมดูล

```
src/features/documents/
├── index.ts
├── server.ts
├── actions.ts
├── permissions.ts
├── messages.ts
└── _internal/
    ├── actions.ts
    ├── services.ts
    ├── validations.ts
    ├── validations.test.ts
    ├── workflow.ts
    └── workflow.test.ts
```

---

### 2. แผนผังสถานะคำร้อง (DocumentStatus)

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED: ยื่นคำร้อง (create)
    SUBMITTED --> IN_REVIEW: อนุมัติขั้นไม่สุดท้าย
    IN_REVIEW --> IN_REVIEW: อนุมัติขั้นกลางถัดไป
    SUBMITTED --> APPROVED: อนุมัติขั้นสุดท้าย เมื่อ totalSteps = 1
    IN_REVIEW --> APPROVED: อนุมัติขั้นสุดท้าย
    SUBMITTED --> REJECTED: ปฏิเสธ
    IN_REVIEW --> REJECTED: ปฏิเสธ
    SUBMITTED --> CANCELLED: ผู้ยื่นยกเลิก
    DRAFT --> CANCELLED: service ยอม (create ไม่สร้าง DRAFT)
```

**กฎจาก `workflow.ts`:**
1. `canReviewDocument` = `SUBMITTED` หรือ `IN_REVIEW`
2. `canCancelDocument` = `SUBMITTED` เท่านั้น
3. `calculateApprovalTransition`: ถ้า `currentStep >= totalSteps` → `APPROVED` + `nextRole = null`; ไม่เช่นนั้น → `IN_REVIEW`, `nextStep + 1`, `nextRole = "DEAN"`

---

### 3. ผังเส้นทางหน้าจอ

#### หลังบ้าน
- `/(admin)/documents` — ต้อง `documents:read`
- `src/app/(admin)/documents/_components/documents-admin-client.tsx`

#### หน้าบ้าน
- ไม่มี route ใต้ `(portal)`

---

### 4. Data Flow

```mermaid
flowchart TD
  Staff --> Auth[requirePermission]
  Auth --> Page["/documents"]
  Page --> Create[createDocumentRequest]
  Page --> Approve[approveDocumentStep]
  Page --> Reject[rejectDocumentStep]
  Page --> Cancel[cancelDocumentRequest]
  Create --> Workflow[workflow helpers]
  Approve --> Workflow
  Workflow --> Prisma[(document_requests / approval_steps)]
  Create --> Audit[audit_logs]
```

---

### 5. ทะเบียนสิทธิ์

```ts
export const DOCUMENTS_P = {
  read: "documents:read",
  create: "documents:create",
  approve: "documents:approve",
  manage: "documents:manage",
} as const;
```

ลงทะเบียนใน `src/permissions.ts` ผ่าน `DOCUMENTS_PERMISSIONS`
