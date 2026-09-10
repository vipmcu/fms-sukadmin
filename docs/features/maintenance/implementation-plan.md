# Implementation Plan: Maintenance & Service Desk
## แผนปฏิบัติการพัฒนาระบบแจ้งซ่อมและขอใช้บริการออนไลน์

---

### Step 1: Database Model & Migration
- [ ] 1.1 เพิ่มโมเดล `ServiceCategory`, `ServiceTicket`, `TicketComment`, `TicketRating` ใน `prisma/schema.prisma`
- [ ] 1.2 รันคำสั่ง `npx prisma migrate dev --name add_maintenance_service_desk_module`
- [ ] 1.3 อัปเดต `prisma/seed.ts` สร้างหมวดหมู่งานบริการ (IT, Building, AV) และคำร้องตัวอย่าง

### Step 2: Internal Services & Validations
- [ ] 2.1 สร้าง Zod Schemas ใน `src/features/maintenance/_internal/validations.ts`
- [ ] 2.2 สร้าง SLA Calculation Utility ใน `src/features/maintenance/_internal/sla.ts`
- [ ] 2.3 สร้าง Unit Tests ใน `src/features/maintenance/_internal/validations.test.ts`
- [ ] 2.4 พัฒนา Ticket & Dispatch Services ใน `src/features/maintenance/_internal/services.ts`
  - `createServiceTicket`, `assignTechnician`, `updateTicketProgress`, `resolveTicket`, `rateTicket`

### Step 3: Server Actions & Central Integrations
- [ ] 3.1 สร้าง Permissions ใน `src/features/maintenance/permissions.ts` และลงทะเบียนใน `src/permissions.ts`
- [ ] 3.2 สร้าง Dictionary สองภาษาใน `src/features/maintenance/messages.ts` และลงทะเบียนใน `src/i18n/index.ts`
- [ ] 3.3 สร้าง Server Actions ใน `src/features/maintenance/_internal/actions.ts`
- [ ] 3.4 สร้าง Public Barrel Files (`index.ts`, `server.ts`, `actions.ts`)

### Step 4: Admin Console & Portal UI
- [ ] 4.1 พัฒนาหน้า Dashboard สถิติ SLA `/maintenance/dashboard`
- [ ] 4.2 พัฒนากระดานงานซ่อมแบบ Kanban Board `/maintenance/kanban`
- [ ] 4.3 พัฒนาหน้าตารางงานซ่อม `/maintenance/tickets` และฟอร์มจ่ายงานให้นายช่าง
- [ ] 4.4 พัฒนาหน้าฟอร์มแจ้งซ่อมด่วนบนมือถือ `/helpdesk` และหน้าค้นหาสถานะ `/helpdesk/tracking`
- [ ] 4.5 พัฒนาหน้ารายละเอียดคำร้อง การสนทนา และแบบฟอร์มให้คะแนน 1-5 ดาว
- [ ] 4.6 ปรับแต่ง Proxy ใน `src/proxy.ts` เปิดสิทธิ์ `/helpdesk` เป็น Public Route

### Step 5: Quality Gate & Verification
- [ ] 5.1 รัน `npm run type-check` และ `npm run lint`
- [ ] 5.2 รัน `npm run deps:check` ตรวจสอบขอบเขตโมดูล
- [ ] 5.3 รัน `npm run test` และ `npm run test:integration`
