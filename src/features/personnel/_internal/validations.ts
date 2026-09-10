import { z } from "zod";

export const personnelTypeEnum = z.enum(["ACADEMIC", "SUPPORT"]);
export const academicPositionEnum = z.enum(["NONE", "LECTURER", "ASST_PROF", "ASSOC_PROF", "PROF"]);

export const createDepartmentSchema = z.object({
  code: z.string().min(2).max(50),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().min(1).max(255),
  order: z.number().int().default(0),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().uuid(),
});

export const createPersonnelSchema = z.object({
  departmentId: z.string().uuid(),
  userId: z.string().uuid().optional().nullable(),
  type: personnelTypeEnum.default("ACADEMIC"),
  academicPosition: academicPositionEnum.default("NONE"),
  prefixTh: z.string().min(1).max(50),
  prefixEn: z.string().max(50).optional().nullable(),
  firstNameTh: z.string().min(1).max(100),
  lastNameTh: z.string().min(1).max(100),
  firstNameEn: z.string().max(100).optional().nullable(),
  lastNameEn: z.string().max(100).optional().nullable(),
  email: z.string().email().or(z.literal("")).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  officeRoom: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().url().or(z.literal("")).optional().nullable(),
  education: z.array(z.record(z.string(), z.unknown())).default([]),
  expertise: z.array(z.string()).default([]),
  publications: z.array(z.record(z.string(), z.unknown())).default([]),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updatePersonnelSchema = createPersonnelSchema.extend({
  id: z.string().uuid(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type CreatePersonnelInput = z.infer<typeof createPersonnelSchema>;
export type UpdatePersonnelInput = z.infer<typeof updatePersonnelSchema>;
