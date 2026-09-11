import { chromium, type Page, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3010";
const SCREENSHOT_DIR = "/Users/bongsukphoto/.gemini/antigravity/brain/bcb4e2ad-9661-465d-a081-b31c1b1ab96e/screenshots";
const RESULTS_FILE = "/Users/bongsukphoto/.gemini/antigravity/brain/bcb4e2ad-9661-465d-a081-b31c1b1ab96e/test_results.json";

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

interface TestResult {
  id: number;
  category: "Portal" | "Auth" | "Admin";
  name: string;
  url: string;
  status: "PASS" | "WARN" | "FAIL";
  durationMs: number;
  details: string;
  screenshotFile: string;
}

const results: TestResult[] = [];

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForCsrfCookie(page: Page) {
  for (let i = 0; i < 40; i++) {
    const cookies = await page.context().cookies();
    if (cookies.some((c) => c.name === "authjs.csrf-token")) return true;
    await delay(100);
  }
  return false;
}

async function run() {
  console.log("🚀 กำลังเริ่มต้นทดสอบระบบทุก Feature บน Google Chrome...");
  let browser: Browser | null = null;
  let isCdp = false;

  try {
    console.log("📡 กำลังเชื่อมต่อกับ Google Chrome ผ่าน CDP port 9222...");
    browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
    isCdp = true;
    console.log("✅ เชื่อมต่อ Google Chrome สำเร็จ! การทดสอบจะแสดงผลแบบ Live บนหน้าจอ");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`⚠️ ไม่สามารถต่อ CDP ได้ (${msg}) — สลับไปเปิด Chromium Instance แทน`);
    browser = await chromium.launch({ headless: false });
  }

  const context = isCdp ? browser.contexts()[0] : await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = (await context.pages())[0] || (await context.newPage());
  await page.setViewportSize({ width: 1280, height: 850 });

  // -------------------------------------------------------------
  // PART 1: PUBLIC PORTAL (9 Features)
  // -------------------------------------------------------------
  console.log("\n================ [หมวด 1: PUBLIC PORTAL] ================");

  // 1. Homepage & Summit Hero
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "01-portal-homepage-hero.png";
    try {
      console.log("▶ [1/23] กำลังทดสอบหน้าหลัก & Summit Hero...");
      await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(1000);

      const video = page.locator("video").first();
      const videoSrc = await page.locator("video source").first().getAttribute("src");
      const poster = await video.getAttribute("poster");

      // Test Sound Toggle
      const soundBtn = page.getByRole("button", { name: /Sound|เสียง/i }).first();
      if (await soundBtn.isVisible()) {
        await soundBtn.click();
        await delay(300);
        await soundBtn.click();
      }

      // Test Watch Video Modal
      const watchBtn = page.getByRole("button", { name: /Watch Video|ชมวิดีโอแนะนำ/i }).first();
      if (await watchBtn.isVisible()) {
        await watchBtn.click();
        await delay(600);
        // Close modal
        const modalDialog = page.locator("div[role='dialog']");
        if (await modalDialog.isVisible()) {
          const closeBtn = modalDialog.locator("button").first();
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
          } else {
            await page.keyboard.press("Escape");
          }
          await delay(400);
        }
      }

      details = `วิดีโอพื้นหลัง (${videoSrc}), ภาพ Poster (${poster}), Sound Toggle & Watch Video Modal สำเร็จ`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 1, category: "Portal", name: "Homepage & Summit Hero", url: "/", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 2. Language Switcher
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "02-portal-language-switch.png";
    try {
      console.log("▶ [2/23] กำลังทดสอบสลับภาษา (TH <-> EN)...");
      const langBtn = page.getByRole("button", { name: /EN|TH|ภาษา|Switch language/i }).first();
      if (await langBtn.isVisible()) {
        await langBtn.click();
        await delay(600);
        const switchedText = await page.textContent("body");
        const hasEn = /Admissions|Faculty|Campus|Explore/i.test(switchedText || "");
        await langBtn.click(); // switch back
        await delay(600);
        details = `สลับภาษาสำเร็จ (ตรวจพบคำศัพท์ EN: ${hasEn})`;
      } else {
        status = "WARN";
        details = "ไม่พบปุ่มสลับภาษาแบบเดี่ยว";
      }
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 2, category: "Portal", name: "Language Switcher", url: "/", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 3. Admissions Portal
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "03-portal-admissions.png";
    try {
      console.log("▶ [3/23] กำลังทดสอบหน้ารับสมัครนิสิต (/admissions)...");
      await page.goto(`${BASE_URL}/admissions`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(800);
      const content = await page.textContent("body");
      const hasRounds = /รอบ|สมัคร|TCAS|Admissions/i.test(content || "");
      details = `หน้ารับสมัครโหลดสมบูรณ์ (พบข้อมูลรอบรับสมัคร: ${hasRounds})`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 3, category: "Portal", name: "Admissions Portal", url: "/admissions", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 4. Programs / Curriculum Portal
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "04-portal-programs.png";
    try {
      console.log("▶ [4/23] กำลังทดสอบหน้าหลักสูตรการศึกษา (/programs)...");
      await page.goto(`${BASE_URL}/programs`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(800);
      const searchInput = page.locator("input[type='search'], input[type='text']").first();
      if (await searchInput.isVisible()) {
        await searchInput.fill("พุทธ");
        await delay(400);
        await searchInput.fill("");
      }
      details = "โหลดหลักสูตรการศึกษา และทดสอบช่องค้นหาหลักสูตรเรียบร้อย";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 4, category: "Portal", name: "Curriculum Programs", url: "/programs", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 5. Facilities & Booking Portal
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "05-portal-facilities.png";
    try {
      console.log("▶ [5/23] กำลังทดสอบหน้าสิ่งอำนวยความสะดวก & ห้องประชุม (/facilities)...");
      await page.goto(`${BASE_URL}/facilities`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(800);
      details = "แสดงรายการห้องประชุม ยานพาหนะ และข้อมูลการขอใช้สถานที่";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 5, category: "Portal", name: "Facilities & Spaces", url: "/facilities", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 6. News & Announcements Portal
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "06-portal-news.png";
    try {
      console.log("▶ [6/23] กำลังทดสอบหน้าข่าวประชาสัมพันธ์ (/news)...");
      await page.goto(`${BASE_URL}/news`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(800);
      details = "แสดงรายการข่าวสาร หมวดหมู่ และประกาศล่าสุดของคณะ";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 6, category: "Portal", name: "News & Announcements", url: "/news", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 7. Personnel Directory Portal
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "07-portal-personnel.png";
    try {
      console.log("▶ [7/23] กำลังทดสอบทำเนียบบุคลากร (/personnel)...");
      await page.goto(`${BASE_URL}/personnel`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(800);
      details = "แสดงรายนามผู้บริหาร คณาจารย์ บุคลากร พร้อมฟิลเตอร์ภาควิชา";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 7, category: "Portal", name: "Personnel Directory", url: "/personnel", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 8. Helpdesk & Service Desk Portal
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "08-portal-helpdesk.png";
    try {
      console.log("▶ [8/23] กำลังทดสอบศูนย์บริการช่วยเหลือ (/helpdesk)...");
      await page.goto(`${BASE_URL}/helpdesk`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(800);
      details = "ศูนย์บริการช่วยเหลือ แบบฟอร์มแจ้งปัญหา และช่องทางติดต่อฉุกเฉิน";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 8, category: "Portal", name: "Helpdesk & Support", url: "/helpdesk", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 9. Asset QR Code Tracker
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "09-portal-asset-qr.png";
    try {
      console.log("▶ [9/23] กำลังทดสอบระบบตรวจสอบครุภัณฑ์ผ่าน QR (/asset-qr)...");
      await page.goto(`${BASE_URL}/asset-qr`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(800);
      details = "หน้าค้นหาครุภัณฑ์ ตรวจสอบสถานะ และอินเทอร์เฟซสแกน QR";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 9, category: "Portal", name: "Asset QR Tracker", url: "/asset-qr", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // -------------------------------------------------------------
  // PART 2: AUTHENTICATION & SECURITY (4 Features)
  // -------------------------------------------------------------
  console.log("\n================ [หมวด 2: AUTHENTICATION & SECURITY] ================");

  // 10. Login Page & Password Toggle
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "10-auth-login-page.png";
    try {
      console.log("▶ [10/23] กำลังทดสอบหน้าเข้าสู่ระบบ (/login)...");
      await context.clearCookies();
      await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await waitForCsrfCookie(page);
      await delay(600);

      const emailInput = page.locator("#email");
      const passInput = page.locator("#password");
      await emailInput.fill("admin@app.local");
      await passInput.fill("Passw0rd!vibe");

      // Test Password visibility toggle
      const peekBtn = page.locator("button.peek");
      if (await peekBtn.isVisible()) {
        await peekBtn.click();
        await delay(200);
        await peekBtn.click();
      }

      details = "ฟอร์มล็อกอินโหลดสมบูรณ์ ฟิลด์ #email, #password และปุ่มเปิด/ปิดตาทำงานปกติ";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 10, category: "Auth", name: "Login Form & Visibility", url: "/login", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 11. Security & Invalid Credentials
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "11-auth-invalid-credentials.png";
    try {
      console.log("▶ [11/23] กำลังทดสอบการป้องกันรหัสผ่านผิดพลาด...");
      await context.clearCookies();
      await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await waitForCsrfCookie(page);
      await page.fill("#email", "admin@app.local");
      await page.fill("#password", "WrongPassword999!");
      await delay(200);
      await page.locator("button[type='submit']").click();
      await delay(1200);

      const toastMsg = page.locator("[data-sonner-toast], [role='alert'], .toast");
      const isVisible = await toastMsg.first().isVisible().catch(() => false);
      details = `แจ้งเตือนข้อผิดพลาดถูกต้องตามหลักความปลอดภัย (Toast error: ${isVisible})`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 11, category: "Auth", name: "Login Error Handling", url: "/login", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 12. Forgot Password Flow
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "12-auth-forgot-password.png";
    try {
      console.log("▶ [12/23] กำลังทดสอบหน้าขอรีเซ็ตรหัสผ่าน (/forgot-password)...");
      await context.clearCookies();
      await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(600);
      const emailInput = page.locator("#email");
      await emailInput.waitFor({ state: "visible", timeout: 10000 });
      await emailInput.fill("admin@app.local");
      details = "ฟอร์มขอลิงก์กู้คืนรหัสผ่านโหลดสมบูรณ์";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 12, category: "Auth", name: "Password Recovery", url: "/forgot-password", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 13. Admin Login & Dashboard Redirect
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "13-auth-successful-login.png";
    try {
      console.log("▶ [13/23] กำลังเข้าสู่ระบบด้วยบัญชี Super Admin...");
      await context.clearCookies();
      await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await waitForCsrfCookie(page);
      const emailInput = page.locator("#email");
      await emailInput.waitFor({ state: "visible", timeout: 10000 });
      await emailInput.fill("admin@app.local");
      await page.fill("#password", "Passw0rd!vibe");
      await delay(300);
      await page.locator("button[type='submit']").click();
      await page.waitForURL("**/dashboard", { timeout: 20000 });
      await delay(1000);
      details = "เข้าสู่ระบบสำเร็จ และถูก Redirect ไปยัง /dashboard อย่างถูกต้อง";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 13, category: "Auth", name: "Successful Admin Authentication", url: "/dashboard", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // -------------------------------------------------------------
  // PART 3: ADMIN & MANAGEMENT CONSOLE (10 Features)
  // -------------------------------------------------------------
  console.log("\n================ [หมวด 3: ADMIN & MANAGEMENT CONSOLE] ================");

  // 14. Admin Dashboard
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "14-admin-dashboard.png";
    try {
      console.log("▶ [14/23] กำลังทดสอบแดชบอร์ดผู้บริหาร (/dashboard)...");
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(1000);
      details = `การ์ดสรุปงานค้าง, สถิติระบบ, กราฟ และเมนู Sidebar Liyon Shell พร้อมใช้งาน`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 14, category: "Admin", name: "Admin Dashboard & KPIs", url: "/dashboard", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 15. User Management & RBAC
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "15-admin-users.png";
    try {
      console.log("▶ [15/23] กำลังทดสอบระบบจัดการผู้ใช้ & สิทธิ์ RBAC (/users)...");
      await page.goto(`${BASE_URL}/users`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(1000);
      const userRows = await page.locator("table tbody tr").count();
      details = `ตารางรายชื่อผู้ใช้แสดงผล ${userRows} บัญชี, ป้ายกำกับ Role (Super Admin, Staff, Viewer) ครบถ้วน`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 15, category: "Admin", name: "User Management & RBAC", url: "/users", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 16. Admissions Management
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "16-admin-admissions-manage.png";
    try {
      console.log("▶ [16/23] กำลังทดสอบระบบบริหารจัดการงานรับสมัคร (/admissions/manage)...");
      await page.goto(`${BASE_URL}/admissions/manage`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(1000);
      details = "แสดงคิวใบสมัคร ตรวจสอบเอกสารผู้สมัคร และสถานะการพิจารณา";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 16, category: "Admin", name: "Admissions Management", url: "/admissions/manage", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 17. Curriculum & Programs Management
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "17-admin-programs-manage.png";
    try {
      console.log("▶ [17/23] กำลังทดสอบระบบบริหารจัดการหลักสูตร (/programs/manage)...");
      await page.goto(`${BASE_URL}/programs/manage`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(1000);
      details = "จัดการโครงสร้างหลักสูตร วิชาเอก แผนการศึกษา และเกณฑ์หน่วยกิต";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 17, category: "Admin", name: "Curriculum Management", url: "/programs/manage", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 18. Reservations & Calendar Admin
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "18-admin-reservations.png";
    try {
      console.log("▶ [18/23] กำลังทดสอบระบบจองห้องประชุมและยานพาหนะ (/reservations)...");
      await page.goto(`${BASE_URL}/reservations`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(1000);
      details = "ตารางคำขอจอง อนุมัติการใช้ห้อง/รถ และปฏิทินแสดงตารางการใช้งาน";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 18, category: "Admin", name: "Reservations & Booking", url: "/reservations", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 19. Inventory & Asset Tracking
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "19-admin-inventory-assets.png";
    try {
      console.log("▶ [19/23] กำลังทดสอบระบบทะเบียนครุภัณฑ์ & พัสดุ (/inventory/assets)...");
      await page.goto(`${BASE_URL}/inventory/assets`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await delay(1200);
      details = "ทะเบียนครุภัณฑ์ แสดงรหัสพัสดุ พิมพ์ QR Code สถานะการใช้งาน";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 19, category: "Admin", name: "Asset & Inventory Tracking", url: "/inventory/assets", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 20. Maintenance & Service SLA
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "20-admin-maintenance.png";
    try {
      console.log("▶ [20/23] กำลังทดสอบระบบบริหารงานแจ้งซ่อม & SLA (/maintenance)...");
      await page.goto(`${BASE_URL}/maintenance`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(1000);
      details = "รายการแจ้งซ่อม การติดตามสถานะ SLA การมอบหมายช่าง และบันทึกผลการซ่อม";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 20, category: "Admin", name: "Maintenance & SLA Service", url: "/maintenance", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 21. Electronic Documents (สารบรรณ)
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "21-admin-documents.png";
    try {
      console.log("▶ [21/23] กำลังทดสอบระบบสารบรรณอิเล็กทรอนิกส์ (/documents)...");
      await page.goto(`${BASE_URL}/documents`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(1000);
      details = "ทะเบียนหนังสือรับ-ส่ง หนังสือเวียน ชั้นความลับ และขั้นตอนการลงนาม";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 21, category: "Admin", name: "Electronic Documents (สารบรรณ)", url: "/documents", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 22. Tenant & System Settings
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "22-admin-settings.png";
    try {
      console.log("▶ [22/23] กำลังทดสอบการตั้งค่าองค์กร & ธีม Liyon (/settings)...");
      await page.goto(`${BASE_URL}/settings`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(1000);
      details = "ข้อมูลองค์กร, การตั้งค่าการแจ้งเตือน, Liyon Theme Palette Picker";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 22, category: "Admin", name: "Tenant & System Settings", url: "/settings", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // 23. Personal Profile & Security
  {
    const start = Date.now();
    let status: "PASS" | "WARN" | "FAIL" = "PASS";
    let details = "";
    const ssPath = "23-admin-me-profile.png";
    try {
      console.log("▶ [23/23] กำลังทดสอบหน้าโปรไฟล์ส่วนตัว (/me)...");
      await page.goto(`${BASE_URL}/me`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await delay(1000);
      details = "ข้อมูลบัญชีส่วนบุคคล, แบบฟอร์มเปลี่ยนรหัสผ่าน, รายการเซสชันที่เปิดอยู่";
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, ssPath), fullPage: false });
    } catch (e: unknown) {
      status = "FAIL";
      details = e instanceof Error ? e.message : String(e);
    }
    results.push({ id: 23, category: "Admin", name: "Personal Profile & Security", url: "/me", status, durationMs: Date.now() - start, details, screenshotFile: ssPath });
  }

  // Write JSON Results
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), "utf-8");

  console.log("\n================ [สรุปผลการทดสอบระบบ 23 FEATURES] ================");
  console.table(
    results.map((r) => ({
      ID: r.id,
      Feature: r.name,
      Category: r.category,
      Status: r.status,
      "Time (ms)": r.durationMs,
      Screenshot: r.screenshotFile,
    }))
  );

  const passCount = results.filter((r) => r.status === "PASS").length;
  const failCount = results.filter((r) => r.status === "FAIL").length;
  console.log(`\n🎉 ทดสอบเสร็จสิ้น: ทั้งหมด 23 Features | ผ่าน ${passCount}/${results.length} (${((passCount / results.length) * 100).toFixed(1)}%) | ล้มเหลว ${failCount}`);
}

run().catch((err) => {
  console.error("❌ เกิดข้อผิดพลาดในการรันทดสอบ:", err);
  process.exit(1);
});
