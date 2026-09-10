# Data Model, Schemas & Dictionary
## ระบบจองห้องประชุมและยานพาหนะ (Facility & Fleet Reservation)

---

### 1. Prisma Data Models & Enums

โค้ดสำหรับนำไปวางในไฟล์ `prisma/schema.prisma`:

```prisma
enum ResourceType {
  ROOM
  VEHICLE

  @@map("resource_types")
}

enum ReservationStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED

  @@map("reservation_statuses")
}

model ReservationResource {
  id              String       @id @default(uuid()) @db.Uuid
  tenantId        String       @map("tenant_id") @db.Uuid
  type            ResourceType
  code            String       @db.VarChar(50)
  nameTh          String       @map("name_th") @db.VarChar(255)
  nameEn          String       @map("name_en") @db.VarChar(255)
  capacity        Int          @default(1)
  locationOrPlate String       @map("location_or_plate") @db.VarChar(150)
  /// { projector?: boolean, soundSystem?: boolean, videoConference?: boolean, micCount?: number }
  amenities       Json         @default("{}") @db.JsonB
  imageUrl        String?      @map("image_url") @db.VarChar(500)
  descriptionTh   String?      @map("description_th") @db.Text
  descriptionEn   String?      @map("description_en") @db.Text
  isActive        Boolean      @default(true) @map("is_active")
  createdAt       DateTime     @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime     @updatedAt @map("updated_at") @db.Timestamptz()

  tenant       Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  reservations Reservation[]
  blackouts    ResourceBlackout[]

  @@unique([tenantId, code])
  @@index([tenantId, type, isActive])
  @@map("reservation_resources")
}

model Reservation {
  id                   String            @id @default(uuid()) @db.Uuid
  tenantId             String            @map("tenant_id") @db.Uuid
  bookingNo            String            @map("booking_no") @db.VarChar(50)
  resourceId           String            @map("resource_id") @db.Uuid
  requesterId          String            @map("requester_id") @db.Uuid
  title                String            @db.VarChar(255)
  purpose              String            @db.Text
  attendeesCount       Int               @default(1) @map("attendees_count")
  startTime            DateTime          @map("start_time") @db.Timestamptz()
  endTime              DateTime          @map("end_time") @db.Timestamptz()
  status               ReservationStatus @default(PENDING)
  
  // สำหรับการจองยานพาหนะ
  destination          String?           @db.VarChar(255)
  driverName           String?           @map("driver_name") @db.VarChar(150)
  driverPhone          String?           @map("driver_phone") @db.VarChar(50)
  assignedVehiclePlate String?           @map("assigned_vehicle_plate") @db.VarChar(50)

  // ส่วนของการอนุมัติ / ปฏิเสธ
  approverId           String?           @map("approver_id") @db.Uuid
  approvalNote         String?           @map("approval_note") @db.Text
  approvedAt           DateTime?         @map("approved_at") @db.Timestamptz()
  
  // ส่วนของการยกเลิก
  cancelledAt          DateTime?         @map("cancelled_at") @db.Timestamptz()
  cancellationReason   String?           @map("cancellation_reason") @db.Text

  createdAt            DateTime          @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt            DateTime          @updatedAt @map("updated_at") @db.Timestamptz()

  tenant    Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  resource  ReservationResource @relation(fields: [resourceId], references: [id], onDelete: Restrict)
  requester User                @relation("ReservationRequester", fields: [requesterId], references: [id], onDelete: Restrict)
  approver  User?               @relation("ReservationApprover", fields: [approverId], references: [id], onDelete: SetNull)

  @@unique([tenantId, bookingNo])
  @@index([tenantId, resourceId, startTime, endTime, status])
  @@index([tenantId, requesterId])
  @@map("reservations")
}

model ResourceBlackout {
  id         String   @id @default(uuid()) @db.Uuid
  tenantId   String   @map("tenant_id") @db.Uuid
  resourceId String   @map("resource_id") @db.Uuid
  title      String   @db.VarChar(255)
  reason     String?  @db.Text
  startTime  DateTime @map("start_time") @db.Timestamptz()
  endTime    DateTime @map("end_time") @db.Timestamptz()
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz()

  tenant   Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  resource ReservationResource @relation(fields: [resourceId], references: [id], onDelete: Cascade)

  @@index([tenantId, resourceId, startTime, endTime])
  @@map("resource_blackouts")
}
```

---

### 2. Zod Validation Schemas (Input DTOs)

อยู่ใน `src/features/reservations/_internal/validations.ts`:

