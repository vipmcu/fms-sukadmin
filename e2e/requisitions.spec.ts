import { test, expect } from "@playwright/test";

test.describe("supply requisition workflow", () => {
  test("สร้าง → อนุมัติ → จ่ายวัสดุ และตัดสต็อก", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/inventory/requisitions");
    // รอ compile รอบแรกของ route ใหม่ — บางครั้ง Next ตอบ 404 ชั่วคราว
    await expect(async () => {
      if ((await page.getByRole("heading", { name: "404" }).count()) > 0) {
        await page.reload();
      }
      await expect(
        page.getByRole("heading", { name: /คำขอเบิกวัสดุสิ้นเปลือง|Supply Requisitions/ })
      ).toBeVisible({ timeout: 5_000 });
    }).toPass({ timeout: 60_000 });

    await page.getByRole("button", { name: /ยื่นคำขอเบิก|New requisition/ }).click();
    await page.locator("textarea").first().fill("E2E supply requisition");
    await page.getByRole("button", { name: /บันทึกข้อมูล|Save/ }).click();
    await expect(page.getByText(/ยื่นคำขอเบิกวัสดุสำเร็จ|Requisition submitted/)).toBeVisible();
    await expect(page.getByText(/REQ-\d{6}-\d{4}/).first()).toBeVisible();

    await page.getByRole("button", { name: /อนุมัติ|Approve/ }).first().click();
    await expect(page.getByText(/อนุมัติคำขอแล้ว|Requisition approved/)).toBeVisible();

    await page.getByRole("button", { name: /จ่ายวัสดุ|Dispatch/ }).first().click();
    await expect(page.getByText(/จ่ายวัสดุและตัดสต็อกแล้ว|Supplies dispatched/)).toBeVisible();
    await expect(page.getByText(/จ่ายแล้ว|Dispatched/).first()).toBeVisible();
  });
});
