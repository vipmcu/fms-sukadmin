# Implementation Plan: Student Admissions System
## แผนปฏิบัติการพัฒนาระบบรับสมัครนิสิตใหม่

---

### Step 1: Database Model & Migration
- [x] 1.1 เพิ่มโมเดล `AdmissionRound`, `AdmissionProgramQuota`, `StudentApplication` ใน `prisma/schema.prisma`
- [x] 1.2 รันคำสั่ง `npx prisma migrate dev --name add_student_admissions_module`
- [x] 1.3 อัปเดต `prisma/seed.ts` สร้างรอบรับสมัคร TCAS จำลอง และโควตารายวิชา

### Step 2: Internal Services & Validations
- [x] 2.1 สร้าง Zod Schemas และ National ID Validator ใน `src/features/admissions/_internal/validations.ts`
- [x] 2.2 สร้าง Unit Tests ใน `src/features/admissions/_internal/validations.test.ts`
- [x] 2.3 พัฒนา CRUD & Review Services ใน `src/features/admissions/_internal/services.ts`
  - `listAdmissionRounds`, `createAdmissionRound`, `updateAdmissionRound`
  - `submitApplication`, `getApplicationByNo`, `reviewApplication`, `exportApplicationsToCsv`

### Step 3: Server Actions & Central Integrations
- [x] 3.1 สร้าง Permissions ใน `src/features/admissions/permissions.ts` และลงทะเบียนใน `src/permissions.ts`
- [x] 3.2 สร้าง Dictionary สองภาษาใน `src/features/admissions/messages.ts` และลงทะเบียนใน `src/i18n/index.ts`
- [x] 3.3 สร้าง Server Actions ใน `src/features/admissions/_internal/actions.ts`
- [x] 3.4 สร้าง Public Barrel Files (`index.ts`, `server.ts`, `actions.ts`)

### Step 4: Admin Console & Portal UI
- [x] 4.1–4.2 รวมหน้าจัดการรอบและใบสมัครที่ `/admissions/manage` (ไม่แยก `/rounds` + `/applications`)
- [x] 4.3 พัฒนาหน้าพอร์ทัลสาธารณะ `/admissions` และฟอร์มยื่นใบสมัคร `/admissions/apply`
- [x] 4.4 พัฒนาหน้าค้นหาสถานะใบสมัคร `/admissions/tracking` (พร้อม PDPA Masking)
- [x] 4.5 ปรับแต่ง Proxy ใน `src/proxy.ts` เปิดสิทธิ์ `/admissions` เป็น Public Route

### Step 5: Quality Gate & Verification
- [x] 5.1 รัน `npm run type-check` และ `npm run lint`
- [x] 5.2 รัน `npm run deps:check` ตรวจสอบขอบเขตโมดูล
- [x] 5.3 รัน `npm run test` และ `npm run test:integration`
