import { describe, it, expect } from "vitest";
import { calculateNewStock, isLowStock } from "./stock";

describe("Supply Stock Calculation (calculateNewStock)", () => {
  it("เติมสต็อก (Restock): ยอดคงเหลือเพิ่มขึ้นตามจำนวน", () => {
    const result = calculateNewStock(50, 20);
    expect(result).toBe(70);
  });

  it("เบิกจ่ายพัสดุ (Consume): ยอดคงเหลือลดลงตามจำนวน", () => {
    const result = calculateNewStock(50, -15);
    expect(result).toBe(35);
  });

  it("เบิกจ่ายจนสต็อกเหลือศูนย์พอดี (Empty Stock)", () => {
    const result = calculateNewStock(30, -30);
    expect(result).toBe(0);
  });

  it("โยน Error เมื่อเบิกจ่ายเกินยอดสต็อกที่มีอยู่จริง (Negative Stock Prevention)", () => {
    expect(() => calculateNewStock(10, -15)).toThrowError(
      "สต็อกไม่เพียงพอ (คงเหลือ 10 แต่ต้องการตัดจ่าย 15)"
    );
  });

  it("ไม่เปลี่ยนแปลงยอดเมื่อจำนวนเป็นศูนย์", () => {
    const result = calculateNewStock(42, 0);
    expect(result).toBe(42);
  });
});

describe("Low Stock Alert Detection (isLowStock)", () => {
  it("ตรวจพบสต็อกต่ำกว่าเกณฑ์ขั้นต่ำ (current < min)", () => {
    expect(isLowStock(3, 10)).toBe(true);
  });

  it("ตรวจพบสต็อกเท่ากับเกณฑ์ขั้นต่ำพอดี (current == min)", () => {
    expect(isLowStock(10, 10)).toBe(true);
  });

  it("สต็อกเหลือศูนย์ถือเป็นสต็อกต่ำ", () => {
    expect(isLowStock(0, 5)).toBe(true);
  });

  it("สต็อกเกินเกณฑ์ขั้นต่ำไม่ถือว่าเป็นสต็อกต่ำ (current > min)", () => {
    expect(isLowStock(11, 10)).toBe(false);
    expect(isLowStock(100, 10)).toBe(false);
  });
});
