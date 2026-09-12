import { test, expect } from "@playwright/test";
import { expectNoRawI18nKeys } from "./helpers";

/** สร้างเลขบัตรประชาชน 13 หลักที่ผ่าน checksum */
function makeThaiNationalId(seed: string): string {
  const digits = seed.replace(/\D/g, "").padStart(12, "1").slice(0, 12);
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(digits[i]) * (13 - i);
  const check = (11 - (sum % 11)) % 10;
  return `${digits}${check}`;
}

test.describe("admissions apply and tracking", () => {
  test("ติดตามใบสมัครจากข้อมูล seed ได้", async ({ page }) => {
    await page.goto("/admissions/tracking");
    await page.fill("#national-id", "1100400123456");
    await page.fill("#application-no", "ADM-2569-0001");
    await page.getByRole("button", { name: /ค้นหาสถานะใบสมัคร/ }).click();
    await expect(page.getByText(/เอกสารผ่านการตรวจสอบแล้ว/)).toBeVisible();
    await expectNoRawI18nKeys(page);
  });

  test("สมัครเรียนออนไลน์แล้วติดตามด้วยเลขที่ใบสมัครใหม่", async ({ page }) => {
    const nationalId = makeThaiNationalId(`9${Date.now().toString().slice(-11)}`);

    await page.goto("/admissions/apply");
    await expect(page.getByRole("heading", { name: /ขั้นตอนที่ 1/ })).toBeVisible();

    await page.getByRole("button", { name: /ถัดไป: กรอกข้อมูลส่วนตัว/ }).click();
    await expect(page.getByRole("heading", { name: /ขั้นตอนที่ 2/ })).toBeVisible();

    await page.fill("#applicant-name-th", "ทดสอบ อีทูอี");
    await page.fill("#applicant-national-id", nationalId);
    await page.fill("#applicant-phone", "0812345678");
    await page.fill("#applicant-email", `e2e-${Date.now()}@example.com`);
    await page.getByRole("button", { name: /ถัดไป: แนบหลักฐานเอกสาร/ }).click();
    await expect(page.getByRole("heading", { name: /ขั้นตอนที่ 3/ })).toBeVisible();

    await page.getByRole("button", { name: /ถัดไป: ตรวจทานและยืนยัน/ }).click();
    await expect(page.getByRole("heading", { name: /ขั้นตอนที่ 4/ })).toBeVisible();

    await page.getByRole("button", { name: /ยืนยันส่งใบสมัคร/ }).click();

    const success = page.getByRole("heading", { name: /ยื่นใบสมัครออนไลน์สำเร็จ/ });
    const errorToast = page.locator("[data-sonner-toast][data-type='error']").first();
    await Promise.race([
      success.waitFor({ state: "visible", timeout: 25_000 }),
      errorToast.waitFor({ state: "visible", timeout: 25_000 }).then(async () => {
        throw new Error(`submit failed: ${await errorToast.innerText()}`);
      }),
    ]);
    await expect(success).toBeVisible();

    const appNoEl = page.locator(".font-mono.text-lg").first();
    await expect(appNoEl).toBeVisible();
    const appNo = (await appNoEl.innerText()).trim();
    expect(appNo).toMatch(/^ADM-\d{2,4}-\d{4}$/);

    await page.goto(
      `/admissions/tracking?appNo=${encodeURIComponent(appNo)}&id=${encodeURIComponent(nationalId)}`
    );
    await expect(page.getByText(/รอตรวจสอบเอกสารหลักฐาน/)).toBeVisible({ timeout: 15_000 });
  });
});
