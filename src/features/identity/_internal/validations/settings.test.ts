import { describe, it, expect } from "vitest";
import { updateSettingsSchema } from "./settings";

describe("updateSettingsSchema - logoUrl validation", () => {
  const baseInput = {
    nameTh: "มหาวิทยาลัย",
    nameEn: "University",
    palette: "blue" as const,
  };

  it("ยอมรับค่าว่างสำหรับ logoUrl", () => {
    const r = updateSettingsSchema.safeParse({ ...baseInput, logoUrl: "" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.logoUrl).toBe("");
    }
  });

  it("ยอมรับ relative path จากการอัปโหลดไฟล์ เช่น /uploads/logos/logo-123.png", () => {
    const r = updateSettingsSchema.safeParse({
      ...baseInput,
      logoUrl: "/uploads/logos/logo-test-12345.png",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.logoUrl).toBe("/uploads/logos/logo-test-12345.png");
    }
  });

  it("ยอมรับ full URL (https:// หรือ http://)", () => {
    const rHttps = updateSettingsSchema.safeParse({
      ...baseInput,
      logoUrl: "https://cdn.example.com/images/logo.webp",
    });
    expect(rHttps.success).toBe(true);

    const rHttp = updateSettingsSchema.safeParse({
      ...baseInput,
      logoUrl: "http://storage.internal/assets/logo.svg",
    });
    expect(rHttp.success).toBe(true);
  });

  it("ปฏิเสธ string ที่ไม่ใช่ URL หรือ path (ไม่มี / นำหน้า และไม่ใช่ http:// หรือ https://)", () => {
    const r = updateSettingsSchema.safeParse({
      ...baseInput,
      logoUrl: "javascript:alert(1)",
    });
    expect(r.success).toBe(false);
  });

  it("ปฏิเสธ logoUrl ที่ยาวเกิน 500 ตัวอักษร (ตามขนาด VarChar ในฐานข้อมูล)", () => {
    const longUrl = "https://example.com/" + "a".repeat(500);
    const r = updateSettingsSchema.safeParse({
      ...baseInput,
      logoUrl: longUrl,
    });
    expect(r.success).toBe(false);
  });
});
