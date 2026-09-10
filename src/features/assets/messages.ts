import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  "assets.nav": { th: "พัสดุและครุภัณฑ์", en: "Assets & Inventory" },
  "assets.nav.items": { th: "ทะเบียนครุภัณฑ์", en: "Asset Registry" },
  "assets.nav.supplies": { th: "คลังวัสดุสิ้นเปลือง", en: "Consumable Supplies" },
  "assets.title": { th: "ระบบบริหารจัดการพัสดุและครุภัณฑ์", en: "Asset & Inventory Management" },
  "assets.subtitle": { th: "ทะเบียนครุภัณฑ์ ตรวจสอบสถานะ และการควบคุมคลังวัสดุสิ้นเปลือง", en: "Asset registry, status tracking, and consumable inventory control" },

  // Statuses
  "assets.status.active": { th: "พร้อมใช้งาน", en: "Active" },
  "assets.status.in_use": { th: "กำลังใช้งาน", en: "In Use" },
  "assets.status.under_repair": { th: "อยู่ระหว่างซ่อม", en: "Under Repair" },
  "assets.status.damaged": { th: "ชำรุดรอจำหน่าย", en: "Damaged" },
  "assets.status.disposed": { th: "แทงจำหน่ายแล้ว", en: "Disposed" },

  // Fields
  "assets.field.code": { th: "รหัสครุภัณฑ์", en: "Asset Code" },
  "assets.field.nameTh": { th: "ชื่อครุภัณฑ์ (ภาษาไทย)", en: "Asset Name (Thai)" },
  "assets.field.nameEn": { th: "ชื่อครุภัณฑ์ (ภาษาอังกฤษ)", en: "Asset Name (English)" },
  "assets.field.category": { th: "หมวดหมู่", en: "Category" },
  "assets.field.brandModel": { th: "ยี่ห้อ / รุ่น / สเปก", en: "Brand / Model" },
  "assets.field.serialNumber": { th: "Serial Number", en: "Serial Number" },
  "assets.field.price": { th: "ราคาจัดซื้อ (บาท)", en: "Acquired Price (THB)" },
  "assets.field.fundingSource": { th: "แหล่งเงินงบประมาณ", en: "Funding Source" },
  "assets.field.acquiredDate": { th: "วันที่ได้มา / ตรวจรับ", en: "Acquired Date" },
  "assets.field.location": { th: "สถานที่ตั้ง / ห้อง", en: "Location" },
  "assets.field.department": { th: "หน่วยงาน / ภาควิชา", en: "Department" },
  "assets.field.responsible": { th: "ผู้ถือครองรับผิดชอบ", en: "Responsible Staff" },
  "assets.field.status": { th: "สถานะ", en: "Status" },

  // Supplies Fields
  "assets.supplies.code": { th: "รหัสวัสดุ", en: "Item Code" },
  "assets.supplies.name": { th: "ชื่อวัสดุสิ้นเปลือง", en: "Item Name" },
  "assets.supplies.unit": { th: "หน่วยนับ", en: "Unit" },
  "assets.supplies.currentStock": { th: "คงเหลือในคลัง", en: "Current Stock" },
  "assets.supplies.minStock": { th: "จุดเตือนสั่งซื้อ", en: "Safety Stock Level" },
  "assets.supplies.unitCost": { th: "ราคาต่อหน่วย", en: "Unit Cost" },
  "assets.supplies.lowStockWarning": { th: "สต็อกใกล้หมด กรุณาสั่งซื้อเพิ่ม", en: "Low stock alert" },

  // Actions
  "assets.btn.create": { th: "ลงทะเบียนครุภัณฑ์", en: "Add Asset" },
  "assets.btn.createSupply": { th: "เพิ่มรายการวัสดุ", en: "Add Supply Item" },
  "assets.btn.edit": { th: "แก้ไข", en: "Edit" },
  "assets.btn.delete": { th: "ลบ", en: "Delete" },
  "assets.btn.save": { th: "บันทึกข้อมูล", en: "Save" },
  "assets.btn.printQr": { th: "พิมพ์ฉลาก QR Code", en: "Print QR Label" },
  "assets.btn.transfer": { th: "โอนย้ายสถานที่/ผู้ถือครอง", en: "Transfer" },
  "assets.btn.adjustStock": { th: "ปรับยอดสต็อก", en: "Adjust Stock" },

  // Messages
  "assets.msg.created": { th: "ลงทะเบียนครุภัณฑ์สำเร็จ", en: "Asset registered successfully" },
  "assets.msg.updated": { th: "อัปเดตข้อมูลครุภัณฑ์เรียบร้อยแล้ว", en: "Asset updated successfully" },
  "assets.msg.deleted": { th: "ลบรายการครุภัณฑ์สำเร็จ", en: "Asset deleted successfully" },
  "assets.msg.supplyCreated": { th: "เพิ่มรายการวัสดุสิ้นเปลืองสำเร็จ", en: "Supply item created" },
  "assets.msg.supplyUpdated": { th: "ปรับปรุงยอดคลังวัสดุสำเร็จ", en: "Stock updated successfully" },
  "assets.msg.empty": { th: "ไม่พบข้อมูลครุภัณฑ์", en: "No assets found" },
  "assets.msg.emptySupplies": { th: "ไม่พบข้อมูลวัสดุสิ้นเปลือง", en: "No supplies found" },

  // RBAC & Permissions Dictionary
  "roles.module.assets": { th: "ระบบพัสดุและครุภัณฑ์", en: "Asset & Inventory Management" },
  "perm.assets:read": { th: "ดูรายการครุภัณฑ์และวัสดุสิ้นเปลือง", en: "View assets and supplies" },
  "perm.assets:create": { th: "ลงทะเบียนครุภัณฑ์และวัสดุใหม่", en: "Register new assets and supplies" },
  "perm.assets:edit": { th: "แก้ไขข้อมูลครุภัณฑ์และสต็อกวัสดุ", en: "Edit asset details and supply stock" },
  "perm.assets:delete": { th: "ลบรายการครุภัณฑ์", en: "Delete asset items" },
  "perm.assets:transfer": { th: "โอนย้ายสถานที่และผู้ถือครองครุภัณฑ์", en: "Transfer asset location and custodian" },
  "perm.assets:dispose": { th: "อนุมัติแทงจำหน่ายครุภัณฑ์", en: "Approve asset disposal" },
  "perm.assets:supplies_manage": { th: "บริหารคลังและการรับเข้า/ตัดจ่ายวัสดุ", en: "Manage supply inventory and adjustments" },
};
