import { describe, it, expect } from "vitest";
import {
  canApproveRequisition,
  canRejectRequisition,
  canCancelRequisition,
  canDispatchRequisition,
} from "./requisition-workflow";

describe("Supply requisition workflow guards", () => {
  it("allows approve/reject/cancel only while PENDING", () => {
    expect(canApproveRequisition("PENDING")).toBe(true);
    expect(canRejectRequisition("PENDING")).toBe(true);
    expect(canCancelRequisition("PENDING")).toBe(true);

    for (const status of ["APPROVED", "DISPATCHED", "REJECTED", "CANCELLED"] as const) {
      expect(canApproveRequisition(status)).toBe(false);
      expect(canRejectRequisition(status)).toBe(false);
      expect(canCancelRequisition(status)).toBe(false);
    }
  });

  it("allows dispatch only when APPROVED", () => {
    expect(canDispatchRequisition("APPROVED")).toBe(true);
    for (const status of ["PENDING", "DISPATCHED", "REJECTED", "CANCELLED"] as const) {
      expect(canDispatchRequisition(status)).toBe(false);
    }
  });
});
