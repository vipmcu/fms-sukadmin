# AI Coding Instructions & Rules: Documents Feature
## กฎเหล็กสำหรับ AI เมื่อเขียนหรือแก้โมดูลเอกสารและอนุมัติ

ปฏิบัติตาม `AGENTS.md` และกฎด้านล่างทุกครั้งที่แตะ `src/features/documents/`

---

### 1. ขอบเขตโมดูล

1. Logic รวม `workflow.ts` อยู่ใน `src/features/documents/_internal/`
2. Public API: `index.ts`, `server.ts`, `actions.ts` — helper ใน `workflow.ts` ไม่ export ออกนอกโมดูล
3. ไฟล์นอกโมดูลที่อนุญาต: `prisma/schema.prisma`, `src/permissions.ts`, `src/i18n/index.ts`, `src/app/(admin)/documents/**`, sidebar-nav
4. ถ้าจะมีหน้าบ้าน ให้สร้างใต้ `src/app/(portal)/...` และเรียกผ่าน public API เท่านั้น

---

### 2. Multi-tenancy และความปลอดภัย

1. `tenantId` / `requesterId` / `approverId` จาก session
2. Mapping สิทธิ์:
   - เปิดหน้า: `DOCUMENTS_P.read`
   - ยื่นและยกเลิกของตนเอง: `DOCUMENTS_P.create`
   - อนุมัติ/ปฏิเสธ: `DOCUMENTS_P.approve`
   - ประเภทเอกสาร: `DOCUMENTS_P.manage`
3. ยกเลิกตรวจ `requesterId === ctx.userId`
4. พิจารณาได้เฉพาะเมื่อ `canReviewDocument(status)`

---

### 3. Server Actions และ Validation

1. `runAction()` + Zod + `zodErrorMap`
2. ปฏิเสธต้องมี `rejectionReason` ความยาวอย่างน้อย 1
3. Mutation สถานะเรียก `writeAudit` ในทรานแซกชันเดียวกับข้อมูลเอกสาร
4. `revalidatePath("/documents")`
5. เลขที่เอกสารสร้างฝั่งเซิร์ฟเวอร์เท่านั้น

---

### 4. i18n และ UI

1. `t("documents.<key>")` ทั้ง TH/EN รวมแท็บและสถานะ — อย่าฮาร์ดโค้ดป้ายภาษาไทยใน client
2. `@/shared/components/liyon`
3. Status pill: SUBMITTED/IN_REVIEW = warning, APPROVED = success, REJECTED = danger, CANCELLED/DRAFT = neutral

---

### 5. สิ่งที่ต้องรักษา

- เปลี่ยนสถานะผ่าน `workflow.ts` (`canReviewDocument`, `canCancelDocument`, `calculateApprovalTransition`)
- เพิ่มเทสต์ใน `workflow.test.ts` เมื่อเปลี่ยนกฎ
- อย่าให้ผู้อนุมัติข้ามขั้นหรือข้าม `canReviewDocument`
- อย่าแก้ `src/shared/styles/liyon/`
- ส่งงานเมื่อ `npm run check` ผ่าน
