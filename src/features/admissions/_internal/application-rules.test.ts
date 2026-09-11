import { describe, it, expect } from "vitest";
import {
  isRoundOpen,
  formatApplicationNo,
  isValidGpax,
} from "./application-rules";

describe("Admission Round Timing Rules (isRoundOpen)", () => {
  const startDate = new Date("2026-10-01T00:00:00.000Z");
  const endDate = new Date("2026-10-31T23:59:59.999Z");

  it("เปิดรับสมัครเมื่อวันเวลาปัจจุบันอยู่ระหว่าง startDate และ endDate", () => {
    const now = new Date("2026-10-15T12:00:00.000Z");
    expect(isRoundOpen(startDate, endDate, now)).toBe(true);
  });

  it("เปิดรับสมัครในวันแรกของการรับสมัคร (Boundary Check)", () => {
    expect(isRoundOpen(startDate, endDate, startDate)).toBe(true);
  });

  it("เปิดรับสมัครในมิลลิวินาทีสุดท้ายของการรับสมัคร (Boundary Check)", () => {
    expect(isRoundOpen(startDate, endDate, endDate)).toBe(true);
  });

  it("ยังไม่เปิดรับสมัครเมื่อเวลาก่อน startDate", () => {
    const before = new Date("2026-09-30T23:59:59.999Z");
    expect(isRoundOpen(startDate, endDate, before)).toBe(false);
  });

  it("ปิดรับสมัครแล้วเมื่อเวลาหลัง endDate", () => {
    const after = new Date("2026-11-01T00:00:00.000Z");
    expect(isRoundOpen(startDate, endDate, after)).toBe(false);
  });
});

describe("Application Number Generation (formatApplicationNo)", () => {
  it("สร้างรหัสใบสมัครลำดับแรกของปี พ.ศ. 2569 -> ADM-69-0001", () => {
    expect(formatApplicationNo(2569, 1)).toBe("ADM-69-0001");
  });

  it("สร้างรหัสใบสมัครลำดับที่ 42 -> ADM-69-0042", () => {
    expect(formatApplicationNo(2569, 42)).toBe("ADM-69-0042");
  });

  it("สร้างรหัสใบสมัครลำดับที่ 1024 -> ADM-69-1024", () => {
    expect(formatApplicationNo(2569, 1024)).toBe("ADM-69-1024");
  });

  it("สร้างรหัสใบสมัครของปี พ.ศ. 2570 -> ADM-70-0005", () => {
    expect(formatApplicationNo(2570, 5)).toBe("ADM-70-0005");
  });

  it("โยนข้อผิดพลาดหากลำดับเป็น 0 หรือติดลบ", () => {
    expect(() => formatApplicationNo(2569, 0)).toThrowError("ลำดับใบสมัครต้องมากกว่า 0");
    expect(() => formatApplicationNo(2569, -1)).toThrowError("ลำดับใบสมัครต้องมากกว่า 0");
  });
});

describe("GPAX Validation (isValidGpax)", () => {
  it("เกรดเฉลี่ยปกติระหว่าง 0.00 ถึง 4.00 ถูกต้อง", () => {
    expect(isValidGpax(3.5)).toBe(true);
    expect(isValidGpax(4.0)).toBe(true);
    expect(isValidGpax(0.0)).toBe(true);
    expect(isValidGpax(2.75)).toBe(true);
  });

  it("เกรดเฉลี่ยติดลบถือว่าไม่ถูกต้อง", () => {
    expect(isValidGpax(-0.1)).toBe(false);
  });

  it("เกรดเฉลี่ยเกิน 4.00 ถือว่าไม่ถูกต้อง", () => {
    expect(isValidGpax(4.01)).toBe(false);
    expect(isValidGpax(5.0)).toBe(false);
  });

  it("null หรือ undefined หรือ NaN ถือว่าไม่ถูกต้อง", () => {
    expect(isValidGpax(null)).toBe(false);
    expect(isValidGpax(undefined)).toBe(false);
    expect(isValidGpax(Number.NaN)).toBe(false);
  });
});
