import { test, expect } from "@playwright/test";
import { expectNoRawI18nKeys } from "./helpers";

test.describe("portal public routes", () => {
  test("หน้า admissions โหลดและไม่มี i18n key ดิบ", async ({ page }) => {
    await page.goto("/admissions");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expectNoRawI18nKeys(page);
  });

  test("หน้า helpdesk โหลดฟอร์มแจ้งซ่อม", async ({ page }) => {
    await page.goto("/helpdesk");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expect(page.locator("form").first()).toBeVisible();
    await expectNoRawI18nKeys(page);
  });

  test("หน้า facilities โหลดได้", async ({ page }) => {
    await page.goto("/facilities");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expectNoRawI18nKeys(page);
  });
});
