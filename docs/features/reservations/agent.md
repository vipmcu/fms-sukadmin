# AI Coding Instructions & Rules: Reservations Feature
## กฎเหล็กและข้อกำหนดสำหรับ AI ในการพัฒนาฟีเจอร์จองห้องประชุมและยานพาหนะ

เอกสารนี้ระบุกฎเกณฑ์เชิงสถาปัตยกรรมที่ AI Assistant (Antigravity, Cursor, Claude Code) **ต้องปฏิบัติตามอย่างเคร่งครัด** เมื่อทำการพัฒนา แก้ไข หรือ Refactor โค้ดในโมดูล `src/features/reservations/`

---

### 1. กฎการแบ่งขอบเขตโมดูล (Modular Monolith Boundaries)

1. **การปิดล้อมโค้ดภายใน (Internal Encapsulation):**
   - โค้ด Business Logic, Database queries, Internal Services, และ Private Schemas ทั้งหมด ต้องอยู่ใน `src/features/reservations/_internal/`
   - **ห้าม** ให้ Feature อื่น (เช่น `identity`, `news`, `curriculum`) ทำการ import สิ่งใดก็ตามจาก `src/features/reservations/_internal/` โดยตรง (ตรวจสอบผ่าน `dependency-cruiser`)

2. **จุดเชื่อมต่อสาธารณะ (Public API Surface):**
   - ส่งออกเฉพาะส่วนที่อนุญาตให้ภายนอกเรียกใช้ผ่าน 3 ไฟล์หลักเท่านั้น:
     - `index.ts`: Client-safe types, DTOs, Enums และ Formatters
     - `server.ts`: ฟังก์ชันสำหรับ Server Components และ cross-feature query
     - `actions.ts`: Server Actions สำหรับการกลายพันธุ์ข้อมูล (Mutations)

3. **ห้ามแก้ไขไฟล์ระบบนอกขอบเขตโมดูลโดยไม่ได้รับอนุญาต:**
   - ไฟล์ที่อนุญาตให้เชื่อมโยงภายนอกมีเพียง:
     - `prisma/schema.prisma` (เพิ่ม Models/Enums ของระบบจอง)
     - `src/permissions.ts` (ลงทะเบียน Permissions)
     - `src/i18n/index.ts` (ลงทะเบียน Messages)
     - `src/app/(portal)/...` และ `src/app/(admin)/...` (สร้าง UI Routes)

---

### 2. Multi-tenancy และความปลอดภัย (Security & Isolation)

1. **การผูก Tenant ID:**
   - ทุกตารางในฐานข้อมูลต้องมีฟิลด์ `tenant_id UUID`
   - **ห้ามรับ `tenantId` จากฝั่ง Client เด็ดขาด** ทุกการดำเนินการต้องดึง `tenantId` จาก Session ที่ผ่านการยืนยันตัวตนแล้วเท่านั้น (`const ctx = await requirePermission(...)` -> `ctx.tenantId`)

2. **การตรวจสอบสิทธิ์ (RBAC):**
   - ทุก Server Action ต้องมีการเรียกใช้ `requirePermission(RESERVATIONS_P.<ACTION>)` ก่อนเสมอ
   - ตัวอย่าง:
     ```ts
     // อ่านรายการจอง
     const ctx = await requirePermission(RESERVATIONS_P.read);
     // สร้างคำขอจอง
     const ctx = await requirePermission(RESERVATIONS_P.create);
     // อนุมัติคำขอ
     const ctx = await requirePermission(RESERVATIONS_P.approve);
     ```

3. **Audit Trail Logging:**
   - ทุก Action ที่เปลี่ยนสถานะของคำขอ (สร้างคำขอ, อนุมัติ, ปฏิเสธ, ยกเลิก) ต้องเรียกฟังก์ชัน `writeAudit(...)` เพื่อบันทึกหลักฐานลงในตาราง `audit_logs` ใน Transaction เดียวกัน

---

### 3. มาตรฐานการเขียน Server Actions & Validations

1. **โครงสร้าง Server Actions:**
   - ต้องครอบการทำงานทั้งหมดด้วย `runAction()` จาก `@/shared/lib/result` เพื่อส่งค่ากลับเป็น `ActionResult<T>`
   - ต้อง Validate ข้อมูลขาเข้าด้วย Zod Schema พร้อมแนบ `zodErrorMap` ประจำภาษาเสมอ:
     ```ts
     const parsed = createReservationSchema.parse(input, {
       error: zodErrorMap(await getLocale()),
     });
     ```

2. **การ Revalidate แคช:**
   - เมื่อมีการบันทึกการเปลี่ยนแปลง ต้องสั่ง `revalidatePath("/reservations")` และเส้นทางที่เกี่ยวข้อง เพื่อให้ UI อัปเดตทันที

---

### 4. มาตรฐานภาษาและการจัดรูปแบบ (i18n & Formatting)

1. **ห้ามฮาร์ดโค้ดข้อความ (No Hardcoded Strings):**
   - ข้อความทุกข้อความที่แสดงผลบน UI (Label, Button, Toast, Error message) ต้องใช้ผ่าน `t("reservations.<key>")`
   - กำหนดคำแปลครบทั้ง `th` และ `en` ใน `src/features/reservations/messages.ts` เสมอ

2. **การแสดงผลวันที่และเวลา:**
   - ใช้วันที่และเวลาผ่าน `formatDate()` หรือ `formatDateTime()` จาก `@/shared/lib/date`
   - ภาษาไทยแสดงปี พ.ศ. และภาษาอังกฤษแสดงปี ค.ศ. อัตโนมัติ

---

### 5. การออกแบบ UI ด้วย Liyon Design System

1. **คอมโพเนนต์มาตรฐาน:**
   - นำเข้าคอมโพเนนต์จาก `@/shared/components/liyon` เท่านั้น เช่น `LiyonButton`, `LiyonInput`, `LiyonSelect`, `LiyonDialog`, `LiyonBadge`, `DataTable`
   - ห้ามลงไลบรารี UI ภายนอกเพิ่มเติม

2. **โทนสีและสถานะ (Status Pill Tone):**
   - `PENDING`: `warning` (สีเหลือง/ส้ม)
   - `APPROVED` / `CONFIRMED`: `success` (สีเขียว)
   - `REJECTED`: `danger` (สีแดง)
   - `CANCELLED`: `neutral` (สีเทา)

---

### 6. สิ่งที่ห้ามทำโดยเด็ดขาด (Forbidden Anti-Patterns)

❌ ห้าม Query ฐานข้อมูลโดยตรงจาก Client Component หรือข้ามผ่าน `_internal/`
❌ ห้ามละเลยเงื่อนไข Collision Check ช่วงเวลา (ห้ามยอมรับการจองซ้ำซ้อน)
❌ ห้ามรับ `userId` หรือ `tenantId` จาก JSON Payload ของผู้ใช้
❌ ห้ามแก้ไขไฟล์ Theme ดิบใน `src/shared/styles/liyon/`
❌ ห้ามส่งโค้ดที่ไม่ผ่าน `npm run check`
