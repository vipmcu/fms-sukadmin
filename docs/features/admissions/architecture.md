# Technical Architecture & System Flow
## ระบบรับสมัครนิสิตใหม่ (Student Admissions System)

---

### 1. โครงสร้างโฟลเดอร์ของโมดูล (Module Structure)

```
src/features/admissions/
├── index.ts                 # Public Client-safe Types, Enums, Formatters
├── server.ts                # Public Queries สำหรับ Server Components
├── actions.ts               # Public Server Actions (re-export จาก _internal/actions.ts)
├── permissions.ts           # Permission Codes Registry (ADMISSIONS_PERMISSIONS)
├── messages.ts              # พจนานุกรมสองภาษา (TH/EN)
└── _internal/
    ├── actions.ts           # Server Actions (Submit, Review, Score, Export)
    ├── services.ts          # Core Business Logic & Database Queries (Prisma)
    ├── validations.ts       # Zod Schemas (National ID Checksum, Application Form)
    └── validations.test.ts  # Unit Tests
```

---

### 2. แผนผังสถานะใบสมัคร (Application Lifecycle Flow)

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED: ผู้สมัครส่งใบสมัครออนไลน์
    
    SUBMITTED --> DOCS_APPROVED: เจ้าหน้าที่ตรวจเอกสารผ่าน
    SUBMITTED --> DOCS_REJECTED: เอกสารไม่ถูกต้อง/ไม่ครบถ้วน
    
    DOCS_REJECTED --> SUBMITTED: ผู้สมัครแก้ไขเอกสารใหม่
    
    DOCS_APPROVED --> INTERVIEW_ELIGIBLE: ผ่านการคัดกรอง มีสิทธิ์เข้าสัมภาษณ์
    DOCS_APPROVED --> REJECTED: ไม่ผ่านเกณฑ์ขั้นต่ำ
    
    INTERVIEW_ELIGIBLE --> PASSED: ผ่านการคัดเลือกตัวจริง
    INTERVIEW_ELIGIBLE --> REJECTED: ไม่ผ่านการคัดเลือก
    
    PASSED --> [*]: ยืนยันสิทธิ์เข้าศึกษา
    REJECTED --> [*]: สิ้นสุดกระบวนการ
```

---

### 3. Route Mapping

* **Public Portal (ฝั่งผู้สมัคร):**
  * `/admissions`: หน้าหลักรอบรับสมัคร, ปฏิทินกำหนดการ, ค้นหาเกณฑ์ตามหลักสูตร
  * `/admissions/apply`: แบบฟอร์มยื่นใบสมัครออนไลน์ (Step Wizard)
  * `/admissions/tracking`: ระบบค้นหาสถานะใบสมัคร (National ID + Application No.)
  * `/admissions/results`: ประกาศรายชื่อผู้มีสิทธิ์สัมภาษณ์และผลการคัดเลือก
* **Admin Console (ฝั่งคณะ/กรรมการ):**
  * `/admissions/manage/rounds`: จัดการรอบรับสมัคร และกำหนดโควตารายหลักสูตร
  * `/admissions/manage/applications`: ตารางรายชื่อผู้สมัคร, ตัวกรอง, ปุ่มส่งออก Excel
  * `/admissions/manage/review/[id]`: หน้าจอตรวจเอกสารแบบ Split View และบันทึกคะแนน

---

### 4. Permissions Registry

| รหัสสิทธิ์ (Permission Code) | วัตถุประสงค์ |
| :--- | :--- |
| `admissions.round.manage` | สร้าง แก้ไข เปิด/ปิดรอบการรับสมัคร |
| `admissions.application.view` | เข้าดูรายชื่อผู้สมัครและสถิติภาพรวม |
| `admissions.application.review` | ตรวจสอบเอกสาร และบันทึกผลการคัดกรอง |
| `admissions.application.score` | บันทึกคะแนนสัมภาษณ์และตัดสินผลการคัดเลือก |
| `admissions.application.export` | ส่งออกรายชื่อผู้สมัครเป็นไฟล์ Excel |
