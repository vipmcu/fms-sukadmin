# Product Requirements Document (PRD)
## ระบบบริหารจัดการและอนุมัติเอกสาร (E-Documents & Approvals)

เอกสารนี้สะท้อนโค้ดที่ส่งแล้วใน `src/features/documents/` — **ไม่มีหน้า Portal**

---

### 1. บทนำและวัตถุประสงค์ (Objective)

ระบบเอกสารอิเล็กทรอนิกส์ให้บุคลากรยื่นคำร้อง ติดตามสถานะ และให้ผู้อนุมัติลงนามหลายขั้นตอนภายใน Admin Console

**เป้าหมายหลัก:**
1. จัดการประเภทเอกสาร (`DocumentType`) ต่อ tenant
2. ยื่นคำร้องแล้วได้เลขที่ `DOC-{YYYYMM}-{NNNN}` สถานะเริ่มต้น `SUBMITTED`
3. อนุมัติทีละขั้นจนครบ `totalSteps` (1–3) แล้วเป็น `APPROVED` หรือปฏิเสธเป็น `REJECTED`
4. ผู้ยื่นยกเลิกคำร้องของตนเองได้เมื่อยังเป็น `SUBMITTED`
5. บันทึก audit `document.create` / `document.approve_step` / `document.reject_step`

---

### 2. กลุ่มผู้ใช้งานและสิทธิ์การเข้าถึง

| Persona | สิทธิ์ | หน้าจอ |
| :--- | :--- | :--- |
| **Viewer** | `documents:read` | `/(admin)/documents` |
| **Requester** | `documents:create` | ยื่นคำร้อง, ยกเลิกของตนเอง |
| **Approver** | `documents:approve` | ลงนาม / ตีกลับ |
| **Type admin** | `documents:manage` | สร้างประเภทเอกสาร |

บทบาทบนเส้นทางอนุมัติ (`DEPT_HEAD`, `DEAN`) เป็นข้อมูลสตริงในเรคคอร์ด **ไม่ผูกกับ RBAC จริง** — ผู้มี `documents:approve` อนุมัติขั้นใดก็ได้

---

### 3. ฟังก์ชันการทำงานหลัก

#### RF-01: ประเภทเอกสาร
- `code`, `nameTh`, `nameEn`, `descriptionTh?`, `requiredFields` JSON, `isActive`
- `@@unique([tenantId, code])`
- อัปเดตมี action แต่ **ยังไม่มี UI**
- UI ยังไม่เรนเดอร์ `requiredFields` เป็นฟอร์มไดนามิก

#### RF-02: ยื่นคำร้อง
- บังคับ: `typeId`, `title`, `content`
- `totalSteps` ค่าเริ่มต้น 2 เลือกได้ 1–3
- `currentApproverRole` ค่าเริ่มต้น `"DEPT_HEAD"`
- `attachments` / `metadata` schema พร้อม UI ส่งค่าว่าง
- สถานะ `DRAFT` มีใน enum แต่ **create ไม่ใช้** — ยื่นแล้วเป็น `SUBMITTED` ทันที

#### RF-03: อนุมัติหลายขั้น
- พิจารณาได้เมื่อ `SUBMITTED` หรือ `IN_REVIEW`
- ขั้นที่ไม่สุดท้าย → `IN_REVIEW`, `currentStep + 1`, `currentApproverRole = "DEAN"` (hardcode)
- ขั้นสุดท้าย → `APPROVED`, ตั้ง `finalApprovedAt`
- ปฏิเสธต้องมี `rejectionReason` → `REJECTED`
- ขั้นถูก upsert ตาม `stepNumber` ไม่สร้างล่วงหน้าตอนยื่น

#### RF-04: ยกเลิก
- UI และ `canCancelDocument`: เฉพาะ `SUBMITTED` และเป็นผู้ยื่น
- Service ยังยอม `DRAFT` ด้วย — ไม่สอดคล้องกับ helper

#### RF-05: หน้าจอ
- แท็บ client-side: ทั้งหมด / กล่องรออนุมัติ / ของฉัน / อนุมัติแล้ว / ตีกลับ
- ไม่มี portal ให้บุคคลภายนอกยื่นหรือติดตาม

---

### 4. ข้อกำหนดที่ไม่ใช่เชิงฟังก์ชัน

1. `tenantId` และ `requesterId` จาก session
2. `t("documents.*")` ทั้ง TH/EN
3. `@/shared/components/liyon`
4. Mutation สำคัญเรียก `writeAudit` ในทรานแซกชันเดียวกับข้อมูลเอกสาร
5. `revalidatePath("/documents")`

---

### 5. เกณฑ์การตรวจรับงาน

- [x] ยื่นคำร้องได้เลขที่รายเดือนและสถานะ `SUBMITTED`
- [x] อนุมัติขั้นกลางไป `IN_REVIEW`; ขั้นสุดท้ายไป `APPROVED`
- [x] ปฏิเสธโดยไม่มีเหตุผลไม่ได้
- [x] ยกเลิกคำร้องของตนเองที่ `SUBMITTED` ได้; `IN_REVIEW` ยกเลิกไม่ได้
- [x] ผู้มี `documents:manage` สร้างประเภทเอกสารได้
- [x] Unit tests ของ workflow + validations ผ่าน
- [ ] เส้นทางอนุมัติผูก RBAC จริง ไม่ hardcode `DEAN`
- [ ] หน้า Portal สำหรับยื่น/ติดตาม
- [ ] แนบไฟล์ / ลายเซ็น / ฟิลด์ไดนามิก
- [ ] รายละเอียดคำร้องโหลด `approvalSteps` จาก `getDocumentRequestById`
