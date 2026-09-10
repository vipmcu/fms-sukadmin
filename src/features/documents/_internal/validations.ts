import { z } from "zod";

export const documentStatusEnum = z.enum(["DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED", "CANCELLED"]);

export const createDocumentTypeSchema = z.object({
  code: z.string().min(2).max(50),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  descriptionTh: z.string().optional().nullable(),
  requiredFields: z.array(z.record(z.string(), z.unknown())).default([]),
  isActive: z.boolean().default(true),
});

export const updateDocumentTypeSchema = createDocumentTypeSchema.extend({
  id: z.string().uuid(),
});

export const createDocumentRequestSchema = z.object({
  typeId: z.string().uuid(),
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
  attachments: z.array(z.record(z.string(), z.unknown())).default([]),
  totalSteps: z.number().int().min(1).default(2),
  currentApproverRole: z.string().max(50).default("DEPT_HEAD"),
});

export const approveDocumentStepSchema = z.object({
  documentId: z.string().uuid(),
  comment: z.string().optional().nullable(),
  signatureUrl: z.string().url().or(z.literal("")).optional().nullable(),
});

export const rejectDocumentStepSchema = z.object({
  documentId: z.string().uuid(),
  rejectionReason: z.string().min(1, "กรุณาระบุเหตุผลการปฏิเสธหรือตีกลับเอกสาร"),
});

export const cancelDocumentRequestSchema = z.object({
  id: z.string().uuid(),
});

export type CreateDocumentTypeInput = z.infer<typeof createDocumentTypeSchema>;
export type UpdateDocumentTypeInput = z.infer<typeof updateDocumentTypeSchema>;
export type CreateDocumentRequestInput = z.infer<typeof createDocumentRequestSchema>;
export type ApproveDocumentStepInput = z.infer<typeof approveDocumentStepSchema>;
export type RejectDocumentStepInput = z.infer<typeof rejectDocumentStepSchema>;
