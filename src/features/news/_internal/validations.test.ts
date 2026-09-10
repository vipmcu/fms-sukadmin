import { describe, it, expect } from "vitest";
import { createNewsArticleSchema, createNewsCategorySchema } from "./validations";

describe("News Validations", () => {
  it("validates valid article input", () => {
    const input = {
      categoryId: "11111111-1111-4111-8111-111111111111",
      slug: "test-news-2026",
      titleTh: "หัวข้อข่าวทดสอบ",
      contentTh: "เนื้อหาข่าวแบบยาว...",
      status: "PUBLISHED",
      isPinned: false,
    };
    const parsed = createNewsArticleSchema.parse(input);
    expect(parsed.slug).toBe("test-news-2026");
    expect(parsed.titleTh).toBe("หัวข้อข่าวทดสอบ");
    expect(parsed.status).toBe("PUBLISHED");
  });

  it("rejects missing title or content", () => {
    const input = {
      categoryId: "11111111-1111-4111-8111-111111111111",
      slug: "test",
      titleTh: "",
      contentTh: "",
    };
    expect(() => createNewsArticleSchema.parse(input)).toThrow();
  });

  it("validates valid category input", () => {
    const input = {
      slug: "academic",
      nameTh: "ข่าววิชาการ",
      nameEn: "Academic News",
      color: "emerald",
      order: 1,
    };
    const parsed = createNewsCategorySchema.parse(input);
    expect(parsed.slug).toBe("academic");
    expect(parsed.color).toBe("emerald");
  });
});