```ts
import { z } from "zod";

export const createReservationSchema = z
  .object({
    resourceId: z.string().uuid("กรุณาเลือกห้องประชุมหรือยานพาหนะ"),
    title: z.string().min(3, "หัวข้อการใช้งานต้องมีความยาวอย่างน้อย 3 ตัวอักษร").max(255),
    purpose: z.string().min(5, "วัตถุประสงค์ต้องมีความยาวอย่างน้อย 5 ตัวอักษร"),
    attendeesCount: z.coerce.number().int().min(1, "จำนวนผู้เข้าร่วมต้องอย่างน้อย 1 คน"),
    startTime: z.string().datetime("รูปแบบวันเวลาเริ่มต้นไม่ถูกต้อง"),
    endTime: z.string().datetime("รูปแบบวันเวลาสิ้นสุดไม่ถูกต้อง"),
    destination: z.string().max(255).optional().nullable(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น",
    path: ["endTime"],
  })
  .refine(
    (data) => {
      const minStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
      return new Date(data.startTime) >= minStart;
    },
    {
      message: "ต้องจองล่วงหน้าอย่างน้อย 24 ชั่วโมง",
      path: ["startTime"],
    }
  );

export const approveReservationSchema = z.object({
  id: z.string().uuid(),
  approvalNote: z.string().max(500).optional().nullable(),
  driverName: z.string().max(150).optional().nullable(),
  driverPhone: z.string().max(50).optional().nullable(),
  assignedVehiclePlate: z.string().max(50).optional().nullable(),
});

export const rejectReservationSchema = z.object({
  id: z.string().uuid(),
  rejectionReason: z.string().min(5, "กรุณาระบุเหตุผลในการปฏิเสธคำขออย่างน้อย 5 ตัวอักษร"),
});

export const cancelReservationSchema = z.object({
  id: z.string().uuid(),
  cancellationReason: z.string().min(3, "กรุณาระบุเหตุผลในการยกเลิก").optional().nullable(),
});
```

---

### 3. ทะเบียนข้อความสองภาษา (i18n Messages)

สำหรับลงทะเบียนใน `src/features/reservations/messages.ts`:

```ts
export const messages = {
  "reservations.nav.title": { th: "ระบบจองห้องและยานพาหนะ", en: "Facility & Fleet Reservations" },
  "reservations.nav.calendar": { th: "ปฏิทินการจอง", en: "Reservation Calendar" },
  "reservations.nav.my": { th: "รายการจองของฉัน", en: "My Bookings" },
  "reservations.nav.inbox": { th: "คิวงานรออนุมัติ", en: "Approval Inbox" },
  "reservations.nav.resources": { th: "จัดการห้องและยานพาหนะ", en: "Manage Resources" },
  
  // สถานะ
  "reservations.status.pending": { th: "รออนุมัติ", en: "Pending" },
  "reservations.status.approved": { th: "อนุมัติแล้ว", en: "Approved" },
  "reservations.status.rejected": { th: "ปฏิเสธ", en: "Rejected" },
  "reservations.status.cancelled": { th: "ยกเลิกแล้ว", en: "Cancelled" },

  // ประเภททรัพยากร
  "reservations.type.room": { th: "ห้องประชุม", en: "Meeting Room" },
  "reservations.type.vehicle": { th: "ยานพาหนะ", en: "Vehicle" },

  // ฟอร์มและการแจ้งเตือน
  "reservations.form.createTitle": { th: "สร้างคำขอจอง", en: "New Booking Request" },
  "reservations.form.resource": { th: "ทรัพยากรที่ต้องการจอง", en: "Select Resource" },
  "reservations.form.title": { th: "หัวข้อการใช้งาน", en: "Booking Title" },
  "reservations.form.purpose": { th: "วัตถุประสงค์", en: "Purpose" },
  "reservations.form.attendees": { th: "จำนวนผู้เข้าร่วม", en: "Attendees" },
  "reservations.form.destination": { th: "สถานที่ปลายทาง (กรณีรถยนต์)", en: "Destination" },
  "reservations.form.startTime": { th: "วันเวลาเริ่มต้น", en: "Start Time" },
  "reservations.form.endTime": { th: "วันเวลาสิ้นสุด", en: "End Time" },
  "reservations.form.driverName": { th: "ชื่อพนักงานขับรถ", en: "Driver Name" },
  "reservations.form.driverPhone": { th: "เบอร์โทรพนักงานขับรถ", en: "Driver Phone" },
  "reservations.form.note": { th: "หมายเหตุ", en: "Note" },

  // ปุ่มกด
  "reservations.btn.book": { th: "ส่งคำขอจอง", en: "Submit Request" },
  "reservations.btn.approve": { th: "อนุมัติคำขอ", en: "Approve" },
  "reservations.btn.reject": { th: "ปฏิเสธคำขอ", en: "Reject" },
  "reservations.btn.cancel": { th: "ยกเลิกการจอง", en: "Cancel Booking" },

  // ข้อความแจ้งเตือนผลลัพธ์
  "reservations.msg.created": { th: "ส่งคำขอจองเรียบร้อยแล้ว กำลังรอเจ้าหน้าที่พิจารณา", en: "Booking request submitted successfully." },
  "reservations.msg.approved": { th: "อนุมัติคำขอจองเรียบร้อยแล้ว", en: "Booking request approved." },
  "reservations.msg.rejected": { th: "ปฏิเสธคำขอจองเรียบร้อยแล้ว", en: "Booking request rejected." },
  "reservations.msg.cancelled": { th: "ยกเลิกการจองเรียบร้อยแล้ว", en: "Booking cancelled successfully." },
  "reservations.msg.collision": { th: "ช่วงเวลาดังกล่าวมีผู้จองแล้ว หรือติดระยะเวลาเตรียมความพร้อม 30 นาที กรุณาเลือกช่วงเวลาอื่น", en: "Selected time slot or its 30-min buffer conflicts with an existing booking." },
  "reservations.msg.cancelTooLate": { th: "ไม่สามารถยกเลิกได้ เนื่องจากต้องยกเลิกล่วงหน้าอย่างน้อย 2 ชั่วโมง", en: "Cannot cancel: cancellation must be made at least 2 hours in advance." },
} as const;
```
