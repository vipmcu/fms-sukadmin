import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "องค์กรตัวอย่าง", nameEn: "Sample Organization" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด", roles: ["SUPER_ADMIN"] },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
  }

  // Seed ข้อมูลทรัพยากรห้องประชุมและยานพาหนะ
  const adminUser = await prisma.user.findUniqueOrThrow({ where: { email: "admin@app.local" } });
  const staffUser = await prisma.user.findUniqueOrThrow({ where: { email: "staff@app.local" } });

  const resources = [
    {
      code: "RM-301",
      type: "ROOM" as const,
      nameTh: "ห้องประชุมสารภี 1 (ห้องประชุมใหญ่)",
      nameEn: "Sarapee Conference Room 1",
      capacity: 50,
      locationOrPlate: "อาคาร 3 ชั้น 3",
      amenities: { projector: true, soundSystem: true, videoConference: true, micCount: 4 },
      descriptionTh: "ห้องประชุมใหญ่สำหรับประชุมวิชาการ สัมมนา และการประชุมคณะกรรมการประจำคณะ",
      descriptionEn: "Main conference room equipped with hybrid video conference system",
    },
    {
      code: "RM-204",
      type: "ROOM" as const,
      nameTh: "ห้องประชุมบงกช (ห้องประชุมกลุ่มย่อย)",
      nameEn: "Bongkot Meeting Room 2",
      capacity: 15,
      locationOrPlate: "อาคาร 2 ชั้น 4",
      amenities: { projector: true, soundSystem: true, videoConference: true, micCount: 2 },
      descriptionTh: "ห้องประชุมขนาดกลางสำหรับการประชุมภาควิชาและการสอบโครงงานพิเศษ",
      descriptionEn: "Medium meeting room for department and committee meetings",
    },
    {
      code: "VAN-01",
      type: "VEHICLE" as const,
      nameTh: "รถตู้โตโยต้า คอมมิวเตอร์ (คันที่ 1)",
      nameEn: "Toyota Commuter Van #1",
      capacity: 12,
      locationOrPlate: "ฮข-1234 กทม.",
      amenities: { ac: true, wifi: true, firstAid: true },
      descriptionTh: "รถตู้ปรับอากาศสำหรับเดินทางไปปฏิบัติงานราชการ ดูงาน และนำนักศึกษาฝึกงาน",
      descriptionEn: "Air-conditioned van for faculty field trips and official duties",
    },
    {
      code: "VAN-02",
      type: "VEHICLE" as const,
      nameTh: "รถตู้โตโยต้า มาเจสตี้ (VIP)",
      nameEn: "Toyota Majesty VIP Van",
      capacity: 8,
      locationOrPlate: "นข-5678 กทม.",
      amenities: { ac: true, vipSeats: true, wifi: true },
      descriptionTh: "รถตู้ VIP สำหรับรับรองผู้ทรงคุณวุฒิและผู้บริหาร",
      descriptionEn: "VIP van for guest professors and executive delegates",
    },
  ];

  for (const r of resources) {
    const res = await prisma.reservationResource.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: r.code } },
      update: { nameTh: r.nameTh, nameEn: r.nameEn, capacity: r.capacity, locationOrPlate: r.locationOrPlate },
      create: { tenantId: core.tenantId, ...r },
    });

    // ตัวอย่างคำขอจองห้อง RM-301 (APPROVED)
    if (r.code === "RM-301") {
      const tomorrow10 = new Date(Date.now() + 26 * 60 * 60 * 1000);
      const tomorrow12 = new Date(Date.now() + 28 * 60 * 60 * 1000);
      await prisma.reservation.upsert({
        where: { tenantId_bookingNo: { tenantId: core.tenantId, bookingNo: "BK-2026-DEMO01" } },
        update: {},
        create: {
          tenantId: core.tenantId,
          bookingNo: "BK-2026-DEMO01",
          resourceId: res.id,
          requesterId: staffUser.id,
          title: "ประชุมคณะกรรมการปรับปรุงหลักสูตร",
          purpose: "พิจารณาเกณฑ์ มคอ.2 สำหรับปีการศึกษาใหม่",
          attendeesCount: 20,
          startTime: tomorrow10,
          endTime: tomorrow12,
          status: "APPROVED",
          approverId: adminUser.id,
          approvalNote: "อนุมัติเปิดห้องและจัดเตรียมไมโครโฟน 4 ตัว",
          approvedAt: new Date(),
        },
      });
    }

    // ตัวอย่างคำขอจองรถตู้ VAN-01 (PENDING)
    if (r.code === "VAN-01") {
      const nextDay13 = new Date(Date.now() + 50 * 60 * 60 * 1000);
      const nextDay17 = new Date(Date.now() + 54 * 60 * 60 * 1000);
      await prisma.reservation.upsert({
        where: { tenantId_bookingNo: { tenantId: core.tenantId, bookingNo: "BK-2026-DEMO02" } },
        update: {},
        create: {
          tenantId: core.tenantId,
          bookingNo: "BK-2026-DEMO02",
          resourceId: res.id,
          requesterId: staffUser.id,
          title: "นำนักศึกษาศึกษาดูงานศูนย์นวัตกรรม",
          purpose: "เข้าชมการดำเนินงานด้าน AI & Cloud Services",
          attendeesCount: 10,
          startTime: nextDay13,
          endTime: nextDay17,
          destination: "ศูนย์นวัตกรรมแห่งชาติ จ.ปทุมธานี",
          status: "PENDING",
        },
      });
    }
  }

  // ==========================================
  // Seed News & Categories
  // ==========================================
  console.log("[seed] Seeding News & Announcements...");
  const catAnnounce = await prisma.newsCategory.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "announcements" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      slug: "announcements",
      nameTh: "ข่าวประชาสัมพันธ์ทั่วไป",
      nameEn: "General Announcements",
      color: "blue",
      order: 1,
    },
  });

  const catAcademic = await prisma.newsCategory.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "academic" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      slug: "academic",
      nameTh: "ข่าววิชาการและงานวิจัย",
      nameEn: "Academic & Research",
      color: "emerald",
      order: 2,
    },
  });

  const catScholarship = await prisma.newsCategory.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "scholarships" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      slug: "scholarships",
      nameTh: "ทุนการศึกษาและรางวัล",
      nameEn: "Scholarships & Awards",
      color: "amber",
      order: 3,
    },
  });

  await prisma.newsArticle.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "national-symposium-2026" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      categoryId: catAcademic.id,
      slug: "national-symposium-2026",
      titleTh: "ขอเชิญร่วมงานสัมมนาวิชาการระดับชาติ ประจำปี 2569 ด้านเทคโนโลยีและนวัตกรรม",
      titleEn: "National Symposium on Technology & Innovation 2026",
      contentTh: `ขอเชิญคณาจารย์ นักวิจัย นิสิตนักศึกษา และผู้สนใจทุกท่าน เข้าร่วมการประชุมสัมมนาวิชาการระดับชาติ ประจำปี 2569 เพื่อแลกเปลี่ยนองค์ความรู้ด้านเทคโนโลยีดิจิทัลและปัญญาประดิษฐ์ พร้อมการนำเสนองานวิจัยดีเด่นจากมหาวิทยาลัยชั้นนำทั่วประเทศ
      
### กำหนดการจัดงาน
- วันที่ 25 - 26 มีนาคม 2569 ณ หอประชุมใหญ่ คณะฯ
- เปิดรับบทความวิจัยฉบับเต็มตั้งแต่วันนี้ - 15 กุมภาพันธ์ 2569`,
      contentEn: "Join us for the National Symposium on Technology & Innovation 2026 featuring keynote speakers and paper presentations.",
      excerptTh: "เวทีแลกเปลี่ยนงานวิจัยระดับชาติ ด้านเทคโนโลยีดิจิทัลและนวัตกรรม พร้อมการบรรยายพิเศษจากผู้ทรงคุณวุฒิระดับสากล",
      excerptEn: "National research conference showcasing keynotes and research papers.",
      coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      isPinned: true,
      viewCount: 142,
      publishedAt: new Date(),
      authorId: adminUser.id,
    },
  });

  await prisma.newsArticle.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "tcas-69-admission" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      categoryId: catAnnounce.id,
      slug: "tcas-69-admission",
      titleTh: "ประกาศรับสมัครนักศึกษาใหม่ระดับปริญญาตรี TCAS69 รอบ Portfolio",
      titleEn: "Undergraduate Admission TCAS69 - Portfolio Round Announcement",
      contentTh: "คณะฯ เปิดรับสมัครนักศึกษาใหม่ ประจำปีการศึกษา 2569 ในหลักสูตรวิทยาศาสตรบัณฑิต และบริหารธุรกิจบัณฑิต ผู้สนใจสามารถตรวจสอบคุณสมบัติและส่งเอกสารได้ทางระบบรับสมัครออนไลน์",
      contentEn: "Now open for applications in Bachelor programs for academic year 2026.",
      excerptTh: "เปิดรับสมัครบุคคลเข้าศึกษาต่อระดับปริญญาตรี ประจำปีการศึกษา 2569 ตรวจสอบเกณฑ์และสมัครได้แล้ววันนี้",
      coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      isPinned: true,
      viewCount: 380,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      authorId: staffUser.id,
    },
  });

  await prisma.newsArticle.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "excellence-scholarship-announcement" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      categoryId: catScholarship.id,
      slug: "excellence-scholarship-announcement",
      titleTh: "เปิดรับสมัครทุนการศึกษาเพื่อความเป็นเลิศทางวิชาการ ประจำภาคการศึกษาที่ 1/2569",
      titleEn: "Academic Excellence Scholarship 1/2026 Application Open",
      contentTh: "เปิดรับสมัครนิสิตนักศึกษาที่มีผลการเรียนยอดเยี่ยมและมีส่วนร่วมในกิจกรรมของคณะเพื่อรับทุนสนับสนุนการศึกษาเต็มจำนวน",
      excerptTh: "ทุนการศึกษาเต็มจำนวนสำหรับนักศึกษาที่มีผลการเรียนดีเด่นและสร้างชื่อเสียงให้แก่คณะฯ",
      coverImageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      isPinned: false,
      viewCount: 95,
      publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      authorId: staffUser.id,
    },
  });

  // ==========================================
  // Seed Departments & Personnel
  // ==========================================
  console.log("[seed] Seeding Departments & Personnel...");
  const deptCS = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "DEPT-CS" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "DEPT-CS",
      nameTh: "ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ",
      nameEn: "Department of Computer Science & Information Technology",
      order: 1,
    },
  });

  const deptBA = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "DEPT-BA" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "DEPT-BA",
      nameTh: "ภาควิชาบริหารธุรกิจและนวัตกรรมดิจิทัล",
      nameEn: "Department of Business Administration & Digital Innovation",
      order: 2,
    },
  });

  const deptOffice = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "DEPT-OFFICE" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "DEPT-OFFICE",
      nameTh: "สำนักงานคณบดี",
      nameEn: "Office of the Dean",
      order: 3,
    },
  });

  await prisma.personnelProfile.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      tenantId: core.tenantId,
      departmentId: deptCS.id,
      userId: adminUser.id,
      type: "ACADEMIC",
      academicPosition: "ASSOC_PROF",
      prefixTh: "รศ.ดร.",
      prefixEn: "Assoc. Prof. Dr.",
      firstNameTh: "สมชาย",
      lastNameTh: "ใจดีวิริยะ",
      firstNameEn: "Somchai",
      lastNameEn: "Jaideeviriya",
      email: "somchai.j@university.ac.th",
      phone: "02-123-4567 ต่อ 101",
      officeRoom: "อาคาร 1 ห้อง 1302 (ห้องคณบดี)",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      education: [
        { degree: "Ph.D. in Computer Science", institution: "Carnegie Mellon University", year: "2012" },
        { degree: "วท.ม. (วิทยาการคอมพิวเตอร์)", institution: "จุฬาลงกรณ์มหาวิทยาลัย", year: "2007" },
        { degree: "วท.บ. (วิทยาการคอมพิวเตอร์) เกียรตินิยมอันดับ 1", institution: "จุฬาลงกรณ์มหาวิทยาลัย", year: "2004" },
      ],
      expertise: ["Artificial Intelligence", "Distributed Systems", "Cloud Computing & DevOps"],
      publications: [
        { title: "Scalable Fault-Tolerant Microservices in Cloud Native Environments", journal: "IEEE Transactions on Software Engineering", year: "2024" },
        { title: "Deep Learning for Autonomous Academic Quality Assurance", journal: "ACM Computing Surveys", year: "2023" },
      ],
      order: 1,
      isActive: true,
    },
  });

  await prisma.personnelProfile.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      tenantId: core.tenantId,
      departmentId: deptCS.id,
      type: "ACADEMIC",
      academicPosition: "ASST_PROF",
      prefixTh: "ผศ.ดร.",
      prefixEn: "Asst. Prof. Dr.",
      firstNameTh: "วิภาดา",
      lastNameTh: "รัตนกุล",
      firstNameEn: "Vipada",
      lastNameEn: "Rattanakul",
      email: "vipada.r@university.ac.th",
      phone: "02-123-4567 ต่อ 205",
      officeRoom: "อาคาร 2 ห้อง 2405",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      education: [
        { degree: "Ph.D. in Software Engineering", institution: "Imperial College London", year: "2016" },
        { degree: "วท.บ. (วิทยาการคอมพิวเตอร์)", institution: "มหาวิทยาลัยเกษตรศาสตร์", year: "2010" },
      ],
      expertise: ["Software Architecture", "Agile Methodologies", "Cybersecurity"],
      publications: [
        { title: "Empirical Studies on Enterprise Software Quality Gates", journal: "IEEE Software", year: "2025" },
      ],
      order: 2,
      isActive: true,
    },
  });

  await prisma.personnelProfile.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      tenantId: core.tenantId,
      departmentId: deptBA.id,
      type: "ACADEMIC",
      academicPosition: "LECTURER",
      prefixTh: "อ.ดร.",
      prefixEn: "Dr.",
      firstNameTh: "ณัฐวุฒิ",
      lastNameTh: "สิทธิโชค",
      firstNameEn: "Nattawut",
      lastNameEn: "Sitthichok",
      email: "nattawut.s@university.ac.th",
      phone: "02-123-4567 ต่อ 312",
      officeRoom: "อาคาร 3 ห้อง 3108",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      education: [
        { degree: "Ph.D. in Business Analytics", institution: "National University of Singapore", year: "2020" },
      ],
      expertise: ["Digital Marketing", "E-Commerce Strategy", "Consumer Analytics"],
      publications: [],
      order: 3,
      isActive: true,
    },
  });

  await prisma.personnelProfile.upsert({
    where: { id: "00000000-0000-0000-0000-000000000004" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000004",
      tenantId: core.tenantId,
      departmentId: deptOffice.id,
      userId: staffUser.id,
      type: "SUPPORT",
      academicPosition: "NONE",
      prefixTh: "นางสาว",
      prefixEn: "Ms.",
      firstNameTh: "พรทิพย์",
      lastNameTh: "สุวรรณโชติ",
      firstNameEn: "Porntip",
      lastNameEn: "Suwannachote",
      email: "staff@app.local",
      phone: "02-123-4567 ต่อ 100",
      officeRoom: "สำนักงานคณบดี ชั้น 1",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      education: [
        { degree: "บธ.บ. (การจัดการทั่วไป)", institution: "มหาวิทยาลัยธรรมศาสตร์", year: "2015" },
      ],
      expertise: ["งานบริหารงานทั่วไป", "งานสารบรรณอิเล็กทรอนิกส์", "งานพัสดุและอาคาร"],
      publications: [],
      order: 4,
      isActive: true,
    },
  });

  // ==========================================
  // Seed Curriculum & Programs
  // ==========================================
  console.log("[seed] Seeding Academic Programs & Courses...");
  const progCS = await prisma.academicProgram.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "CS-BSC" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "CS-BSC",
      level: "BACHELOR",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Bachelor of Science in Computer Science",
      degreeTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์) วท.บ.",
      degreeEn: "Bachelor of Science (Computer Science) B.S.",
      departmentId: deptCS.id,
      totalCredits: 128,
      durationYears: 4,
      tuitionFeePerTerm: 25000,
      descriptionTh: "มุ่งเน้นสร้างบัณฑิตที่มีความรู้ความเชี่ยวชาญทั้งด้านทฤษฎีคอมพิวเตอร์ การพัฒนาซอฟต์แวร์สมัยใหม่ ปัญญาประดิษฐ์ และระบบคลาวด์ พร้อมทักษะการทำงานจริงในอุตสาหกรรมเทคโนโลยี",
      descriptionEn: "Preparing graduates with strong fundamentals in algorithms, software development, cloud computing and AI.",
      careerOpportunities: [
        "Software Engineer / Full Stack Developer",
        "Cloud Solutions Architect",
        "Data Engineer / AI Developer",
        "DevOps Engineer",
        "Cybersecurity Specialist",
      ],
      curriculumPdfUrl: "https://example.com/curriculum-cs-2567.pdf",
      isAcceptingApplications: true,
      applicationLink: "https://admission.university.ac.th",
      isActive: true,
      order: 1,
    },
  });

  // Sample Courses for CS
  const csCourses = [
    { code: "CS101", nameTh: "การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน", nameEn: "Fundamental Computer Programming", credits: 3, year: 1, semester: 1 },
    { code: "CS102", nameTh: "โครงสร้างข้อมูลและขั้นตอนวิธี", nameEn: "Data Structures and Algorithms", credits: 3, year: 1, semester: 2 },
    { code: "CS201", nameTh: "ระบบการจัดการฐานข้อมูล", nameEn: "Database Management Systems", credits: 3, year: 2, semester: 1 },
    { code: "CS202", nameTh: "การวิเคราะห์และออกแบบระบบเชิงวัตถุ", nameEn: "Object-Oriented Analysis and Design", credits: 3, year: 2, semester: 2 },
    { code: "CS301", nameTh: "วิศวกรรมซอฟต์แวร์และการพัฒนาเว็บสมัยใหม่", nameEn: "Software Engineering & Modern Web Development", credits: 3, year: 3, semester: 1 },
    { code: "CS401", nameTh: "โครงงานพิเศษทางวิทยาการคอมพิวเตอร์ 1", nameEn: "Senior Project in Computer Science I", credits: 2, year: 4, semester: 1 },
  ];

  for (const c of csCourses) {
    const existingCourse = await prisma.curriculumCourse.findFirst({
      where: { programId: progCS.id, code: c.code },
    });
    if (!existingCourse) {
      await prisma.curriculumCourse.create({
        data: { programId: progCS.id, ...c },
      });
    }
  }

  await prisma.academicProgram.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "DS-MSC" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "DS-MSC",
      level: "MASTER",
      nameTh: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการข้อมูลและการวิเคราะห์ขั้นสูง",
      nameEn: "Master of Science in Data Science & Advanced Analytics",
      degreeTh: "วิทยาศาสตรมหาบัณฑิต (วิทยาการข้อมูล) วท.ม.",
      degreeEn: "Master of Science (Data Science) M.S.",
      departmentId: deptCS.id,
      totalCredits: 36,
      durationYears: 2,
      tuitionFeePerTerm: 45000,
      descriptionTh: "หลักสูตรระดับบัณฑิตศึกษาที่บูรณาการความรู้ด้านสถิติประยุกต์ แมชชีนเลิร์นนิง และการประมวลผลข้อมูลขนาดใหญ่เพื่อการตัดสินใจเชิงกลยุทธ์",
      careerOpportunities: [
        "Lead Data Scientist",
        "Machine Learning Engineer",
        "Big Data Architect",
        "Business Intelligence Consultant",
      ],
      isAcceptingApplications: true,
      applicationLink: "https://admission.university.ac.th/grad",
      isActive: true,
      order: 2,
    },
  });

  // ==========================================
  // Seed Document Types & Requests
  // ==========================================
  console.log("[seed] Seeding Document Types & Approval Workflows...");
  const docTypeLeave = await prisma.documentType.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "DOC-REQ-LEAVE" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "DOC-REQ-LEAVE",
      nameTh: "แบบฟอร์มขออนุมัติลาปฏิบัติงาน / ลาพักผ่อน",
      nameEn: "Staff Leave Request Form",
      descriptionTh: "สำหรับบุคลากรยื่นขออนุมัติลากิจ ลาพักผ่อน หรือลาป่วย",
      requiredFields: [
        { key: "leaveType", label: "ประเภทการลา", type: "select", options: ["ลากิจ", "ลาพักผ่อน", "ลาป่วย", "ลาคลอด"] },
        { key: "startDate", label: "วันที่เริ่มต้น", type: "date" },
        { key: "endDate", label: "วันที่สิ้นสุด", type: "date" },
        { key: "reason", label: "เหตุผลความจำเป็น", type: "text" },
      ],
      isActive: true,
    },
  });

  const docTypeTravel = await prisma.documentType.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "DOC-REQ-TRAVEL" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "DOC-REQ-TRAVEL",
      nameTh: "บันทึกข้อความขออนุมัติเดินทางไปปฏิบัติงานราชการ",
      nameEn: "Official Duty Travel Request",
      descriptionTh: "สำหรับขออนุมัติเดินทางไปราชการ สัมมนา หรือดูงานทั้งในและต่างประเทศ",
      requiredFields: [
        { key: "destination", label: "สถานที่ไปปฏิบัติงาน", type: "text" },
        { key: "budgetAmount", label: "งบประมาณที่ขอเบิกจ่าย (บาท)", type: "number" },
        { key: "fundingSource", label: "แหล่งงบประมาณ", type: "text" },
      ],
      isActive: true,
    },
  });

  // Seed sample requests
  const sampleDoc1 = await prisma.documentRequest.upsert({
    where: { tenantId_documentNo: { tenantId: core.tenantId, documentNo: "DOC-202609-0001" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      documentNo: "DOC-202609-0001",
      typeId: docTypeTravel.id,
      title: "ขออนุมัติเดินทางไปนำเสนอผลงานวิจัย ณ ประเทศญี่ปุ่น",
      content: "เนื่องด้วยข้าพเจ้าได้รับการตอบรับบทความวิจัยเพื่อนำเสนอในการประชุมวิชาการระดับนานาชาติ IEEE ICSE 2026 จึงใคร่ขออนุมัติเดินทางไปราชการพร้อมขอรับการสนับสนุนงบประมาณการเดินทาง",
      metadata: {
        destination: "Tokyo, Japan",
        budgetAmount: 45000,
        fundingSource: "ทุนสนับสนุนการวิจัยคณะฯ",
      },
      attachments: [],
      status: "APPROVED",
      requesterId: staffUser.id,
      currentStep: 2,
      totalSteps: 2,
      currentApproverRole: null,
      finalApprovedAt: new Date(),
    },
  });

  // Add approval steps for sampleDoc1
  await prisma.documentApprovalStep.upsert({
    where: { documentId_stepNumber: { documentId: sampleDoc1.id, stepNumber: 1 } },
    update: {},
    create: {
      documentId: sampleDoc1.id,
      stepNumber: 1,
      approverRole: "DEPT_HEAD",
      approverId: adminUser.id,
      status: "APPROVED",
      comment: "เห็นควรอนุมัติเพื่อสนับสนุนการเผยแพร่งานวิจัยของคณะ",
      actionAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  });

  await prisma.documentApprovalStep.upsert({
    where: { documentId_stepNumber: { documentId: sampleDoc1.id, stepNumber: 2 } },
    update: {},
    create: {
      documentId: sampleDoc1.id,
      stepNumber: 2,
      approverRole: "DEAN",
      approverId: adminUser.id,
      status: "APPROVED",
      comment: "อนุมัติตามเสนอ",
      actionAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  });

  await prisma.documentRequest.upsert({
    where: { tenantId_documentNo: { tenantId: core.tenantId, documentNo: "DOC-202609-0002" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      documentNo: "DOC-202609-0002",
      typeId: docTypeLeave.id,
      title: "ขออนุมัติลาพักผ่อนประจำปี จำนวน 2 วัน",
      content: "ข้าพเจ้ามีความประสงค์ขอลาพักผ่อนตั้งแต่วันที่ 18 - 19 กันยายน 2569 รวมเป็นเวลา 2 วันทำการ ทั้งนี้ได้มอบหมายงานในหน้าที่ให้เจ้าหน้าที่ท่านอื่นปฏิบัติการแทนเรียบร้อยแล้ว",
      metadata: {
        leaveType: "ลาพักผ่อน",
        startDate: "2026-09-18",
        endDate: "2026-09-19",
        reason: "ไปทำธุระส่วนตัวต่างจังหวัด",
      },
      attachments: [],
      status: "SUBMITTED",
      requesterId: staffUser.id,
      currentStep: 1,
      totalSteps: 2,
      currentApproverRole: "DEPT_HEAD",
    },
  });

  // ==========================================
  // Seed Assets & Inventory
  // ==========================================
  console.log("[seed] Seeding Assets & Inventory...");
  const catComp = await prisma.assetCategory.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "CAT-COMP" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "CAT-COMP",
      nameTh: "ครุภัณฑ์คอมพิวเตอร์และสารสนเทศ",
      nameEn: "Computer & IT Equipment",
      depreciationRate: 0.2,
      usefulLifeYears: 5,
    },
  });

  const catAV = await prisma.assetCategory.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "CAT-AV" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "CAT-AV",
      nameTh: "ครุภัณฑ์โสตทัศนูปกรณ์",
      nameEn: "Audio-Visual Equipment",
      depreciationRate: 0.2,
      usefulLifeYears: 5,
    },
  });

  const catOffice = await prisma.assetCategory.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "CAT-OFFICE" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "CAT-OFFICE",
      nameTh: "ครุภัณฑ์สำนักงาน",
      nameEn: "Office Equipment & Furniture",
      depreciationRate: 0.1,
      usefulLifeYears: 10,
    },
  });

  await prisma.assetItem.upsert({
    where: { tenantId_assetCode: { tenantId: core.tenantId, assetCode: "7440-001-0001/67" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      categoryId: catComp.id,
      assetCode: "7440-001-0001/67",
      nameTh: "เครื่องคอมพิวเตอร์ All-in-One Dell OptiPlex 7410",
      nameEn: "Dell OptiPlex 7410 All-in-One Desktop",
      brandModel: "Dell OptiPlex 7410 Core i7 / RAM 32GB / SSD 1TB",
      serialNumber: "SN-DELL-98214301",
      acquiredDate: new Date("2024-05-15"),
      acquiredPrice: 38500,
      fundingSource: "เงินรายได้คณะ",
      status: "ACTIVE",
      location: "อาคาร 1 ห้อง 1302 (ห้องทำงานคณบดี)",
      departmentId: deptCS.id,
      responsibleId: "00000000-0000-0000-0000-000000000001",
    },
  });

  await prisma.assetItem.upsert({
    where: { tenantId_assetCode: { tenantId: core.tenantId, assetCode: "7440-002-0045/67" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      categoryId: catAV.id,
      assetCode: "7440-002-0045/67",
      nameTh: "จอสัมผัสอัจฉริยะ Interactive Smart Board 75 นิ้ว",
      nameEn: "Interactive Smart Board 75 Inch Maxhub",
      brandModel: "Maxhub V6 Classic 75\"",
      serialNumber: "SN-MAX-77210984",
      acquiredDate: new Date("2024-06-20"),
      acquiredPrice: 95000,
      fundingSource: "งบประมาณแผ่นดิน",
      status: "ACTIVE",
      location: "ห้องประชุม 1301 (ชั้น 3)",
      departmentId: deptCS.id,
    },
  });

  await prisma.assetItem.upsert({
    where: { tenantId_assetCode: { tenantId: core.tenantId, assetCode: "7440-003-0112/66" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      categoryId: catOffice.id,
      assetCode: "7440-003-0112/66",
      nameTh: "เครื่องปรับอากาศติดผนัง Inverter Daikin 24,000 BTU",
      nameEn: "Daikin Inverter Wall Mount Air Conditioner 24,000 BTU",
      brandModel: "Daikin Super Smile Inverter FTKF24WV2S",
      serialNumber: "SN-DAIKIN-4481023",
      acquiredDate: new Date("2023-11-10"),
      acquiredPrice: 32000,
      fundingSource: "งบประมาณแผ่นดิน",
      status: "UNDER_REPAIR",
      location: "อาคาร 1 ห้อง 1301",
      departmentId: deptOffice.id,
    },
  });

  await prisma.supplyItem.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "SUP-A4-80" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "SUP-A4-80",
      nameTh: "กระดาษถ่ายเอกสาร A4 Double A 80 แกรม",
      unit: "รีม",
      currentStock: 45,
      minStock: 20,
      unitCost: 125,
    },
  });

  await prisma.supplyItem.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "SUP-INK-HP" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "SUP-INK-HP",
      nameTh: "ตลับหมึกพิมพ์เลเซอร์ HP LaserJet Original Toner 26A",
      unit: "ตลับ",
      currentStock: 3,
      minStock: 5,
      unitCost: 3200,
    },
  });

  // ==========================================
  // Seed Student Admissions
  // ==========================================
  console.log("[seed] Seeding Student Admissions...");
  const roundTCAS1 = await prisma.admissionRound.upsert({
    where: { id: "10000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "10000000-0000-0000-0000-000000000001",
      tenantId: core.tenantId,
      academicYear: 2569,
      roundName: "TCAS รอบที่ 1 แฟ้มสะสมผลงาน (Portfolio) ประจำปีการศึกษา 2569",
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      announcementDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  await prisma.admissionProgramQuota.upsert({
    where: { roundId_programId: { roundId: roundTCAS1.id, programId: progCS.id } },
    update: {},
    create: {
      roundId: roundTCAS1.id,
      programId: progCS.id,
      quotaSeats: 40,
      tuitionFee: 28000,
      criteriaTh: "สำเร็จการศึกษาระดับ ม.6 แผนการเรียนวิทยาศาสตร์-คณิตศาสตร์ GPAX 5 ภาคเรียน ไม่ต่ำกว่า 3.00 และมีผลงานด้านคอมพิวเตอร์/หุ่นยนต์/โครงงานวิทยาศาสตร์",
    },
  });

  await prisma.studentApplication.upsert({
    where: { tenantId_applicationNo: { tenantId: core.tenantId, applicationNo: "ADM-2569-0001" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      roundId: roundTCAS1.id,
      programId: progCS.id,
      applicationNo: "ADM-2569-0001",
      nationalId: "1100400123456",
      title: "นาย",
      applicantNameTh: "กิตติศักดิ์ พรหมมาศ",
      applicantNameEn: "Kittisak Prommas",
      email: "kittisak.p@gmail.com",
      phone: "081-234-5678",
      schoolName: "โรงเรียนเตรียมอุดมศึกษา",
      gpax: 3.88,
      status: "DOCS_APPROVED",
      documents: [
        { name: "ใบแสดงผลการเรียน ปพ.1", url: "https://example.com/docs/gpax.pdf", type: "PDF" },
        { name: "แฟ้มสะสมผลงาน Portfolio", url: "https://example.com/docs/portfolio.pdf", type: "PDF" },
      ],
      reviewedById: adminUser.id,
      reviewedAt: new Date(),
      reviewerComment: "ผลการเรียนดีเด่น มีโครงงาน AI ชนะการประกวดระดับประเทศ เอกสารครบถ้วนสมบูรณ์",
    },
  });

  // ==========================================
  // Seed Maintenance & Service Desk
  // ==========================================
  console.log("[seed] Seeding Maintenance & Service Desk...");
  const catElec = await prisma.serviceCategory.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "SRV-ELEC" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "SRV-ELEC",
      nameTh: "ระบบไฟฟ้า แสงสว่าง และเครื่องปรับอากาศ",
      nameEn: "Electrical & Air Conditioning Services",
      defaultSlaHours: 12,
      icon: "Zap",
    },
  });

  const catAVSrv = await prisma.serviceCategory.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "SRV-AV" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "SRV-AV",
      nameTh: "โสตทัศนูปกรณ์และระบบเสียงห้องเรียน",
      nameEn: "Audio-Visual & Classroom Media",
      defaultSlaHours: 4,
      icon: "Video",
    },
  });

  await prisma.serviceCategory.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "SRV-IT" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      code: "SRV-IT",
      nameTh: "บริการเทคโนโลยีสารสนเทศและเครือข่าย",
      nameEn: "IT Services & Network Support",
      defaultSlaHours: 8,
      icon: "Monitor",
    },
  });

  await prisma.serviceTicket.upsert({
    where: { tenantId_ticketNo: { tenantId: core.tenantId, ticketNo: "SR-2026-0001" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      ticketNo: "SR-2026-0001",
      categoryId: catElec.id,
      title: "เครื่องปรับอากาศห้องประชุม 1301 ไม่เย็น มีน้ำหยด",
      description: "เครื่องปรับอากาศฝั่งซ้ายของห้องประชุม 1301 มีเสียงดังผิดปกติและมีน้ำหยดลงบนพื้นห้อง ทำให้อุณหภูมิห้องไม่เย็น ขอความอนุเคราะห์ตรวจสอบเร่งด่วน",
      location: "อาคาร 1 ชั้น 3 ห้องประชุม 1301",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      requesterName: "รศ.ดร.สมชาย ใจดีวิริยะ",
      requesterEmail: "somchai.j@university.ac.th",
      requesterPhone: "02-123-4567 ต่อ 101",
      assignedTechnicianId: staffUser.id,
      slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
  });

  await prisma.serviceTicket.upsert({
    where: { tenantId_ticketNo: { tenantId: core.tenantId, ticketNo: "SR-2026-0002" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      ticketNo: "SR-2026-0002",
      categoryId: catAVSrv.id,
      title: "โปรเจกเตอร์ห้องบรรยาย 2401 สัญญาณภาพติดๆ ดับๆ",
      description: "สายเชื่อมต่อสัญญาณ HDMI หน้าห้องหลวม ภาพที่ฉายขึ้นจอภาพกะพริบและติดๆ ดับๆ รบกวนช่วยเปลี่ยนสายสัญญาณใหม่",
      location: "อาคาร 2 ชั้น 4 ห้อง 2401",
      priority: "HIGH",
      status: "OPEN",
      requesterName: "ผศ.ดร.วิภาดา รัตนกุล",
      requesterEmail: "vipada.r@university.ac.th",
      requesterPhone: "02-123-4567 ต่อ 205",
      slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
    },
  });

  console.log(`[seed] เสร็จสมบูรณ์ทุกโมดูล — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
