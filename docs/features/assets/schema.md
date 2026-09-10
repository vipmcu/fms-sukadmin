# Data Model & Validations: Asset & Inventory Management
## โครงสร้างข้อมูลและข้อกำหนดความถูกต้อง

---

### 1. Prisma Models & Enums

```prisma
enum AssetStatus {
  ACTIVE
  IN_USE
  UNDER_REPAIR
  DAMAGED
  DISPOSED
}

enum RequisitionStatus {
  PENDING
  APPROVED
  DISPATCHED
  REJECTED
  CANCELLED
}

model AssetCategory {
  id               String      @id @default(uuid()) @db.Uuid
  tenantId         String      @map("tenant_id") @db.Uuid
  code             String      @db.VarChar(50)
  nameTh           String      @map("name_th") @db.VarChar(255)
  nameEn           String      @map("name_en") @db.VarChar(255)
  depreciationRate Float       @default(0.2) @map("depreciation_rate") // อัตราค่าเสื่อม %
  usefulLifeYears  Int         @default(5) @map("useful_life_years")
  createdAt        DateTime    @default(now()) @map("created_at") @db.Timestamptz()

  tenant           Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  items            AssetItem[]

  @@unique([tenantId, code])
  @@map("asset_categories")
}

model AssetItem {
  id            String            @id @default(uuid()) @db.Uuid
  tenantId      String            @map("tenant_id") @db.Uuid
  categoryId    String            @map("category_id") @db.Uuid
  assetCode     String            @map("asset_code") @db.VarChar(100)
  nameTh        String            @map("name_th") @db.VarChar(255)
  nameEn        String?           @map("name_en") @db.VarChar(255)
  brandModel    String?           @map("brand_model") @db.VarChar(255)
  serialNumber  String?           @map("serial_number") @db.VarChar(100)
  acquiredDate  DateTime?         @map("acquired_date") @db.Date
  acquiredPrice Decimal?          @map("acquired_price") @db.Decimal(12, 2)
  fundingSource String?           @map("funding_source") @db.VarChar(100)
  status        AssetStatus       @default(ACTIVE)
  location      String?           @db.VarChar(255)
  departmentId  String?           @map("department_id") @db.Uuid
  responsibleId String?           @map("responsible_id") @db.Uuid
  createdAt     DateTime          @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime          @updatedAt @map("updated_at") @db.Timestamptz()

  tenant        Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  category      AssetCategory     @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  department    Department?       @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  responsible   PersonnelProfile? @relation(fields: [responsibleId], references: [id], onDelete: SetNull)
  transactions  AssetTransaction[]

  @@unique([tenantId, assetCode])
  @@index([tenantId, status, categoryId])
  @@map("asset_items")
}

model AssetTransaction {
  id         String   @id @default(uuid()) @db.Uuid
  assetId    String   @map("asset_id") @db.Uuid
  actionType String   @map("action_type") @db.VarChar(50)
  fromValue  String?  @map("from_value") @db.Text
  toValue    String?  @map("to_value") @db.Text
  remarks    String?  @db.Text
  actorId    String   @map("actor_id") @db.Uuid
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz()

  asset AssetItem @relation(fields: [assetId], references: [id], onDelete: Cascade)
  actor User      @relation(fields: [actorId], references: [id], onDelete: Restrict)

  @@index([assetId, createdAt])
  @@map("asset_transactions")
}

model SupplyItem {
  id           String   @id @default(uuid()) @db.Uuid
  tenantId     String   @map("tenant_id") @db.Uuid
  code         String   @db.VarChar(50)
  nameTh       String   @map("name_th") @db.VarChar(255)
  unit         String   @db.VarChar(50)
  currentStock Int      @default(0) @map("current_stock")
  minStock     Int      @default(10) @map("min_stock")
  unitCost     Decimal? @map("unit_cost") @db.Decimal(10, 2)
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt    DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, code])
  @@map("supply_items")
}
```

---

### 2. Zod Validation Schemas

```ts
export const createAssetItemSchema = z.object({
  categoryId: z.string().uuid(),
  assetCode: z.string().min(3).max(100),
  nameTh: z.string().min(2).max(255),
  nameEn: z.string().max(255).optional(),
  brandModel: z.string().max(255).optional(),
  serialNumber: z.string().max(100).optional(),
  acquiredDate: z.string().optional(),
  acquiredPrice: z.number().nonnegative().optional(),
  fundingSource: z.string().max(100).optional(),
  status: z.enum(["ACTIVE", "IN_USE", "UNDER_REPAIR", "DAMAGED", "DISPOSED"]).default("ACTIVE"),
  location: z.string().max(255).optional(),
  departmentId: z.string().uuid().optional(),
  responsibleId: z.string().uuid().optional(),
});
```
