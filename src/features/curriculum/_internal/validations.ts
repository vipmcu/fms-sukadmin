import { z } from "zod";

export const degreeLevelEnum = z.enum(["BACHELOR", "MASTER", "DOCTORAL", "CERTIFICATE"]);

export const createProgramSchema = z.object({
  code: z.string().min(2).max(50),
  level: degreeLevelEnum,
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  degreeTh: z.string().min(1).max(255),
  degreeEn: z.string().min(1).max(255),
  departmentId: z.string().uuid().optional().nullable(),
  totalCredits: z.number().int().min(1),
  durationYears: z.number().min(0.5).default(4.0),
  tuitionFeePerTerm: z.number().min(0).optional().nullable(),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  careerOpportunities: z.array(z.string()).default([]),
  curriculumPdfUrl: z.string().url().or(z.literal("")).optional().nullable(),
  isAcceptingApplications: z.boolean().default(true),
  applicationLink: z.string().url().or(z.literal("")).optional().nullable(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const updateProgramSchema = createProgramSchema.extend({
  id: z.string().uuid(),
});

export const createCourseSchema = z.object({
  programId: z.string().uuid(),
  code: z.string().min(2).max(50),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  credits: z.number().int().min(1),
  year: z.number().int().min(1).max(6),
  semester: z.number().int().min(1).max(3),
});

export const updateCourseSchema = createCourseSchema.extend({
  id: z.string().uuid(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
