import { prisma } from "@/shared/lib/infra/prisma";
import type { PersonnelType, AcademicPosition, Prisma } from "@/generated/prisma";
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreatePersonnelInput,
  UpdatePersonnelInput,
} from "./validations";

export interface DepartmentDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  order: number;
  personnelCount?: number;
}

export interface PersonnelProfileDto {
  id: string;
  tenantId: string;
  departmentId: string;
  departmentNameTh: string;
  departmentNameEn: string;
  userId: string | null;
  type: PersonnelType;
  academicPosition: AcademicPosition;
  prefixTh: string;
  prefixEn: string | null;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string | null;
  lastNameEn: string | null;
  fullNameTh: string;
  fullNameEn: string | null;
  email: string | null;
  phone: string | null;
  officeRoom: string | null;
  avatarUrl: string | null;
  education: unknown[];
  expertise: string[];
  publications: unknown[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function listDepartments(tenantId: string): Promise<DepartmentDto[]> {
  if (!tenantId) return [];
  const items = await prisma.department.findMany({
    where: { tenantId },
    include: { _count: { select: { personnel: true } } },
    orderBy: { order: "asc" },
  });

  return items.map((d) => ({
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    order: d.order,
    personnelCount: d._count.personnel,
  }));
}

export async function createDepartment(
  tenantId: string,
  input: CreateDepartmentInput
): Promise<DepartmentDto> {
  const created = await prisma.department.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      order: input.order,
    },
  });
  return {
    id: created.id,
    tenantId: created.tenantId,
    code: created.code,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    order: created.order,
  };
}

export async function updateDepartment(
  tenantId: string,
  input: UpdateDepartmentInput
): Promise<DepartmentDto> {
  const updated = await prisma.department.update({
    where: { id: input.id, tenantId },
    data: {
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      order: input.order,
    },
  });
  return {
    id: updated.id,
    tenantId: updated.tenantId,
    code: updated.code,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    order: updated.order,
  };
}

