# Data Model, Schemas & Dictionary
## ระบบจัดการบุคลากร (Personnel Directory)

---

### 1. Prisma Data Models & Enums

```prisma
enum PersonnelType {
  ACADEMIC
  SUPPORT
}

enum AcademicPosition {
  NONE
  LECTURER
  ASST_PROF
  ASSOC_PROF
  PROF
}

model Department {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @map("tenant_id") @db.Uuid
  code      String   @db.VarChar(50)
  nameTh    String   @map("name_th") @db.VarChar(255)
  nameEn    String   @map("name_en") @db.VarChar(255)
  order     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  tenant    Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  personnel PersonnelProfile[]
  programs  AcademicProgram[]
  assetItems AssetItem[]

  @@unique([tenantId, code])
  @@map("departments")
}

model PersonnelProfile {
  id               String           @id @default(uuid()) @db.Uuid
  tenantId         String           @map("tenant_id") @db.Uuid
  departmentId     String           @map("department_id") @db.Uuid
  userId           String?          @unique @map("user_id") @db.Uuid
  type             PersonnelType    @default(ACADEMIC)
  academicPosition AcademicPosition @default(NONE) @map("academic_position")
  prefixTh         String           @map("prefix_th") @db.VarChar(50)
  prefixEn         String?          @map("prefix_en") @db.VarChar(50)
  firstNameTh      String           @map("first_name_th") @db.VarChar(100)
  lastNameTh       String           @map("last_name_th") @db.VarChar(100)
  firstNameEn      String?          @map("first_name_en") @db.VarChar(100)
  lastNameEn       String?          @map("last_name_en") @db.VarChar(100)
  email            String?          @db.VarChar(255)
  phone            String?          @db.VarChar(50)
  officeRoom       String?          @map("office_room") @db.VarChar(100)
  avatarUrl        String?          @map("avatar_url") @db.VarChar(500)
  /// [{ degree: string, field: string, institute: string, year?: string }]
  education        Json             @default("[]") @db.JsonB
  /// string[]
  expertise        Json             @default("[]") @db.JsonB
  /// [{ title: string, year?: string, journal?: string, link?: string }]
  publications     Json             @default("[]") @db.JsonB
  order            Int              @default(0)
  isActive         Boolean          @default(true) @map("is_active")
  createdAt        DateTime         @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt        DateTime         @updatedAt @map("updated_at") @db.Timestamptz()

  tenant            Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  department        Department  @relation(fields: [departmentId], references: [id], onDelete: Restrict)
  user              User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  responsibleAssets AssetItem[]

  @@index([tenantId, departmentId, type, isActive])
  @@map("personnel_profiles")
}
```

---

### 2. Zod Validation Schemas

```ts
personnelTypeEnum = z.enum(["ACADEMIC", "SUPPORT"])
academicPositionEnum = z.enum(["NONE", "LECTURER", "ASST_PROF", "ASSOC_PROF", "PROF"])

createDepartmentSchema = {
  code: z.string().min(2).max(50),
  nameTh / nameEn: z.string().min(1).max(255),
  order: z.number().int().default(0),
}
updateDepartmentSchema = createDepartmentSchema + { id: z.string().uuid() }

createPersonnelSchema = {
  departmentId: z.string().uuid(),
  userId: z.string().uuid().optional().nullable(),
  type: personnelTypeEnum.default("ACADEMIC"),
  academicPosition: academicPositionEnum.default("NONE"),
  prefixTh: z.string().min(1).max(50),
  firstNameTh / lastNameTh: z.string().min(1).max(100),
  prefixEn / firstNameEn / lastNameEn: optional,
  email: z.string().email().or(z.literal("")).optional().nullable(),
  phone: max 50 optional,
  officeRoom: max 100 optional,
  avatarUrl: url or "",
  education: z.array(z.record(...)).default([]),
  expertise: z.array(z.string()).default([]),
  publications: z.array(z.record(...)).default([]),
  order: int default 0,
  isActive: boolean default true,
}
updatePersonnelSchema = createPersonnelSchema + { id: z.string().uuid() }
```

