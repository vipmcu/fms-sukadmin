import { describe, it, expect } from "vitest";
import {
  canReviewDocument,
  canCancelDocument,
  calculateApprovalTransition,
} from "./workflow";

describe("Document Review Permission (canReviewDocument)", () => {
  it("อนุญาตให้พิจารณาเมื่อสถานะเป็น SUBMITTED", () => {
    expect(canReviewDocument("SUBMITTED")).toBe(true);
  });

  it("อนุญาตให้พิจารณาเมื่อสถานะเป็น IN_REVIEW", () => {
    expect(canReviewDocument("IN_REVIEW")).toBe(true);
  });

  it("ไม่อนุญาตให้พิจารณาเมื่อสถานะเป็น APPROVED แล้ว", () => {
    expect(canReviewDocument("APPROVED")).toBe(false);
  });

  it("ไม่อนุญาตให้พิจารณาเมื่อสถานะเป็น REJECTED หรือ CANCELLED", () => {
    expect(canReviewDocument("REJECTED")).toBe(false);
    expect(canReviewDocument("CANCELLED")).toBe(false);
  });
});

describe("Document Cancellation Permission (canCancelDocument)", () => {
  it("อนุญาตให้ยกเลิกได้เฉพาะเมื่อสถานะเป็น SUBMITTED", () => {
    expect(canCancelDocument("SUBMITTED")).toBe(true);
  });

  it("ไม่อนุญาตให้ยกเลิกเมื่อเริ่มกระบวนการพิจารณาแล้ว (IN_REVIEW)", () => {
    expect(canCancelDocument("IN_REVIEW")).toBe(false);
  });

  it("ไม่อนุญาตให้ยกเลิกเมื่อเสร็จสิ้นแล้ว (APPROVED, REJECTED, CANCELLED)", () => {
    expect(canCancelDocument("APPROVED")).toBe(false);
    expect(canCancelDocument("REJECTED")).toBe(false);
    expect(canCancelDocument("CANCELLED")).toBe(false);
  });
});

describe("Sequential Approval Transitions (calculateApprovalTransition)", () => {
  it("ขั้นตอนระหว่างทาง (Step 1 จาก 2 ขั้นตอน): เลื่อนเป็น Step 2 สถานะ IN_REVIEW ส่งต่อคณบดี", () => {
    const res = calculateApprovalTransition(1, 2);
    expect(res.isFinalStep).toBe(false);
    expect(res.nextStatus).toBe("IN_REVIEW");
    expect(res.nextStep).toBe(2);
    expect(res.nextRole).toBe("DEAN");
  });

  it("ขั้นตอนสุดท้าย (Step 2 จาก 2 ขั้นตอน): ปรับสถานะเป็น APPROVED และเสร็จสิ้นขั้นตอน", () => {
    const res = calculateApprovalTransition(2, 2);
    expect(res.isFinalStep).toBe(true);
    expect(res.nextStatus).toBe("APPROVED");
    expect(res.nextStep).toBe(2);
    expect(res.nextRole).toBeNull();
  });

  it("เอกสารขั้นตอนเดียว (Step 1 จาก 1 ขั้นตอน): จบขั้นตอนทันทีเป็น APPROVED", () => {
    const res = calculateApprovalTransition(1, 1);
    expect(res.isFinalStep).toBe(true);
    expect(res.nextStatus).toBe("APPROVED");
    expect(res.nextRole).toBeNull();
  });

  it("โยนข้อผิดพลาดหากจำนวนขั้นตอนรวมน้อยกว่าหรือเท่ากับ 0", () => {
    expect(() => calculateApprovalTransition(1, 0)).toThrowError("totalSteps ต้องมากกว่า 0");
  });
});
