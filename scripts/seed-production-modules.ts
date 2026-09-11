import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "../prisma/lib/seed-core";

const connectionString = process.env.DATABASE_URL 
  || process.env.DB_POSTGRES_URL 
  || process.env.DB_DATABASE_URL 
  || process.env.POSTGRES_URL 
  || "postgresql://fms_admin:fms_prod_password_secure_2026!@127.0.0.1:5433/fms_production?schema=public";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  console.log("🚀 Starting master data seeding for MCU Buddhasothorn...");
  
  const core = await seedCore(prisma, {
    tenantCode: "DEFAULT",
    nameTh: "วิทยาลัยสงฆ์พุทธโสธร",
    nameEn: "MCU Buddhasothorn College",
  });
  const tenantId = core.tenantId;
  console.log(`Using Tenant: วิทยาลัยสงฆ์พุทธโสธร (${tenantId})`);

  // Ensure Super Admins
  const defaultPasswordHash = await bcrypt.hash("SuperAdminPassword2026!", 12);
  await seedUser(prisma, tenantId, {
    email: "admin@faculty.ac.th",
    name: "Super Admin",
    passwordHash: defaultPasswordHash,
    roleIds: [core.roleIds.SUPER_ADMIN],
    mustChangePassword: false,
  });

  await seedUser(prisma, tenantId, {
    email: "prasopsuk.suk@mcu.ac.th",
    name: "Prasopsuk Suk (Super Admin)",
    passwordHash: defaultPasswordHash,
    roleIds: [core.roleIds.SUPER_ADMIN],
    mustChangePassword: false,
  });

  const adminUser = await prisma.user.findFirst({ where: { email: "prasopsuk.suk@mcu.ac.th" } }) 
    || await prisma.user.findFirst({ where: { email: "admin@faculty.ac.th" } });
  if (!adminUser) throw new Error("Admin user not found");

  // 1. News Categories
  console.log("📰 Seeding News Categories & Articles...");
  const catGeneral = await prisma.newsCategory.upsert({
    where: { tenantId_slug: { tenantId, slug: "general" } },
    update: {},
    create: {
      tenantId,
      slug: "general",
      nameTh: "ข่าวประชาสัมพันธ์ทั่วไป",
      nameEn: "General Announcements",
      color: "blue",
      order: 1,
    },
  });

  const catAcademic = await prisma.newsCategory.upsert({
    where: { tenantId_slug: { tenantId, slug: "academic" } },
    update: {},
    create: {
      tenantId,
      slug: "academic",
      nameTh: "ข่าววิชาการและงานวิจัย",
      nameEn: "Academic & Research",
      color: "emerald",
      order: 2,
    },
  });

  const catActivity = await prisma.newsCategory.upsert({
    where: { tenantId_slug: { tenantId, slug: "activities" } },
    update: {},
    create: {
      tenantId,
      slug: "activities",
      nameTh: "กิจกรรมและบริการสังคม",
      nameEn: "Activities & Community Service",
      color: "amber",
      order: 3,
    },
  });

  await prisma.newsArticle.upsert({
    where: { tenantId_slug: { tenantId, slug: "national-symposium-sothorn-2026" } },
    update: {},
    create: {
      tenantId,
      categoryId: catAcademic.id,
      slug: "national-symposium-sothorn-2026",
      titleTh: "ขอเชิญร่วมงานสัมมนาวิชาการระดับชาติด้านพระพุทธศาสนาและการบริหารจัดการร่วมสมัย ประจำปี 2569",
      titleEn: "National Academic Symposium on Buddhism & Contemporary Management 2026",
      contentTh: `วิทยาลัยสงฆ์พุทธโสธร มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ขอเชิญคณาจารย์ นักวิจัย พระภิกษุสามเณร และประชาชนทั่วไป ร่วมงานประชุมสัมมนาวิชาการระดับชาติ เพื่อขับเคลื่อนองค์ความรู้ทางพระพุทธศาสนาสู่นวัตกรรมทางสังคม\n\n### กำหนดการสำคัญ\n- จัดขึ้น ณ หอประชุมใหญ่ วิทยาลัยสงฆ์พุทธโสธร\n- มีการบรรยายพิเศษจากผู้ทรงคุณวุฒิ และนำเสนอบทความวิชาการดีเด่น`,
      contentEn: "Join us for the National Academic Symposium at Buddhasothorn Buddhist College.",
      excerptTh: "งานสัมมนาวิชาการระดับชาติ แลกเปลี่ยนองค์ความรู้พุทธบริหารจัดการและนวัตกรรมเพื่อการพัฒนาสังคม",
      excerptEn: "National symposium featuring research and discussions on Buddhist administration.",
      coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      isPinned: true,
      viewCount: 230,
      publishedAt: new Date(),
      authorId: adminUser.id,
    },
  });

  await prisma.newsArticle.upsert({
    where: { tenantId_slug: { tenantId, slug: "admission-tcas-2569" } },
    update: {},
    create: {
      tenantId,
      categoryId: catGeneral.id,
      slug: "admission-tcas-2569",
      titleTh: "ประกาศเปิดรับสมัครนิสิตใหม่ระดับปริญญาตรี ประจำปีการศึกษา 2569 (ทุกสาขาวิชา)",
      titleEn: "Undergraduate Admission for Academic Year 2026",
      contentTh: "วิทยาลัยสงฆ์พุทธโสธร เปิดรับสมัครบุคคลทั่วไป พระภิกษุ และสามเณร เข้าศึกษาต่อระดับปริญญาตรี สาขาวิชาพระพุทธศาสนา สาขาวิชารัฐประศาสนศาสตร์ และสาขาวิชาการสอนพระพุทธศาสนา ผู้สนใจสามารถกรอกใบสมัครออนไลน์ได้แล้ววันนี้",
      contentEn: "Admissions open for undergraduate programs for academic year 2026.",
      excerptTh: "เปิดรับสมัครนิสิตใหม่ ปีการศึกษา 2569 สมัครเรียนออนไลน์พร้อมรับทุนการศึกษา",
      excerptEn: "Admissions now open for academic year 2026.",
      coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      isPinned: true,
      viewCount: 450,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      authorId: adminUser.id,
    },
  });

  // 2. Departments
  console.log("🏛️ Seeding Departments...");
  const deptBuddhism = await prisma.department.upsert({
    where: { tenantId_code: { tenantId, code: "DEPT-BUDDHISM" } },
    update: {},
    create: {
      tenantId,
      code: "DEPT-BUDDHISM",
      nameTh: "ภาควิชาพระพุทธศาสนาและปรัชญา",
      nameEn: "Department of Buddhism & Philosophy",
      order: 1,
    },
  });

  const deptPA = await prisma.department.upsert({
    where: { tenantId_code: { tenantId, code: "DEPT-PA" } },
    update: {},
    create: {
      tenantId,
      code: "DEPT-PA",
      nameTh: "ภาควิชารัฐประศาสนศาสตร์และการจัดการ",
      nameEn: "Department of Public Administration & Management",
      order: 2,
    },
  });

  const deptOffice = await prisma.department.upsert({
    where: { tenantId_code: { tenantId, code: "DEPT-OFFICE" } },
    update: {},
    create: {
      tenantId,
      code: "DEPT-OFFICE",
      nameTh: "สำนักงานวิทยาลัยสงฆ์พุทธโสธร",
      nameEn: "Office of the College",
      order: 3,
    },
  });

  // 3. Academic Programs
  console.log("🎓 Seeding Academic Programs...");
  await prisma.academicProgram.upsert({
    where: { tenantId_code: { tenantId, code: "B-BUDDHISM" } },
    update: {},
    create: {
      tenantId,
      code: "B-BUDDHISM",
      level: "BACHELOR",
      nameTh: "หลักสูตรพุทธศาสตรบัณฑิต (พธ.บ.) สาขาวิชาพระพุทธศาสนา",
      nameEn: "Bachelor of Arts in Buddhism (B.A.)",
      degreeTh: "พุทธศาสตรบัณฑิต (พระพุทธศาสนา) พธ.บ.",
      degreeEn: "Bachelor of Arts (Buddhism) B.A.",
      departmentId: deptBuddhism.id,
      totalCredits: 130,
      durationYears: 4,
      tuitionFeePerTerm: 12000,
      descriptionTh: "ศึกษาหลักพุทธธรรม คัมภีร์พระไตรปิฎก ประวัติศาสตร์และปรัชญาพระพุทธศาสนา เพื่อประยุกต์ใช้ในการดำเนินชีวิต การบริหารองค์กร และการสร้างสันติสุขในสังคม",
      descriptionEn: "Comprehensive study of Buddhist doctrines, Tipitaka, and ethical leadership.",
      careerOpportunities: [
        "พระธรรมทูตและนักวิชาการศาสนา",
        "อาจารย์และครูสอนวิชาศีลธรรมและจริยธรรม",
        "นักพัฒนาสังคมและชุมชน",
        "เจ้าหน้าที่องค์กรภาครัฐและเอกชน",
      ],
      isAcceptingApplications: true,
      isActive: true,
      order: 1,
    },
  });

  await prisma.academicProgram.upsert({
    where: { tenantId_code: { tenantId, code: "B-PA" } },
    update: {},
    create: {
      tenantId,
      code: "B-PA",
      level: "BACHELOR",
      nameTh: "หลักสูตรรัฐประศาสนศาสตรบัณฑิต (รป.บ.) สาขาวิชารัฐประศาสนศาสตร์",
      nameEn: "Bachelor of Public Administration (B.P.A.)",
      degreeTh: "รัฐประศาสนศาสตรบัณฑิต (รัฐประศาสนศาสตร์) รป.บ.",
      degreeEn: "Bachelor of Public Administration (B.P.A.)",
      departmentId: deptPA.id,
      totalCredits: 132,
      durationYears: 4,
      tuitionFeePerTerm: 15000,
      descriptionTh: "มุ่งสร้างนักบริหารภาครัฐและท้องถิ่นที่มีคุณธรรม มีความรอบรู้ด้านนโยบายสาธารณะ การบริหารทรัพยากรมนุษย์ และการกำกับดูแลตามหลักธรรมาภิบาล",
      descriptionEn: "Cultivating ethical public administrators with strategic management skills.",
      careerOpportunities: [
        "ปลัดอำเภอและเจ้าพนักงานปกครอง",
        "นักวิเคราะห์นโยบายและแผน",
        "เจ้าหน้าที่บริหารงานทั่วไปในองค์กรปกครองส่วนท้องถิ่น",
        "ผู้จัดการฝ่ายบุคคลและองค์กร",
      ],
      isAcceptingApplications: true,
      isActive: true,
      order: 2,
    },
  });

  // 4. Reservation Resources
  console.log("📅 Seeding Reservation Resources (Rooms & Vehicles)...");
  await prisma.reservationResource.upsert({
    where: { tenantId_code: { tenantId, code: "RM-101" } },
    update: {},
    create: {
      tenantId,
      code: "RM-101",
      type: "ROOM",
      nameTh: "ห้องประชุมโสธร 1 (ห้องประชุมใหญ่)",
      nameEn: "Sothorn Conference Room 1",
      capacity: 60,
      locationOrPlate: "อาคารเรียนรวม ชั้น 2",
      amenities: { projector: true, soundSystem: true, videoConference: true, micCount: 6 },
      descriptionTh: "ห้องประชุมใหญ่สำหรับประชุมวิชาการ สัมมนา และการประชุมคณะกรรมการประจำวิทยาลัย",
      descriptionEn: "Main conference room equipped with hybrid video conference and audio system",
    },
  });

  await prisma.reservationResource.upsert({
    where: { tenantId_code: { tenantId, code: "RM-102" } },
    update: {},
    create: {
      tenantId,
      code: "RM-102",
      type: "ROOM",
      nameTh: "ห้องประชุมธรรมวิจัย (ห้องกลุ่มย่อย)",
      nameEn: "Dhamma Research Meeting Room",
      capacity: 20,
      locationOrPlate: "อาคารเรียนรวม ชั้น 3",
      amenities: { projector: true, soundSystem: true, micCount: 2 },
      descriptionTh: "ห้องประชุมขนาดกลางสำหรับการประชุมภาควิชาและการสอบสารนิพนธ์",
      descriptionEn: "Medium meeting room for faculty and committee meetings",
    },
  });

  await prisma.reservationResource.upsert({
    where: { tenantId_code: { tenantId, code: "VAN-01" } },
    update: {},
    create: {
      tenantId,
      code: "VAN-01",
      type: "VEHICLE",
      nameTh: "รถตู้โตโยต้า คอมมิวเตอร์ (คันที่ 1)",
      nameEn: "Toyota Commuter Van #1",
      capacity: 12,
      locationOrPlate: "ฮข-1234 ฉะเชิงเทรา",
      amenities: { ac: true, wifi: true, firstAid: true },
      descriptionTh: "รถตู้ปรับอากาศสำหรับปฏิบัติศาสนกิจ ดูงาน และนำนิสิตทำกิจกรรม",
      descriptionEn: "Air-conditioned van for official university field trips and duties",
    },
  });

  await prisma.reservationResource.upsert({
    where: { tenantId_code: { tenantId, code: "VAN-02" } },
    update: {},
    create: {
      tenantId,
      code: "VAN-02",
      type: "VEHICLE",
      nameTh: "รถตู้โตโยต้า มาเจสตี้ VIP (คันที่ 2)",
      nameEn: "Toyota Majesty VIP Van #2",
      capacity: 8,
      locationOrPlate: "นข-5678 ฉะเชิงเทรา",
      amenities: { ac: true, vipSeats: true, wifi: true },
      descriptionTh: "รถตู้ VIP สำหรับรับรองพระเถระ ผู้ทรงคุณวุฒิ และผู้บริหาร",
      descriptionEn: "VIP executive van for guest monks and administrators",
    },
  });

  // 5. Service Categories (Maintenance)
  console.log("🔧 Seeding Service Desk Categories...");
  await prisma.serviceCategory.upsert({
    where: { tenantId_code: { tenantId, code: "MAINT-FACILITY" } },
    update: {},
    create: {
      tenantId,
      code: "MAINT-FACILITY",
      nameTh: "งานอาคารสถานที่และสุขาภิบาล",
      nameEn: "Facilities & Sanitation",
      defaultSlaHours: 48,
    },
  });

  await prisma.serviceCategory.upsert({
    where: { tenantId_code: { tenantId, code: "MAINT-ELECTRICAL" } },
    update: {},
    create: {
      tenantId,
      code: "MAINT-ELECTRICAL",
      nameTh: "งานระบบไฟฟ้าและเครื่องปรับอากาศ",
      nameEn: "Electrical & Air Conditioning",
      defaultSlaHours: 24,
    },
  });

  await prisma.serviceCategory.upsert({
    where: { tenantId_code: { tenantId, code: "MAINT-IT" } },
    update: {},
    create: {
      tenantId,
      code: "MAINT-IT",
      nameTh: "งานระบบคอมพิวเตอร์และโสตทัศนูปกรณ์",
      nameEn: "IT, AV & Multimedia Support",
      defaultSlaHours: 12,
    },
  });

  await prisma.serviceCategory.upsert({
    where: { tenantId_code: { tenantId, code: "MAINT-VEHICLE" } },
    update: {},
    create: {
      tenantId,
      code: "MAINT-VEHICLE",
      nameTh: "งานซ่อมบำรุงยานพาหนะ",
      nameEn: "Vehicle Maintenance",
      defaultSlaHours: 72,
    },
  });

  // 6. Asset Categories
  console.log("📦 Seeding Asset Categories & Sample Supplies...");
  await prisma.assetCategory.upsert({
    where: { tenantId_code: { tenantId, code: "ASSET-IT" } },
    update: {},
    create: {
      tenantId,
      code: "ASSET-IT",
      nameTh: "ครุภัณฑ์คอมพิวเตอร์และสารสนเทศ",
      nameEn: "Computer & IT Equipment",
      usefulLifeYears: 5,
      depreciationRate: 0.2,
    },
  });

  await prisma.assetCategory.upsert({
    where: { tenantId_code: { tenantId, code: "ASSET-OFFICE" } },
    update: {},
    create: {
      tenantId,
      code: "ASSET-OFFICE",
      nameTh: "ครุภัณฑ์สำนักงานและห้องเรียน",
      nameEn: "Office & Classroom Equipment",
      usefulLifeYears: 5,
      depreciationRate: 0.2,
    },
  });

  await prisma.assetCategory.upsert({
    where: { tenantId_code: { tenantId, code: "ASSET-VEHICLE" } },
    update: {},
    create: {
      tenantId,
      code: "ASSET-VEHICLE",
      nameTh: "ครุภัณฑ์ยานพาหนะและขนส่ง",
      nameEn: "Vehicles & Transport",
      usefulLifeYears: 8,
      depreciationRate: 0.125,
    },
  });

  // Supply items
  await prisma.supplyItem.upsert({
    where: { tenantId_code: { tenantId, code: "SUPPLY-A4" } },
    update: {},
    create: {
      tenantId,
      code: "SUPPLY-A4",
      nameTh: "กระดาษถ่ายเอกสาร A4 80 แกรม (Double A)",
      unit: "รีม",
      currentStock: 85,
      minStock: 20,
      unitCost: 135,
    },
  });

  await prisma.supplyItem.upsert({
    where: { tenantId_code: { tenantId, code: "SUPPLY-INK-HP" } },
    update: {},
    create: {
      tenantId,
      code: "SUPPLY-INK-HP",
      nameTh: "ตลับหมึกเลเซอร์ HP LaserJet 85A",
      unit: "ตลับ",
      currentStock: 12,
      minStock: 5,
      unitCost: 1850,
    },
  });

  await prisma.supplyItem.upsert({
    where: { tenantId_code: { tenantId, code: "SUPPLY-PEN" } },
    update: {},
    create: {
      tenantId,
      code: "SUPPLY-PEN",
      nameTh: "ปากกาไวท์บอร์ดตราม้า (สีน้ำเงิน)",
      unit: "ด้าม",
      currentStock: 60,
      minStock: 20,
      unitCost: 25,
    },
  });

  // 7. Document Types
  console.log("📝 Seeding Document Types...");
  await prisma.documentType.upsert({
    where: { tenantId_code: { tenantId, code: "DOC-MEMO" } },
    update: {},
    create: {
      tenantId,
      code: "DOC-MEMO",
      nameTh: "บันทึกข้อความภายใน",
      nameEn: "Internal Memorandum",
      descriptionTh: "แบบฟอร์มบันทึกข้อความสำหรับติดต่อราชการภายในวิทยาลัย",
      isActive: true,
    },
  });

  await prisma.documentType.upsert({
    where: { tenantId_code: { tenantId, code: "DOC-ORDER" } },
    update: {},
    create: {
      tenantId,
      code: "DOC-ORDER",
      nameTh: "คำสั่ง/ประกาศวิทยาลัย",
      nameEn: "College Order / Announcement",
      descriptionTh: "ประกาศและคำสั่งแต่งตั้งคณะกรรมการหรือการปฏิบัติงาน",
      isActive: true,
    },
  });

  await prisma.documentType.upsert({
    where: { tenantId_code: { tenantId, code: "DOC-OUTGOING" } },
    update: {},
    create: {
      tenantId,
      code: "DOC-OUTGOING",
      nameTh: "หนังสือส่งภายนอก",
      nameEn: "Outgoing Official Letter",
      descriptionTh: "หนังสือราชการสำหรับติดต่อหน่วยงานภายนอก",
      isActive: true,
    },
  });

  await prisma.documentType.upsert({
    where: { tenantId_code: { tenantId, code: "DOC-PROJECT" } },
    update: {},
    create: {
      tenantId,
      code: "DOC-PROJECT",
      nameTh: "แบบขออนุมัติโครงการและงบประมาณ",
      nameEn: "Project & Budget Approval",
      descriptionTh: "คำขออนุมัติจัดโครงการสัมมนา อบรม หรือกิจกรรมพัฒนานิสิต",
      isActive: true,
    },
  });

  console.log("✨ Master data seeding completed successfully!");
}

main()
  .catch(err => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
