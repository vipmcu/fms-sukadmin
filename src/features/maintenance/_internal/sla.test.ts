import { describe, it, expect } from "vitest";
import { calculateSlaDeadline, isSlaBreached } from "./sla";

describe("SLA Deadline Calculation (calculateSlaDeadline)", () => {
  const baseDate = new Date("2026-10-15T10:00:00.000Z");

  it("CRITICAL: กำหนดเวลาแก้ไขภายใน 2 ชั่วโมง", () => {
    const deadline = calculateSlaDeadline("CRITICAL", baseDate);
    const diffHours = (deadline.getTime() - baseDate.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBe(2);
    expect(deadline.toISOString()).toBe("2026-10-15T12:00:00.000Z");
  });

  it("HIGH: กำหนดเวลาแก้ไขภายใน 24 ชั่วโมง (1 วัน)", () => {
    const deadline = calculateSlaDeadline("HIGH", baseDate);
    const diffHours = (deadline.getTime() - baseDate.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBe(24);
    expect(deadline.toISOString()).toBe("2026-10-16T10:00:00.000Z");
  });

  it("MEDIUM: กำหนดเวลาแก้ไขภายใน 72 ชั่วโมง (3 วัน)", () => {
    const deadline = calculateSlaDeadline("MEDIUM", baseDate);
    const diffHours = (deadline.getTime() - baseDate.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBe(72);
    expect(deadline.toISOString()).toBe("2026-10-18T10:00:00.000Z");
  });

  it("LOW: กำหนดเวลาแก้ไขภายใน 168 ชั่วโมง (7 วัน)", () => {
    const deadline = calculateSlaDeadline("LOW", baseDate);
    const diffHours = (deadline.getTime() - baseDate.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBe(168);
    expect(deadline.toISOString()).toBe("2026-10-22T10:00:00.000Z");
  });
});

describe("SLA Breach Detection (isSlaBreached)", () => {
  const deadline = new Date("2026-10-15T12:00:00.000Z");

  it("คืนค่า false เมื่อไม่มีการกำหนด SLA deadline", () => {
    expect(isSlaBreached(null, new Date())).toBe(false);
  });

  it("ไม่ถือว่าผิด SLA หากแก้ไขเสร็จก่อนกำหนด", () => {
    const resolvedAt = new Date("2026-10-15T11:45:00.000Z");
    expect(isSlaBreached(deadline, resolvedAt)).toBe(false);
  });

  it("ไม่ถือว่าผิด SLA หากแก้ไขเสร็จตรงเวลาพอดี", () => {
    const resolvedAt = new Date("2026-10-15T12:00:00.000Z");
    expect(isSlaBreached(deadline, resolvedAt)).toBe(false);
  });

  it("ตรวจพบว่าผิดข้อตกลง SLA เมื่อแก้ไขเสร็จหลังกำหนดเวลา", () => {
    const resolvedAt = new Date("2026-10-15T12:00:01.000Z");
    expect(isSlaBreached(deadline, resolvedAt)).toBe(true);
  });
});
