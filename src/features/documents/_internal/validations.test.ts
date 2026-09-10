import { describe, it, expect } from "vitest";
import {
  createDocumentRequestSchema,
  approveDocumentStepSchema,
  rejectDocumentStepSchema,
  createDocumentTypeSchema,
} from "./validations";

describe("Documents Validations", () => {
  it("validates valid document request input", () => {
    const input = {
      typeId: "44444444-4444-4444-8444-444444444444",
      title: "ขออนุมัติเดินทางไปปฏิบัติงานราชการ",
      content: "รายละเอียดการเดินทาง...",
      totalSteps: 2,
      currentApproverRole: "DEPT_HEAD",
    };
    const parsed = createDocumentRequestSchema.parse(input);
    expect(parsed.title).toBe("ขออนุมัติเดินทางไปปฏิบัติงานราชการ");
    expect(parsed.totalSteps).toBe(2);
  });

  it("validates approve input", () => {
    const input = {
      documentId: "44444444-4444-4444-8444-444444444445",
      comment: "เห็นควรอนุมัติ",
    };
    const parsed = approveDocumentStepSchema.parse(input);
    expect(parsed.comment).toBe("เห็นควรอนุมัติ");
  });

  it("requires reason for rejection", () => {
    const input = {
      documentId: "44444444-4444-4444-8444-444444444445",
      rejectionReason: "",
    };
    expect(() => rejectDocumentStepSchema.parse(input)).toThrow();
  });

  it("validates document type input", () => {
    const input = {
      code: "DOC-REQ-LEAVE",
      nameTh: "แบบฟอร์มขอลา",
      nameEn: "Leave Form",
      isActive: true,
    };
    const parsed = createDocumentTypeSchema.parse(input);
    expect(parsed.code).toBe("DOC-REQ-LEAVE");
  });
});
