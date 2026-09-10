# Implementation Plan: Asset & Inventory Management
## แผนปฏิบัติการพัฒนาฟีเจอร์พัสดุและครุภัณฑ์

---

### Step 1: Database Model & Migration
- [ ] 1.1 เพิ่มโมเดล `AssetCategory`, `AssetItem`, `AssetTransaction`, `SupplyItem` ใน `prisma/schema.prisma`
- [ ] 1.2 รัน `npx prisma migrate dev --name add_assets_inventory_module`
- [ ] 1.3 อัปเดต `prisma/seed.ts` ให้มีข้อมูลหมวดหมู่ครุภัณฑ์และวัสดุตัวอย่าง

### Step 2: Internal Services & Validations
- [ ] 2.1 สร้าง Zod Schemas ใน `src/features/assets/_internal/validations.ts`
- [ ] 2.2 สร้าง Unit Test ใน `src/features/assets/_internal/validations.test.ts`
- [ ] 2.3 พัฒนา CRUD Services ใน `src/features/assets/_internal/services.ts`
  - `listAssetItems`, `getAssetById`, `createAssetItem`, `updateAssetItem`
  - `transferAsset`, `disposeAsset`, `listSupplyItems`, `requisitionSupply`

### Step 3: Server Actions & Central Integrations
- [ ] 3.1 สร้าง Permissions ใน `src/features/assets/permissions.ts` และลงทะเบียนใน `src/permissions.ts`
- [ ] 3.2 สร้าง Dictionary ข้อความสองภาษาใน `src/features/assets/messages.ts` และลงทะเบียนใน `src/i18n/index.ts`
- [ ] 3.3 สร้าง Server Actions ใน `src/features/assets/_internal/actions.ts`
- [ ] 3.4 สร้าง Public Barrel Files (`index.ts`, `server.ts`, `actions.ts`)

### Step 4: Admin Console & Portal UI
- [ ] 4.1 พัฒนาหน้าทะเบียนครุภัณฑ์ `/inventory/assets` และฟอร์มสร้าง/แก้ไขครุภัณฑ์
- [ ] 4.2 พัฒนาระบบสร้างและพิมพ์สติกเกอร์ QR Code ประจำครุภัณฑ์
- [ ] 4.3 พัฒนาหน้าจัดการสต็อกวัสดุสิ้นเปลือง `/inventory/supplies`
- [ ] 4.4 พัฒนาหน้าแสดงข้อมูลย่อเมื่อสแกน QR Code `/asset-qr/[id]`
- [ ] 4.5 เพิ่มปุ่มเมนูใน `src/components/layout/sidebar-nav.ts`

### Step 5: Quality Gate & Verification
- [ ] 5.1 รัน `npm run type-check` และ `npm run lint`
- [ ] 5.2 รัน `npm run deps:check` ตรวจสอบขอบเขตโมดูล
- [ ] 5.3 รัน `npm run test` และ `npm run test:integration`
