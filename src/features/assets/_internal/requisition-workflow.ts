import type { RequisitionStatus } from "@/generated/prisma";

export function canApproveRequisition(status: RequisitionStatus): boolean {
  return status === "PENDING";
}

export function canRejectRequisition(status: RequisitionStatus): boolean {
  return status === "PENDING";
}

export function canCancelRequisition(status: RequisitionStatus): boolean {
  return status === "PENDING";
}

export function canDispatchRequisition(status: RequisitionStatus): boolean {
  return status === "APPROVED";
}
