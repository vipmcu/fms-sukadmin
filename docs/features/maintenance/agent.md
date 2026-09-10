# AI Coding Instructions & Rules: Maintenance & Service Desk
## กฎเหล็กและข้อกำหนดสำหรับ AI ในการพัฒนาระบบแจ้งซ่อมและขอใช้บริการออนไลน์

เอกสารนี้ระบุกฎเกณฑ์เชิงสถาปัตยกรรมที่ AI Assistant **ต้องปฏิบัติตามอย่างเคร่งครัด** เมื่อพัฒนาหรือแก้ไขโค้ดในโมดูล `src/features/maintenance/`

---

### 1. กฎการแบ่งขอบเขตโมดูล (Modular Monolith Boundaries)

1. **การปิดล้อมโค้ดภายใน (Internal Encapsulation):**
   - โค้ด Business Logic, Database queries, Internal Services ทั้งหมด ต้องอยู่ใน `src/features/maintenance/_internal/`
   - **ห้าม** ให้ Feature อื่น นำเข้าสิ่งใดก็ตามจาก `src/features/maintenance/_internal/` โดยตรง
2. **จุดเชื่อมต่อสาธารณะ (Public API Surface):**
   - ส่งออกเฉพาะส่วนที่อนุญาตให้ภายนอกเรียกใช้ผ่าน 3 ไฟล์หลัก:
     - `index.ts`: Client-safe types, Enums, Helpers
     - `server.ts`: ฟังก์ชันสำหรับ Server Components (เช่น `listServiceTickets`, `getTicketById`)
     - `actions.ts`: Server Actions สำหรับ Mutation (เช่น `createTicketAction`, `assignTicketAction`, `resolveTicketAction`)
3. **การเชื่อมโยงกับฟีเจอร์อื่น (Cross-feature References):**
   - อนุญาตให้อ้างอิง Foreign Key สู่โมเดลของฟีเจอร์อื่นในระดับ Prisma (`ReservationResource`, `AssetItem`) แต่การเรียกใช้งานข้าม Feature ในระดับ Code ต้องผ่าน Public API เท่านั้น

---

### 2. Multi-tenancy และความปลอดภัย (Security & Isolation)

1. **Tenant Isolation:**
   - ทุกตารางต้องมีฟิลด์ `tenant_id UUID`
   - หน้าแจ้งซ่อมสาธารณะต้องดึง `tenantId` ผ่าน `getPortalTenantId()` จาก `@/shared/lib/portal-tenant`
   - หน้า Admin หลังบ้าน ต้องดึง `tenantId` จาก Session เสมอ
2. **Internal Comment Isolation:**
   - บันทึกการสนทนาใน Ticket ที่มีแฟล็ก `isInternal = true` ต้องไม่ถูกส่งออกไปยังหน้าแสดงผลของผู้แจ้งภายนอก
3. **Role-Based Access Control (RBAC):**
   - ตรวจสอบสิทธิ์ `maintenance.ticket.manage` สำหรับการจ่ายงาน และ `maintenance.ticket.resolve` สำหรับการปิดงาน

---

### 3. มาตรฐานการเขียน Server Actions & Validations

1. **Server Actions:**
   - ครอบการทำงานด้วย `runAction()` จาก `@/shared/lib/result` เพื่อส่งค่ากลับเป็น `ActionResult<T>`
   - Validate ข้อมูลขาเข้าด้วย Zod Schema พร้อมแนบ `zodErrorMap(await getLocale())` เสมอ
2. **UI Components:**
   - ใช้ Components จาก `@/shared/components/liyon` สำหรับหน้า Admin Console
   - ใช้คีย์แปลภาษาจาก `src/features/maintenance/messages.ts` ห้ามฮาร์ดโค้ดข้อความ
