# AI Coding Instructions & Rules: Student Admissions System
## กฎเหล็กและข้อกำหนดสำหรับ AI ในการพัฒนาระบบรับสมัครนิสิตใหม่

เอกสารนี้ระบุกฎเกณฑ์เชิงสถาปัตยกรรมที่ AI Assistant **ต้องปฏิบัติตามอย่างเคร่งครัด** เมื่อพัฒนาหรือแก้ไขโค้ดในโมดูล `src/features/admissions/`

---

### 1. กฎการแบ่งขอบเขตโมดูล (Modular Monolith Boundaries)

1. **การปิดล้อมโค้ดภายใน (Internal Encapsulation):**
   - โค้ด Business Logic, Database queries, Internal Services ทั้งหมด ต้องอยู่ใน `src/features/admissions/_internal/`
   - **ห้าม** ให้ Feature อื่น นำเข้าสิ่งใดก็ตามจาก `src/features/admissions/_internal/` โดยตรง
2. **จุดเชื่อมต่อสาธารณะ (Public API Surface):**
   - ส่งออกเฉพาะส่วนที่อนุญาตให้ภายนอกเรียกใช้ผ่าน 3 ไฟล์หลัก:
     - `index.ts`: Client-safe types, Enums, DTOs
     - `server.ts`: ฟังก์ชันสำหรับ Server Components (เช่น `listOpenAdmissionRounds`, `getApplicationStatus`)
     - `actions.ts`: Server Actions สำหรับ Mutation (เช่น `submitApplicationAction`, `reviewApplicationAction`)
3. **การเชื่อมโยงกับฟีเจอร์หลักสูตร (Curriculum Integration):**
   - อนุญาตให้นำเข้าเฉพาะ Public Exports จาก `@/features/curriculum` เช่น ฟังก์ชัน `listPrograms` หรือ Type `AcademicProgram` **ห้ามเข้าถึง `_internal` ของ curriculum**

---

### 2. Multi-tenancy และความปลอดภัย (Security & PDPA)

1. **Tenant Isolation:**
   - ทุกตารางต้องมีฟิลด์ `tenant_id UUID`
   - ในส่วนของ Admin ต้องดึง `tenantId` จาก Session เท่านั้น
   - ในส่วนของ Public Form ต้องใช้ `getPortalTenantId()` จาก `@/shared/lib/portal-tenant`
2. **PDPA Data Masking:**
   - ข้อมูลเลขบัตรประชาชน, เบอร์โทรศัพท์, และอีเมลของผู้สมัคร ต้องถูก Mask เสมอในส่วนของการสืบค้นสาธารณะ (เช่น `1-1004-xxxx-xx-x`, `som***@gmail.com`)
3. **Role-Based Access Control (RBAC):**
   - การเข้าถึงข้อมูลและการให้คะแนนต้องตรวจสอบสิทธิ์ `admissions.application.review` เสมอ

---

### 3. มาตรฐานการเขียน Server Actions & Validations

1. **Server Actions:**
   - ครอบการทำงานด้วย `runAction()` จาก `@/shared/lib/result` เพื่อส่งค่ากลับเป็น `ActionResult<T>`
   - ตรวจสอบรูปแบบเลขบัตรประชาชน 13 หลักด้วย Checksum Algorithm ใน Zod Schema
2. **UI Components:**
   - ใช้ Components จาก `@/shared/components/liyon` สำหรับหน้า Admin Console
   - ใช้คีย์แปลภาษาจาก `src/features/admissions/messages.ts` ห้ามฮาร์ดโค้ดข้อความ
