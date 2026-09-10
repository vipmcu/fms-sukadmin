import { prisma } from "@/shared/lib/infra/prisma";
import type { DegreeLevel, Prisma } from "@/generated/prisma";
import type {
  CreateProgramInput,
  UpdateProgramInput,
  CreateCourseInput,
} from "./validations";

export interface CurriculumCourseDto {
  id: string;
  programId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  credits: number;
  year: number;
  semester: number;
}

export interface AcademicProgramDto {
  id: string;
  tenantId: string;
  code: string;
  level: DegreeLevel;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  degreeEn: string;
  departmentId: string | null;
  departmentNameTh: string | null;
  totalCredits: number;
  durationYears: number;
  tuitionFeePerTerm: number | null;
  descriptionTh: string | null;
  descriptionEn: string | null;
  careerOpportunities: string[];
  curriculumPdfUrl: string | null;
  isAcceptingApplications: boolean;
  applicationLink: string | null;
  isActive: boolean;
  order: number;
  courses?: CurriculumCourseDto[];
  createdAt: string;
  updatedAt: string;
}

export async function listPrograms(
  tenantId: string,
  filter?: {
    level?: DegreeLevel;
    isActive?: boolean;
    search?: string;
  }
): Promise<AcademicProgramDto[]> {
  const where: Prisma.AcademicProgramWhereInput = { tenantId };

  if (filter?.level) where.level = filter.level;
  if (filter?.isActive !== undefined) where.isActive = filter.isActive;

  if (filter?.search) {
    const q = filter.search.trim();
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { nameTh: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.academicProgram.findMany({
    where,
    include: { department: true },
    orderBy: [{ order: "asc" }, { code: "asc" }],
  });

  return items.map((p) => ({
    id: p.id,
    tenantId: p.tenantId,
    code: p.code,
    level: p.level,
    nameTh: p.nameTh,
    nameEn: p.nameEn,
    degreeTh: p.degreeTh,
    degreeEn: p.degreeEn,
    departmentId: p.departmentId,
    departmentNameTh: p.department?.nameTh ?? null,
    totalCredits: p.totalCredits,
    durationYears: p.durationYears,
    tuitionFeePerTerm: p.tuitionFeePerTerm,
    descriptionTh: p.descriptionTh,
    descriptionEn: p.descriptionEn,
    careerOpportunities: (p.careerOpportunities as string[]) ?? [],
    curriculumPdfUrl: p.curriculumPdfUrl,
    isAcceptingApplications: p.isAcceptingApplications,
    applicationLink: p.applicationLink,
    isActive: p.isActive,
    order: p.order,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function getProgramById(
  tenantId: string,
  id: string
): Promise<AcademicProgramDto | null> {
  const p = await prisma.academicProgram.findFirst({
    where: { id, tenantId },
    include: {
      department: true,
      courses: { orderBy: [{ year: "asc" }, { semester: "asc" }, { code: "asc" }] },
    },
  });
  if (!p) return null;

  return {
    id: p.id,
    tenantId: p.tenantId,
    code: p.code,
    level: p.level,
    nameTh: p.nameTh,
    nameEn: p.nameEn,
    degreeTh: p.degreeTh,
    degreeEn: p.degreeEn,
    departmentId: p.departmentId,
    departmentNameTh: p.department?.nameTh ?? null,
    totalCredits: p.totalCredits,
    durationYears: p.durationYears,
    tuitionFeePerTerm: p.tuitionFeePerTerm,
    descriptionTh: p.descriptionTh,
    descriptionEn: p.descriptionEn,
    careerOpportunities: (p.careerOpportunities as string[]) ?? [],
    curriculumPdfUrl: p.curriculumPdfUrl,
    isAcceptingApplications: p.isAcceptingApplications,
    applicationLink: p.applicationLink,
    isActive: p.isActive,
    order: p.order,
    courses: p.courses.map((c) => ({
      id: c.id,
      programId: c.programId,
      code: c.code,
      nameTh: c.nameTh,
      nameEn: c.nameEn,
      credits: c.credits,
      year: c.year,
      semester: c.semester,
    })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function createProgram(
  tenantId: string,
  input: CreateProgramInput
): Promise<AcademicProgramDto> {
  const created = await prisma.academicProgram.create({
    data: {
      tenantId,
      code: input.code,
      level: input.level,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh,
      degreeEn: input.degreeEn,
      departmentId: input.departmentId || null,
      totalCredits: input.totalCredits,
      durationYears: input.durationYears,
      tuitionFeePerTerm: input.tuitionFeePerTerm || null,
      descriptionTh: input.descriptionTh || null,
      descriptionEn: input.descriptionEn || null,
      careerOpportunities: (input.careerOpportunities as unknown as Prisma.InputJsonValue) ?? [],
      curriculumPdfUrl: input.curriculumPdfUrl || null,
      isAcceptingApplications: input.isAcceptingApplications,
      applicationLink: input.applicationLink || null,
      isActive: input.isActive,
      order: input.order,
    },
  });

  return (await getProgramById(tenantId, created.id))!;
}

export async function updateProgram(
  tenantId: string,
  input: UpdateProgramInput
): Promise<AcademicProgramDto> {
  await prisma.academicProgram.update({
    where: { id: input.id, tenantId },
    data: {
      code: input.code,
      level: input.level,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTh: input.degreeTh,
      degreeEn: input.degreeEn,
      departmentId: input.departmentId || null,
      totalCredits: input.totalCredits,
      durationYears: input.durationYears,
      tuitionFeePerTerm: input.tuitionFeePerTerm || null,
      descriptionTh: input.descriptionTh || null,
      descriptionEn: input.descriptionEn || null,
      careerOpportunities: (input.careerOpportunities as unknown as Prisma.InputJsonValue) ?? [],
      curriculumPdfUrl: input.curriculumPdfUrl || null,
      isAcceptingApplications: input.isAcceptingApplications,
      applicationLink: input.applicationLink || null,
      isActive: input.isActive,
      order: input.order,
    },
  });

  return (await getProgramById(tenantId, input.id))!;
}

export async function deleteProgram(tenantId: string, id: string): Promise<void> {
  await prisma.academicProgram.delete({ where: { id, tenantId } });
}

export async function createCourse(input: CreateCourseInput): Promise<CurriculumCourseDto> {
  const created = await prisma.curriculumCourse.create({
    data: {
      programId: input.programId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      credits: input.credits,
      year: input.year,
      semester: input.semester,
    },
  });
  return created;
}

export async function deleteCourse(id: string): Promise<void> {
  await prisma.curriculumCourse.delete({ where: { id } });
}
