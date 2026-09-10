import { z } from "zod";

export const admissionStatusEnum = z.enum([
  "DRAFT",
  "SUBMITTED",
  "DOCS_APPROVED",
  "DOCS_REJECTED",
  "INTERVIEW_ELIGIBLE",
  "PASSED",
  "REJECTED",
  "CANCELLED",
]);

export function validateThaiNationalId(id: string): boolean {
  if (id.length !== 13 || !/^[0-9]{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i), 10) * (13 - i);
  }
  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(id.charAt(12), 10);
}

export const createAdmissionRoundSchema = z.object({
  academicYear: z.number().int().min(2500).max(2600),
  roundName: z.string().min(2).max(150),
  startDate: z.string(),
  endDate: z.string(),
  announcementDate: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  quotas: z.array(
    z.object({
      programId: z.string().uuid(),
      quotaSeats: z.number().int().positive(),
      tuitionFee: z.number().nonnegative().optional().nullable(),
      criteriaTh: z.string().optional().nullable(),
    })
  ).optional().default([]),
});

export const submitStudentApplicationSchema = z.object({
  roundId: z.string().uuid(),
  programId: z.string().uuid(),
  nationalId: z.string().min(8).max(20).refine(
    (val) => {
      // If 13 digits, validate Thai ID, else accept as Passport (min 8 chars)
      if (/^[0-9]{13}$/.test(val)) return validateThaiNationalId(val);
      return val.length >= 8;
    },
    { message: "เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามหลักการคำนวณ" }
  ),
  title: z.string().max(20).optional().nullable(),
  applicantNameTh: z.string().min(2).max(255),
  applicantNameEn: z.string().max(255).optional().nullable(),
  email: z.string().email(),
  phone: z.string().min(9).max(50),
  schoolName: z.string().max(255).optional().nullable(),
  gpax: z.number().min(0).max(4.0).optional().nullable(),
  formData: z.record(z.string(), z.unknown()).optional().default({}),
  documents: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      type: z.string().optional(),
    })
  ).optional().default([]),
});

export const reviewApplicationSchema = z.object({
  id: z.string().uuid(),
  status: admissionStatusEnum,
  score: z.number().min(0).max(100).optional().nullable(),
  reviewerComment: z.string().optional().nullable(),
});

export type CreateAdmissionRoundInput = z.infer<typeof createAdmissionRoundSchema>;
export type SubmitStudentApplicationInput = z.infer<typeof submitStudentApplicationSchema>;
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;
