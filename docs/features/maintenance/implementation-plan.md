# Implementation Plan: Maintenance & Service Desk
## แผนปฏิบัติการพัฒนาระบบแจ้งซ่อมและขอใช้บริการออนไลน์

---

### Step 1: Database Model & Migration
- [x] 1.1 เพิ่มโมเดล `ServiceCategory`, `ServiceTicket`, `TicketComment`, `TicketRating` ใน `prisma/schema.prisma`
- [x] 1.2 รันคำสั่ง `npx prisma migrate dev --name add_maintenance_service_desk_module`
- [x] 1.3 อัปเดต `prisma/seed.ts` สร้างหมวดหมู่งานบริการ (IT, Building, AV) และคำร้องตัวอย่าง

### Step 2: Internal Services & Validations
- [x] 2.1 สร้าง Zod Schemas ใน `src/features/maintenance/_internal/validations.ts`
- [x] 2.2 สร้าง SLA Calculation Utility ใน `src/features/maintenance/_internal/sla.ts`
- [x] 2.3 สร้าง Unit Tests ใน `src/features/maintenance/_internal/validations.test.ts`
- [x] 2.4 พัฒนา Ticket & Dispatch Services ใน `src/features/maintenance/_internal/services.ts`
  - `createServiceTicket`, `assignTechnician`, `updateTicketProgress`, `resolveTicket`, `rateTicket`

### Step 3: Server Actions & Central Integrations
- [x] 3.1 สร้าง Permissions ใน `src/features/maintenance/permissions.ts` และลงทะเบียนใน `src/permissions.ts`
- [x] 3.2 สร้าง Dictionary สองภาษาใน `src/features/maintenance/messages.ts` และลงทะเบียนใน `src/i18n/index.ts`
- [x] 3.3 สร้าง Server Actions ใน `src/features/maintenance/_internal/actions.ts`
- [x] 3.4 สร้าง Public Barrel Files (`index.ts`, `server.ts`, `actions.ts`)

### Step 4: Admin Console & Portal UI
- [x] 4.1–4.3 รวมแดชบอร์ด SLA, คิวงาน, และจ่ายช่างที่ `/maintenance` (ไม่แยก `/dashboard` `/kanban` `/tickets`)
- [x] 4.4 พัฒนาหน้าฟอร์มแจ้งซ่อมด่วนบนมือถือ `/helpdesk` และหน้าค้นหาสถานะ `/helpdesk/tracking`
- [x] 4.5 พัฒนาหน้ารายละเอียดคำร้อง การสนทนา และแบบฟอร์มให้คะแนน 1-5 ดาว
- [x] 4.6 ปรับแต่ง Proxy ใน `src/proxy.ts` เปิดสิทธิ์ `/helpdesk` เป็น Public Route

### Step 5: Quality Gate & Verification
- [x] 5.1 รัน `npm run type-check` และ `npm run lint`
- [x] 5.2 รัน `npm run deps:check` ตรวจสอบขอบเขตโมดูล
- [x] 5.3 รัน `npm run test` และ `npm run test:integration`
