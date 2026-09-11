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

/** ตรวจสอบว่าเอกสารสามารถยกเลิกโดยผู้ยื่นได้หรือไม่ (ยกเลิกได้เฉพาะเมื่อยังไม่ได้เริ่มพิจารณา) */
export function canCancelDocument(status: DocumentStatus): boolean {
  return status === "SUBMITTED";
}

/** คำนวณขั้นตอนและสถานะถัดไปเมื่อมีการอนุมัติเอกสาร */
export function calculateApprovalTransition(currentStep: number, totalSteps: number): StepTransitionResult {
  if (totalSteps <= 0) {
    throw new Error("totalSteps ต้องมากกว่า 0");
  }
  const isFinalStep = currentStep >= totalSteps;
  return {
    isFinalStep,
    nextStatus: isFinalStep ? "APPROVED" : "IN_REVIEW",
    nextStep: isFinalStep ? currentStep : currentStep + 1,
    nextRole: isFinalStep ? null : "DEAN",
  };
}
