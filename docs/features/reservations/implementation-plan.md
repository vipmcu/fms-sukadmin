# Implementation Plan
## ระบบจองห้องประชุมและยานพาหนะ (Facility & Fleet Reservation)

แผนการพัฒนาทีละขั้นตอนตามลำดับการพึ่งพา (Dependency Order) ตามมาตรฐาน Modular Monolith ของ VibeCore Framework:

---

### Phase 1: Database & Migrations
- [x] **Task 1.1:** อัปเดต `prisma/schema.prisma` เพิ่ม Enums (`ResourceType`, `ReservationStatus`) และ Models (`ReservationResource`, `Reservation`, `ResourceBlackout`)
- [x] **Task 1.2:** ผูกความสัมพันธ์ใน Model `Tenant` และ `User`
- [x] **Task 1.3:** รันคำสั่งสร้าง Migration:
  ```bash
  npm run db:migrate:dev -- --name add_reservations_module
  ```
- [x] **Task 1.4:** รัน `npm run db:generate` เพื่ออัปเดต Prisma Client

---

### Phase 2: Domain Skeleton & Validations
- [x] **Task 2.1:** สร้างโฟลเดอร์ `src/features/reservations/` และ `src/features/reservations/_internal/`
- [x] **Task 2.2:** สร้างไฟล์ `src/features/reservations/permissions.ts` กำหนดสิทธิ์ `RESERVATIONS_P`
- [x] **Task 2.3:** สร้างไฟล์ `src/features/reservations/messages.ts` พจนานุกรมสองภาษา (TH/EN)
- [x] **Task 2.4:** สร้างไฟล์ `src/features/reservations/_internal/validations.ts` กำหนด Zod Schemas
- [x] **Task 2.5:** สร้าง Unit Test `src/features/reservations/_internal/validations.test.ts` และรัน `npm test` ให้ผ่าน

---

### Phase 3: Core Business Logic & Services
- [x] **Task 3.1:** สร้าง `src/features/reservations/_internal/collision.ts`:
  - ฟังก์ชัน `checkReservationCollision(db, tenantId, resourceId, start, end, excludeId)` รวม Buffer 30 นาที
- [x] **Task 3.2:** สร้าง `src/features/reservations/_internal/services.ts`:
  - `listResources(tenantId, filter)`
  - `getResourceById(tenantId, id)`
  - `listReservations(tenantId, filter)`
  - `getReservationById(tenantId, id)`
  - `createReservation(tenantId, requesterId, data)`
  - `approveReservation(tenantId, approverId, data)`
  - `rejectReservation(tenantId, approverId, data)`
  - `cancelReservation(tenantId, userId, data)`
- [x] **Task 3.3:** เขียน Unit Test สำหรับ Logic การคำนวณช่วงเวลา Collision และ Buffer Time

---

### Phase 4: Server Actions & Public Module API
- [x] **Task 4.1:** สร้าง `src/features/reservations/_internal/actions.ts` ครอบด้วย `runAction` และ `requirePermission`
- [x] **Task 4.2:** สร้าง `src/features/reservations/actions.ts` เพื่อ Re-export Server Actions
- [x] **Task 4.3:** สร้าง `src/features/reservations/server.ts` สำหรับ Server Components
- [x] **Task 4.4:** สร้าง `src/features/reservations/index.ts` สำหรับ Client-safe Exports

---

### Phase 5: Central System Integration
- [x] **Task 5.1:** ลงทะเบียนสิทธิ์ใน `src/permissions.ts`
- [x] **Task 5.2:** ลงทะเบียนข้อความสองภาษาใน `src/i18n/index.ts`
- [x] **Task 5.3:** ทดสอบ i18n ด้วยคำสั่ง `npm test src/i18n/index.test.ts`
- [x] **Task 5.4:** เพิ่มข้อมูลตัวอย่างห้องประชุม/รถยนต์ใน `prisma/seed.ts` และทดสอบรัน `npm run db:seed`

---

### Phase 6: Admin Console UI (`src/app/(admin)/reservations/`)
- [x] **Task 6.1:** เพิ่มเมนู "ระบบจองห้องและยานพาหนะ" ใน Sidebar ของ Admin (`src/components/layout/sidebar-nav.ts`)
- [x] **Task 6.2:** สร้างหน้า `/(admin)/reservations/calendar/page.tsx` ปฏิทินจองห้องและรถ
- [x] **Task 6.3:** สร้าง Dialog ฟอร์มขอจอง `BookingCreateDialog` พร้อมระบบตรวจสอบความพร้อมใช้งาน
- [x] **Task 6.4:** สร้างหน้า `/(admin)/reservations/my/page.tsx` ตารางติดตามคำขอของฉัน พร้อมปุ่มยกเลิก
- [x] **Task 6.5:** สร้างหน้า `/(admin)/reservations/inbox/page.tsx` คิวงานรออนุมัติสำหรับเจ้าหน้าที่ พร้อม Action Modal
- [x] **Task 6.6:** สร้างหน้า `/(admin)/reservations/resources/page.tsx` จัดการข้อมูลห้องและยานพาหนะ (Admin only)

---

### Phase 7: Public Portal UI (`src/app/(portal)/facilities/`)
- [x] **Task 7.1:** สร้างหน้า `/(portal)/facilities/page.tsx` แคตตาล็อกห้องประชุมและรถยนต์
- [x] **Task 7.2:** สร้างหน้า `/(portal)/facilities/schedule/page.tsx` ปฏิทินตารางงานสาธารณะ (Privacy Masking)
- [x] **Task 7.3:** สร้างหน้า `/(portal)/facilities/[id]/page.tsx` หน้ารายละเอียดสเปกห้อง/รถ พร้อมปุ่มลิงก์เข้าสู่ระบบเพื่อจอง

---

### Phase 8: Verification & Quality Gate
- [x] **Task 8.1:** รัน Type Check: `npm run type-check`
- [x] **Task 8.2:** รัน Linters & Dependency Boundary Check: `npm run lint && npm run deps:check`
- [x] **Task 8.3:** รัน Unit Tests: `npm run test`
- [x] **Task 8.4:** รัน Full Quality Suite: `npm run check`
