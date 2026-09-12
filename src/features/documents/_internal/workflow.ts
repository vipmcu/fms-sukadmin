import type { DocumentStatus } from "@/generated/prisma";

export interface StepTransitionResult {
  nextStatus: DocumentStatus;
  nextStep: number;
  nextRole: string | null;
  isFinalStep: boolean;
}

/** ตรวจสอบว่าเอกสารอยู่ในสถานะที่สามารถพิจารณาลงนามหรือปฏิเสธได้หรือไม่ */
export function canReviewDocument(status: DocumentStatus): boolean {
  return status === "SUBMITTED" || status === "IN_REVIEW";
}

/** ยกเลิกได้เมื่อยังเป็นร่างหรือเพิ่งยื่น และยังไม่เริ่มพิจารณา */
export function canCancelDocument(status: DocumentStatus): boolean {
  return status === "DRAFT" || status === "SUBMITTED";
}

/**
 * คำนวณขั้นตอนถัดไปเมื่ออนุมัติ
 * @param roleChain ลำดับบทบาทผู้อนุมัติ (index 0 = ขั้นที่ 1) — ขั้นถัดไปคือ roleChain[currentStep]
 */
export function calculateApprovalTransition(
  currentStep: number,
  totalSteps: number,
  roleChain: readonly string[] = []
): StepTransitionResult {
  if (totalSteps <= 0) {
    throw new Error("totalSteps ต้องมากกว่า 0");
  }
  const isFinalStep = currentStep >= totalSteps;
  return {
    isFinalStep,
    nextStatus: isFinalStep ? "APPROVED" : "IN_REVIEW",
    nextStep: isFinalStep ? currentStep : currentStep + 1,
    nextRole: isFinalStep ? null : (roleChain[currentStep] ?? null),
  };
}

/** สร้างสายบทบาทอนุมัติเมื่อผู้สร้างไม่ส่งมาครบ — ขั้นแรกใช้ currentApproverRole ที่เหลือใช้ fallbackRole */
export function buildApproverRoleChain(
  totalSteps: number,
  currentApproverRole: string,
  approverRoles?: readonly string[],
  fallbackRole = "DEAN"
): string[] {
  if (approverRoles && approverRoles.length === totalSteps) {
    return [...approverRoles];
  }
  return Array.from({ length: totalSteps }, (_, i) =>
    i === 0 ? currentApproverRole : (approverRoles?.[i] ?? fallbackRole)
  );
}
