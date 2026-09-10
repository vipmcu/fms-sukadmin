import { describe, it, expect } from "vitest";
import { isTimeOverlappingWithBuffer } from "./collision";

describe("Collision Detection with 30-min Buffer", () => {
  // Event A: 10:00 - 12:00
  const startA = new Date("2026-10-15T10:00:00.000Z");
  const endA = new Date("2026-10-15T12:00:00.000Z");

  it("ตรวจพบการชนเมื่อเวลาทับซ้อนกันโดยตรง (10:30 - 11:30)", () => {
    const startB = new Date("2026-10-15T10:30:00.000Z");
    const endB = new Date("2026-10-15T11:30:00.000Z");
    expect(isTimeOverlappingWithBuffer(startA, endA, startB, endB)).toBe(true);
  });

  it("ตรวจพบการชนเมื่อเริ่มทันทีหลังงานก่อนหน้าจบ (12:00 - 13:00) เนื่องจากติด Buffer 30 นาที", () => {
    const startB = new Date("2026-10-15T12:00:00.000Z");
    const endB = new Date("2026-10-15T13:00:00.000Z");
    expect(isTimeOverlappingWithBuffer(startA, endA, startB, endB)).toBe(true);
  });

  it("ตรวจพบการชนเมื่อเว้นว่างเพียง 15 นาทีหลังจบงาน (12:15 - 13:15) ซึ่งน้อยกว่า Buffer 30 นาที", () => {
    const startB = new Date("2026-10-15T12:15:00.000Z");
    const endB = new Date("2026-10-15T13:15:00.000Z");
    expect(isTimeOverlappingWithBuffer(startA, endA, startB, endB)).toBe(true);
  });

  it("ไม่พบการชนเมื่อเว้นระยะห่างมากกว่าหรือเท่ากับ Buffer 30 นาที (12:30 - 14:00)", () => {
    const startB = new Date("2026-10-15T12:30:00.000Z");
    const endB = new Date("2026-10-15T14:00:00.000Z");
    expect(isTimeOverlappingWithBuffer(startA, endA, startB, endB)).toBe(false);
  });

  it("ตรวจพบการชนเมื่อจบงานก่อนเริ่มงานหลักเพียง 10 นาที (09:00 - 09:50)", () => {
    const startB = new Date("2026-10-15T09:00:00.000Z");
    const endB = new Date("2026-10-15T09:50:00.000Z");
    expect(isTimeOverlappingWithBuffer(startA, endA, startB, endB)).toBe(true);
  });

  it("ไม่พบการชนเมื่อจบงานก่อนเริ่มงานหลักอย่างน้อย 30 นาที (08:00 - 09:30)", () => {
    const startB = new Date("2026-10-15T08:00:00.000Z");
    const endB = new Date("2026-10-15T09:30:00.000Z");
    expect(isTimeOverlappingWithBuffer(startA, endA, startB, endB)).toBe(false);
  });
});
