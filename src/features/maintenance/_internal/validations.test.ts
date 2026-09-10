import { describe, it, expect } from "vitest";
import { createServiceTicketSchema, resolveTicketSchema, rateTicketSchema } from "./validations";
import { calculateSlaDeadline, isSlaBreached } from "./sla";

describe("Maintenance Validations & SLA", () => {
  it("validates service ticket creation input", () => {
    const input = {
      categoryId: "11111111-1111-4111-8111-111111111111",
      title: "แอร์ห้อง 1301 ไม่เย็น",
      description: "แอร์มีเสียงดังผิดปกติและมีน้ำหยดลงพื้น",
      location: "อาคาร 1 ห้อง 1301",
      priority: "CRITICAL" as const,
      requesterName: "อ.สมชาย",
      requesterEmail: "somchai@university.ac.th",
      requesterPhone: "081-999-8888",
    };
    const parsed = createServiceTicketSchema.parse(input);
    expect(parsed.title).toBe("แอร์ห้อง 1301 ไม่เย็น");
    expect(parsed.priority).toBe("CRITICAL");
  });

  it("calculates SLA deadline properly based on priority", () => {
    const now = new Date("2026-09-10T10:00:00Z");
    const criticalDeadline = calculateSlaDeadline("CRITICAL", now);
    expect(criticalDeadline.toISOString()).toBe("2026-09-10T12:00:00.000Z"); // +2h

    const highDeadline = calculateSlaDeadline("HIGH", now);
    expect(highDeadline.toISOString()).toBe("2026-09-11T10:00:00.000Z"); // +24h
  });

  it("evaluates SLA breach", () => {
    const deadline = new Date("2026-09-10T12:00:00Z");
    const onTime = new Date("2026-09-10T11:59:00Z");
    const late = new Date("2026-09-10T12:01:00Z");

    expect(isSlaBreached(deadline, onTime)).toBe(false);
    expect(isSlaBreached(deadline, late)).toBe(true);
  });

  it("validates ticket resolution and rating", () => {
    const resolveInput = {
      id: "22222222-2222-4222-8222-222222222222",
      resolutionNotes: "ล้างแผ่นกรองอากาศและเติมน้ำยาแอร์เรียบร้อยแล้ว",
      partsCost: 850,
    };
    const parsedResolve = resolveTicketSchema.parse(resolveInput);
    expect(parsedResolve.partsCost).toBe(850);

    const ratingInput = {
      ticketId: "22222222-2222-4222-8222-222222222222",
      score: 5,
      feedback: "ช่างบริการรวดเร็วและเรียบร้อยมากครับ",
    };
    const parsedRating = rateTicketSchema.parse(ratingInput);
    expect(parsedRating.score).toBe(5);
  });
});
