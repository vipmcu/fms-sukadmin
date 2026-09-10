import { describe, it, expect } from "vitest";
import { createAssetItemSchema, createSupplyItemSchema, adjustStockSchema } from "./validations";

describe("Assets Validations", () => {
  it("validates valid asset item input", () => {
    const input = {
      categoryId: "11111111-1111-4111-8111-111111111111",
      assetCode: "7440-001-0099/67",
      nameTh: "เครื่องคอมพิวเตอร์ทดสอบ",
      brandModel: "Dell OptiPlex 7090",
      status: "ACTIVE" as const,
      acquiredPrice: 25000,
    };
    const parsed = createAssetItemSchema.parse(input);
    expect(parsed.assetCode).toBe("7440-001-0099/67");
    expect(parsed.nameTh).toBe("เครื่องคอมพิวเตอร์ทดสอบ");
    expect(parsed.status).toBe("ACTIVE");
  });

  it("rejects asset item without code or name", () => {
    const input = {
      categoryId: "11111111-1111-4111-8111-111111111111",
      assetCode: "",
      nameTh: "",
    };
    expect(() => createAssetItemSchema.parse(input)).toThrow();
  });

  it("validates supply item input and stock adjustment", () => {
    const supply = {
      code: "SUP-A4",
      nameTh: "กระดาษ A4",
      unit: "รีม",
      currentStock: 50,
      minStock: 10,
    };
    const parsed = createSupplyItemSchema.parse(supply);
    expect(parsed.code).toBe("SUP-A4");
    expect(parsed.currentStock).toBe(50);

    const adj = {
      id: "22222222-2222-4222-8222-222222222222",
      quantityChange: -5,
      remarks: "เบิกใช้งานห้องประชุม",
    };
    const parsedAdj = adjustStockSchema.parse(adj);
    expect(parsedAdj.quantityChange).toBe(-5);
  });
});
