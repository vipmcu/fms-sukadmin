# AI Coding Instructions & Rules: Asset & Inventory Management
## กฎเหล็กและข้อกำหนดสำหรับ AI ในการพัฒนาระบบบริหารจัดการพัสดุและครุภัณฑ์

เอกสารนี้ระบุกฎเกณฑ์เชิงสถาปัตยกรรมที่ AI Assistant **ต้องปฏิบัติตามอย่างเคร่งครัด** เมื่อพัฒนาหรือแก้ไขโค้ดในโมดูล `src/features/assets/`

---

### 1. กฎการแบ่งขอบเขตโมดูล (Modular Monolith Boundaries)

1. **การปิดล้อมโค้ดภายใน (Internal Encapsulation):**
   - โค้ด Business Logic, Database queries, Internal Services, และ Private Schemas ทั้งหมด ต้องอยู่ใน `src/features/assets/_internal/`
   - **ห้าม** ให้ Feature อื่น (เช่น `identity`, `news`, `curriculum`, `reservations`) ทำการ import สิ่งใดก็ตามจาก `src/features/assets/_internal/` โดยตรง
2. **จุดเชื่อมต่อสาธารณะ (Public API Surface):**
   - ส่งออกเฉพาะส่วนที่อนุญาตให้ภายนอกเรียกใช้ผ่าน 3 ไฟล์หลักเท่านั้น:
     - `index.ts`: Client-safe types, DTOs, Enums และ Formatters
     - `server.ts`: ฟังก์ชันสำหรับ Server Components (เช่น `listAssetItems`, `getAssetById`)
     - `actions.ts`: Server Actions สำหรับการกลายพันธุ์ข้อมูล (Mutations)
3. **ไฟล์ภายนอกโมดูลที่ต้องเชื่อมโยง:**
   - `prisma/schema.prisma` (เพิ่ม Models: `AssetCategory`, `AssetItem`, `AssetTransaction`, `SupplyItem`, `SupplyRequisition`, `SupplyRequisitionItem`)
   - `src/permissions.ts` (ลงทะเบียนสิทธิ์กลุ่ม `assets.*`)
   - `src/i18n/index.ts` (ลงทะเบียน Messages สองภาษา)
   - `src/components/layout/sidebar-nav.ts` (เพิ่มเมนูใน Sidebar)

---

### 2. Multi-tenancy และความปลอดภัย (Security & Isolation)

1. **การผูก Tenant ID:**
   - ทุกตารางในฐานข้อมูลต้องมีฟิลด์ `tenant_id UUID`
   - **ห้ามรับ `tenantId` จากฝั่ง Client เด็ดขาด** ทุกการดำเนินการต้องดึง `tenantId` จาก Session เท่านั้น
2. **การตรวจสอบสิทธิ์ (RBAC):**
   - ตรวจสอบผ่าน `hasPermission(session, ...)` ก่อนรัน Server Action เสมอ
3. **Audit Trail Logging:**
   - ทุก Action สำคัญ (สร้างครุภัณฑ์, โอนย้าย, ตัดจำหน่าย, เบิกจ่าย) ต้องบันทึกประวัติลงใน `audit_logs` และ `asset_transactions`

---

### 3. มาตรฐานการเขียน Server Actions & Validations

1. **Server Actions:**
   - ครอบการทำงานด้วย `runAction()` จาก `@/shared/lib/result` เพื่อส่งค่ากลับเป็น `ActionResult<T>`
   - Validate ข้อมูลขาเข้าด้วย Zod Schema พร้อมแนบ `zodErrorMap(await getLocale())` เสมอ
2. **UI Components:**
   - ใช้ UI Components จาก `@/shared/components/liyon` (DataTable, StatusPill, Card, LiyonDialog, FormControls)
   - ห้ามฮาร์ดโค้ดข้อความใน UI ต้องใช้คีย์แปลผ่านพจนานุกรม `messages.ts`
