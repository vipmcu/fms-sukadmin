import { describe, it, expect } from "vitest";
import {
  canReviewDocument,
  canCancelDocument,
  calculateApprovalTransition,
  buildApproverRoleChain,
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
  it("อนุญาตให้ยกเลิกเมื่อสถานะเป็น DRAFT หรือ SUBMITTED", () => {
    expect(canCancelDocument("DRAFT")).toBe(true);
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
  it("ขั้นตอนระหว่างทาง: เลื่อนขั้นและดึงบทบาทถัดไปจาก roleChain", () => {
    const res = calculateApprovalTransition(1, 2, ["DEPT_HEAD", "DEAN"]);
    expect(res.isFinalStep).toBe(false);
    expect(res.nextStatus).toBe("IN_REVIEW");
    expect(res.nextStep).toBe(2);
    expect(res.nextRole).toBe("DEAN");
  });

  it("ขั้นตอนสุดท้าย: APPROVED และไม่มี nextRole", () => {
    const res = calculateApprovalTransition(2, 2, ["DEPT_HEAD", "DEAN"]);
    expect(res.isFinalStep).toBe(true);
    expect(res.nextStatus).toBe("APPROVED");
    expect(res.nextStep).toBe(2);
    expect(res.nextRole).toBeNull();
  });

  it("เอกสารขั้นตอนเดียว: จบทันทีเป็น APPROVED", () => {
    const res = calculateApprovalTransition(1, 1, ["DEPT_HEAD"]);
    expect(res.isFinalStep).toBe(true);
    expect(res.nextStatus).toBe("APPROVED");
    expect(res.nextRole).toBeNull();
  });

  it("ไม่มีบทบาทใน chain → nextRole เป็น null (ไม่ hardcode)", () => {
    const res = calculateApprovalTransition(1, 2, []);
    expect(res.nextRole).toBeNull();
  });

  it("โยนข้อผิดพลาดหากจำนวนขั้นตอนรวมน้อยกว่าหรือเท่ากับ 0", () => {
    expect(() => calculateApprovalTransition(1, 0)).toThrowError("totalSteps ต้องมากกว่า 0");
  });
});

describe("buildApproverRoleChain", () => {
  it("ใช้สายที่ส่งมาครบตามจำนวนขั้น", () => {
    expect(buildApproverRoleChain(2, "DEPT_HEAD", ["A", "B"])).toEqual(["A", "B"]);
  });

  it("เติมขั้นถัดไปด้วย fallback เมื่อไม่ได้ส่งสายครบ", () => {
    expect(buildApproverRoleChain(2, "DEPT_HEAD")).toEqual(["DEPT_HEAD", "DEAN"]);
  });
});
