# Data Model & Validations: Maintenance & Service Desk
## โครงสร้างข้อมูลและข้อกำหนดความถูกต้อง

---

### 1. Prisma Models & Enums

```prisma
enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum TicketStatus {
  OPEN
  ASSIGNED
  IN_PROGRESS
  WAITING_PARTS
  RESOLVED
  CANCELLED
}

model ServiceCategory {
  id              String          @id @default(uuid()) @db.Uuid
  tenantId        String          @map("tenant_id") @db.Uuid
  code            String          @db.VarChar(50)
  nameTh          String          @map("name_th") @db.VarChar(255)
  nameEn          String          @map("name_en") @db.VarChar(255)
  defaultSlaHours Int             @default(24) @map("default_sla_hours")
  icon            String?         @db.VarChar(50)
  createdAt       DateTime        @default(now()) @map("created_at") @db.Timestamptz()

  tenant          Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  tickets         ServiceTicket[]

  @@unique([tenantId, code])
  @@map("service_categories")
}

model ServiceTicket {
  id                   String              @id @default(uuid()) @db.Uuid
  tenantId             String              @map("tenant_id") @db.Uuid
  ticketNo             String              @map("ticket_no") @db.VarChar(50)
  categoryId           String              @map("category_id") @db.Uuid
  title                String              @db.VarChar(255)
  description          String              @db.Text
  location             String              @db.VarChar(255)
  resourceId           String?             @map("resource_id") @db.Uuid
  assetId              String?             @map("asset_id") @db.Uuid
  priority             TicketPriority      @default(MEDIUM)
  status               TicketStatus        @default(OPEN)
  /// string[] URLs
  photos               Json                @default("[]") @db.JsonB
  completionPhotos     Json                @default("[]") @map("completion_photos") @db.JsonB
  requesterName        String              @map("requester_name") @db.VarChar(255)
  requesterEmail       String              @map("requester_email") @db.VarChar(255)
  requesterPhone       String              @map("requester_phone") @db.VarChar(50)
  assignedTechnicianId String?             @map("assigned_technician_id") @db.Uuid
  slaDeadline          DateTime?           @map("sla_deadline") @db.Timestamptz()
  resolvedAt           DateTime?           @map("resolved_at") @db.Timestamptz()
  resolutionNotes      String?             @map("resolution_notes") @db.Text
  partsCost            Decimal?            @map("parts_cost") @db.Decimal(10, 2)
  createdAt            DateTime            @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt            DateTime            @updatedAt @map("updated_at") @db.Timestamptz()

  tenant               Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  category             ServiceCategory     @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  resource             ReservationResource? @relation(fields: [resourceId], references: [id], onDelete: SetNull)
  asset                AssetItem?          @relation(fields: [assetId], references: [id], onDelete: SetNull)
  technician           User?               @relation("AssignedTechnician", fields: [assignedTechnicianId], references: [id], onDelete: SetNull)
  comments             TicketComment[]
  rating               TicketRating?

  @@unique([tenantId, ticketNo])
  @@index([tenantId, status, priority, categoryId])
  @@map("service_tickets")
}

model TicketComment {
  id         String        @id @default(uuid()) @db.Uuid
  ticketId   String        @map("ticket_id") @db.Uuid
  authorId   String?       @map("author_id") @db.Uuid
  authorName String        @map("author_name") @db.VarChar(255)
  message    String        @db.Text
  isInternal Boolean       @default(false) @map("is_internal")
  createdAt  DateTime      @default(now()) @map("created_at") @db.Timestamptz()

  ticket     ServiceTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  author     User?         @relation(fields: [authorId], references: [id], onDelete: SetNull)

  @@index([ticketId, createdAt])
  @@map("ticket_comments")
}

model TicketRating {
  id        String        @id @default(uuid()) @db.Uuid
  ticketId  String        @unique @map("ticket_id") @db.Uuid
  score     Int           @map("score") // 1 to 5
  feedback  String?       @db.Text
  createdAt DateTime      @default(now()) @map("created_at") @db.Timestamptz()

  ticket    ServiceTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@map("ticket_ratings")
}
```

---

### 2. Zod Validation Schemas

```ts
export const createServiceTicketSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(3).max(255),
  description: z.string().min(5),
  location: z.string().min(2).max(255),
  resourceId: z.string().uuid().optional(),
  assetId: z.string().uuid().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  requesterName: z.string().min(2).max(255),
  requesterEmail: z.string().email(),
  requesterPhone: z.string().min(9).max(50),
  photos: z.array(z.string().url()).max(3).optional().default([]),
});

export const resolveTicketSchema = z.object({
  resolutionNotes: z.string().min(5, "ต้องระบุแนวทางและผลการแก้ไขอย่างน้อย 5 ตัวอักษร"),
  partsCost: z.number().nonnegative().optional(),
  completionPhotos: z.array(z.string().url()).max(3).optional().default([]),
});
```