export async function listPersonnel(
  tenantId: string,
  filter?: {
    type?: PersonnelType;
    departmentId?: string;
    isActive?: boolean;
    search?: string;
  }
): Promise<PersonnelProfileDto[]> {
  if (!tenantId) return [];
  const where: Prisma.PersonnelProfileWhereInput = { tenantId };

  if (filter?.type) where.type = filter.type;
  if (filter?.departmentId) where.departmentId = filter.departmentId;
  if (filter?.isActive !== undefined) where.isActive = filter.isActive;

  if (filter?.search) {
    const q = filter.search.trim();
    where.OR = [
      { firstNameTh: { contains: q, mode: "insensitive" } },
      { lastNameTh: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { officeRoom: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.personnelProfile.findMany({
    where,
    include: { department: true },
    orderBy: [{ order: "asc" }, { firstNameTh: "asc" }],
  });

  return items.map((p) => {
    const fullNameTh = `${p.prefixTh} ${p.firstNameTh} ${p.lastNameTh}`;
    const fullNameEn = p.firstNameEn && p.lastNameEn ? `${p.prefixEn ? `${p.prefixEn} ` : ""}${p.firstNameEn} ${p.lastNameEn}` : null;

    return {
      id: p.id,
      tenantId: p.tenantId,
      departmentId: p.departmentId,
      departmentNameTh: p.department.nameTh,
      departmentNameEn: p.department.nameEn,
      userId: p.userId,
      type: p.type,
      academicPosition: p.academicPosition,
      prefixTh: p.prefixTh,
      prefixEn: p.prefixEn,
      firstNameTh: p.firstNameTh,
      lastNameTh: p.lastNameTh,
      firstNameEn: p.firstNameEn,
      lastNameEn: p.lastNameEn,
      fullNameTh,
      fullNameEn,
      email: p.email,
      phone: p.phone,
      officeRoom: p.officeRoom,
      avatarUrl: p.avatarUrl,
      education: (p.education as unknown[]) ?? [],
      expertise: (p.expertise as string[]) ?? [],
      publications: (p.publications as unknown[]) ?? [],
      order: p.order,
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  });
}

export async function getPersonnelById(
  tenantId: string,
  id: string
): Promise<PersonnelProfileDto | null> {
  const p = await prisma.personnelProfile.findFirst({
    where: { id, tenantId },
    include: { department: true },
  });
  if (!p) return null;

  const fullNameTh = `${p.prefixTh} ${p.firstNameTh} ${p.lastNameTh}`;
  const fullNameEn = p.firstNameEn && p.lastNameEn ? `${p.prefixEn ? `${p.prefixEn} ` : ""}${p.firstNameEn} ${p.lastNameEn}` : null;

  return {
    id: p.id,
    tenantId: p.tenantId,
    departmentId: p.departmentId,
    departmentNameTh: p.department.nameTh,
    departmentNameEn: p.department.nameEn,
    userId: p.userId,
    type: p.type,
    academicPosition: p.academicPosition,
    prefixTh: p.prefixTh,
    prefixEn: p.prefixEn,
    firstNameTh: p.firstNameTh,
    lastNameTh: p.lastNameTh,
    firstNameEn: p.firstNameEn,
    lastNameEn: p.lastNameEn,
    fullNameTh,
    fullNameEn,
    email: p.email,
    phone: p.phone,
    officeRoom: p.officeRoom,
    avatarUrl: p.avatarUrl,
    education: (p.education as unknown[]) ?? [],
    expertise: (p.expertise as string[]) ?? [],
    publications: (p.publications as unknown[]) ?? [],
    order: p.order,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function createPersonnel(
  tenantId: string,
  input: CreatePersonnelInput
): Promise<PersonnelProfileDto> {
  const created = await prisma.personnelProfile.create({
    data: {
      tenantId,
      departmentId: input.departmentId,
      userId: input.userId || null,
      type: input.type,
      academicPosition: input.academicPosition,
      prefixTh: input.prefixTh,
      prefixEn: input.prefixEn || null,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn || null,
      lastNameEn: input.lastNameEn || null,
      email: input.email || null,
      phone: input.phone || null,
      officeRoom: input.officeRoom || null,
      avatarUrl: input.avatarUrl || null,
      education: (input.education as unknown as Prisma.InputJsonValue) ?? [],
      expertise: (input.expertise as unknown as Prisma.InputJsonValue) ?? [],
      publications: (input.publications as unknown as Prisma.InputJsonValue) ?? [],
      order: input.order,
      isActive: input.isActive,
    },
  });

  return (await getPersonnelById(tenantId, created.id))!;
}

export async function updatePersonnel(
  tenantId: string,
  input: UpdatePersonnelInput
): Promise<PersonnelProfileDto> {
  await prisma.personnelProfile.update({
    where: { id: input.id, tenantId },
    data: {
      departmentId: input.departmentId,
      userId: input.userId || null,
      type: input.type,
      academicPosition: input.academicPosition,
      prefixTh: input.prefixTh,
      prefixEn: input.prefixEn || null,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn || null,
      lastNameEn: input.lastNameEn || null,
      email: input.email || null,
      phone: input.phone || null,
      officeRoom: input.officeRoom || null,
      avatarUrl: input.avatarUrl || null,
      education: (input.education as unknown as Prisma.InputJsonValue) ?? [],
      expertise: (input.expertise as unknown as Prisma.InputJsonValue) ?? [],
      publications: (input.publications as unknown as Prisma.InputJsonValue) ?? [],
      order: input.order,
      isActive: input.isActive,
    },
  });

  return (await getPersonnelById(tenantId, input.id))!;
}

export async function deletePersonnel(tenantId: string, id: string): Promise<void> {
  await prisma.personnelProfile.delete({ where: { id, tenantId } });
}