---

### 3. คีย์คำแปลใน `messages.ts`

| Key | th | en |
| :--- | :--- | :--- |
| `personnel.nav` | จัดการบุคลากร | Personnel Directory |
| `personnel.title` | ระบบจัดการข้อมูลบุคลากร | Personnel Directory |
| `personnel.subtitle` | ทำเนียบคณาจารย์และบุคลากรสายสนับสนุนประจำคณะ | Faculty members and administrative support staff directory |
| `personnel.tab.all` | บุคลากรทั้งหมด | All Personnel |
| `personnel.tab.academic` | สายวิชาการ (คณาจารย์) | Academic Staff |
| `personnel.tab.support` | สายสนับสนุนวิชาการ | Support Staff |
| `personnel.tab.departments` | ภาควิชา / สาขาวิชา | Departments |
| `personnel.type.academic` | สายวิชาการ | Academic |
| `personnel.type.support` | สายสนับสนุน | Support |
| `personnel.pos.none` | — | — |
| `personnel.pos.lecturer` | อาจารย์ | Lecturer |
| `personnel.pos.asst_prof` | ผู้ช่วยศาสตราจารย์ (ผศ.) | Assistant Professor |
| `personnel.pos.assoc_prof` | รองศาสตราจารย์ (รศ.) | Associate Professor |
| `personnel.pos.prof` | ศาสตราจารย์ (ศ.) | Professor |
| `personnel.pos.asstProf` | ผู้ช่วยศาสตราจารย์ (ผศ.) | Assistant Professor |
| `personnel.pos.assocProf` | รองศาสตราจารย์ (รศ.) | Associate Professor |
| `personnel.field.name` | ชื่อ - นามสกุล | Name - Surname |
| `personnel.field.department` | ภาควิชา / สังกัด | Department |
| `personnel.field.position` | ตำแหน่งทางวิชาการ | Academic Position |
| `personnel.field.type` | สายงาน | Staff Type |
| `personnel.field.email` | อีเมล | Email |
| `personnel.field.phone` | เบอร์โทรศัพท์ / เบอร์ภายใน | Phone / Extension |
| `personnel.field.officeRoom` | ห้องพักอาจารย์ | Office Room |
| `personnel.field.expertise` | ความเชี่ยวชาญ | Areas of Expertise |
| `personnel.field.education` | ประวัติการศึกษา | Education |
| `personnel.field.status` | สถานะ | Status |
| `personnel.btn.create` | เพิ่มบุคลากรใหม่ | Add Personnel |
| `personnel.btn.edit` | แก้ไขข้อมูล | Edit |
| `personnel.btn.delete` | ลบ | Delete |
| `personnel.msg.created` | บันทึกข้อมูลบุคลากรใหม่เรียบร้อยแล้ว | Personnel created successfully |
| `personnel.msg.updated` | อัปเดตข้อมูลบุคลากรเรียบร้อยแล้ว | Personnel updated successfully |
| `personnel.msg.deleted` | ลบข้อมูลบุคลากรเรียบร้อยแล้ว | Personnel deleted successfully |
| `personnel.msg.empty` | ไม่พบข้อมูลบุคลากร | No personnel found |
| `roles.module.personnel` | ระบบจัดการข้อมูลบุคลากร | Personnel Directory |
| `perm.personnel:read` | ดูข้อมูลบุคลากรและทำเนียบ | View personnel directory |
| `perm.personnel:create` | เพิ่มข้อมูลบุคลากรใหม่ | Create new personnel profile |
| `perm.personnel:edit` | แก้ไขข้อมูลบุคลากร | Edit personnel profile |
| `perm.personnel:manage` | จัดการข้อมูลบุคลากรและภาควิชาทั้งหมด | Manage personnel and departments |
