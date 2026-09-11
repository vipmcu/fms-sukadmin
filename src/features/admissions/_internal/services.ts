import { prisma } from "@/shared/lib/infra/prisma";
import { Prisma, type AdmissionStatus } from "@/generated/prisma";
import { maskName } from "@/shared/lib/security/mask";
import type {
  CreateAdmissionRoundInput,
  SubmitStudentApplicationInput,
  ReviewApplicationInput,
} from "./validations";
import { isRoundOpen, formatApplicationNo } from "./application-rules";

export interface AdmissionQuotaDto {
  id: string;
  programId: string;
  programNameTh: string;
  programCode: string;
  quotaSeats: number;
  tuitionFee: number | null;
  criteriaTh: string | null;
}

export interface AdmissionRoundDto {
  id: string;
  tenantId: string;
  academicYear: number;
  roundName: string;
  startDate: string;
  endDate: string;
  announcementDate: string | null;
  isActive: boolean;
  isOpen: boolean;
  quotas: AdmissionQuotaDto[];
  applicationCount?: number;
  createdAt: string;
}

export interface StudentApplicationDto {
  id: string;
  tenantId: string;
  roundId: string;
  roundName: string;
  programId: string;
  programNameTh: string;
  programCode: string;
  applicationNo: string;
  nationalId: string;
  title: string | null;
  applicantNameTh: string;
  applicantNameEn: string | null;
  email: string;
  phone: string;
  schoolName: string | null;
  gpax: number | null;
  formData: Record<string, unknown>;
  documents: Array<{ name: string; url: string; type?: string }>;
  status: AdmissionStatus;
  score: number | null;
  reviewerComment: string | null;
  reviewedById: string | null;
  reviewedByName?: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicApplicationStatusDto {
  applicationNo: string;
  maskedName: string;
  programNameTh: string;
  roundName: string;
  status: AdmissionStatus;
  score: number | null;
  submittedAt: string;
}

export async function listAdmissionRounds(tenantId: string, onlyActive = false): Promise<AdmissionRoundDto[]> {
  if (!tenantId) return [];
  const now = new Date();
  const where: Prisma.AdmissionRoundWhereInput = { tenantId };
  if (onlyActive) {
    where.isActive = true;
  }

  const items = await prisma.admissionRound.findMany({
    where,
    include: {
      quotas: {
        include: { program: { select: { nameTh: true, code: true } } },
      },
      _count: { select: { applications: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return items.map((r) => ({
    id: r.id,
    tenantId: r.tenantId,
    academicYear: r.academicYear,
    roundName: r.roundName,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate.toISOString(),
    announcementDate: r.announcementDate ? r.announcementDate.toISOString() : null,
    isActive: r.isActive,
    isOpen: r.isActive && r.startDate <= now && r.endDate >= now,
    applicationCount: r._count.applications,
    quotas: r.quotas.map((q) => ({
      id: q.id,
      programId: q.programId,
      programNameTh: q.program.nameTh,
      programCode: q.program.code,
      quotaSeats: q.quotaSeats,
      tuitionFee: q.tuitionFee ? Number(q.tuitionFee) : null,
      criteriaTh: q.criteriaTh,
    })),
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getAdmissionRoundById(tenantId: string, id: string): Promise<AdmissionRoundDto | null> {
  const now = new Date();
  const r = await prisma.admissionRound.findFirst({
    where: { id, tenantId },
    include: {
      quotas: {
        include: { program: { select: { nameTh: true, code: true } } },
      },
      _count: { select: { applications: true } },
    },
  });

  if (!r) return null;

  return {
    id: r.id,
    tenantId: r.tenantId,
    academicYear: r.academicYear,
    roundName: r.roundName,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate.toISOString(),
    announcementDate: r.announcementDate ? r.announcementDate.toISOString() : null,
    isActive: r.isActive,
    isOpen: r.isActive && r.startDate <= now && r.endDate >= now,
    applicationCount: r._count.applications,
    quotas: r.quotas.map((q) => ({
      id: q.id,
      programId: q.programId,
      programNameTh: q.program.nameTh,
      programCode: q.program.code,
      quotaSeats: q.quotaSeats,
      tuitionFee: q.tuitionFee ? Number(q.tuitionFee) : null,
      criteriaTh: q.criteriaTh,
    })),
    createdAt: r.createdAt.toISOString(),
  };
}

export async function createAdmissionRound(
  tenantId: string,
  input: CreateAdmissionRoundInput,
  _actorId: string
): Promise<AdmissionRoundDto> {
  const round = await prisma.$transaction(async (tx) => {
    const created = await tx.admissionRound.create({
      data: {
        tenantId,
        academicYear: input.academicYear,
        roundName: input.roundName,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        announcementDate: input.announcementDate ? new Date(input.announcementDate) : null,
        isActive: input.isActive,
        quotas: {
          create: input.quotas.map((q) => ({
            programId: q.programId,
            quotaSeats: q.quotaSeats,
            tuitionFee: q.tuitionFee ? new Prisma.Decimal(q.tuitionFee) : null,
            criteriaTh: q.criteriaTh,
          })),
        },
      },
      include: {
        quotas: {
          include: { program: { select: { nameTh: true, code: true } } },
        },
        _count: { select: { applications: true } },
      },
    });

    return created;
  });

  const now = new Date();
  return {
    id: round.id,
    tenantId: round.tenantId,
    academicYear: round.academicYear,
    roundName: round.roundName,
    startDate: round.startDate.toISOString(),
    endDate: round.endDate.toISOString(),
    announcementDate: round.announcementDate ? round.announcementDate.toISOString() : null,
    isActive: round.isActive,
    isOpen: round.isActive && round.startDate <= now && round.endDate >= now,
    applicationCount: 0,
    quotas: round.quotas.map((q) => ({
      id: q.id,
      programId: q.programId,
      programNameTh: q.program.nameTh,
      programCode: q.program.code,
      quotaSeats: q.quotaSeats,
      tuitionFee: q.tuitionFee ? Number(q.tuitionFee) : null,
      criteriaTh: q.criteriaTh,
    })),
    createdAt: round.createdAt.toISOString(),
  };
}

export async function listStudentApplications(
  tenantId: string,
  filter?: { roundId?: string; programId?: string; status?: AdmissionStatus; search?: string }
): Promise<StudentApplicationDto[]> {
  if (!tenantId) return [];
  const where: Prisma.StudentApplicationWhereInput = { tenantId };

  if (filter?.roundId) where.roundId = filter.roundId;
  if (filter?.programId) where.programId = filter.programId;
  if (filter?.status) where.status = filter.status;
  if (filter?.search) {
    where.OR = [
      { applicationNo: { contains: filter.search, mode: "insensitive" } },
      { nationalId: { contains: filter.search } },
      { applicantNameTh: { contains: filter.search, mode: "insensitive" } },
      { email: { contains: filter.search, mode: "insensitive" } },
      { schoolName: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const items = await prisma.studentApplication.findMany({
    where,
    include: {
      round: { select: { roundName: true } },
      program: { select: { nameTh: true, code: true } },
      reviewedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    roundId: a.roundId,
    roundName: a.round.roundName,
    programId: a.programId,
    programNameTh: a.program.nameTh,
    programCode: a.program.code,
    applicationNo: a.applicationNo,
    nationalId: a.nationalId,
    title: a.title,
    applicantNameTh: a.applicantNameTh,
    applicantNameEn: a.applicantNameEn,
    email: a.email,
    phone: a.phone,
    schoolName: a.schoolName,
    gpax: a.gpax,
    formData: (a.formData as Record<string, unknown>) || {},
    documents: (a.documents as Array<{ name: string; url: string; type?: string }>) || [],
    status: a.status,
    score: a.score,
    reviewerComment: a.reviewerComment,
    reviewedById: a.reviewedById,
    reviewedByName: a.reviewedBy?.name || null,
    reviewedAt: a.reviewedAt ? a.reviewedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}

export async function submitStudentApplication(
  tenantId: string,
  input: SubmitStudentApplicationInput
): Promise<StudentApplicationDto> {
  const created = await prisma.$transaction(async (tx) => {
    const round = await tx.admissionRound.findFirst({
      where: { id: input.roundId, tenantId, isActive: true },
    });
    if (!round) {
      throw new Error("ไม่พบรอบการรับสมัคร หรือรอบนี้ปิดรับสมัครแล้ว");
    }

    if (!isRoundOpen(round.startDate, round.endDate)) {
      throw new Error("รอบการรับสมัครนี้สิ้นสุดลงแล้วหรือไม่ยังไม่เปิดรับสมัคร");
    }

    const existing = await tx.studentApplication.findFirst({
      where: {
        tenantId,
        roundId: input.roundId,
        programId: input.programId,
        nationalId: input.nationalId,
      },
    });
    if (existing) {
      throw new Error("ท่านได้ยื่นสมัครในหลักสูตรนี้ของรอบนี้แล้ว");
    }

    // Generate Application No (ADM-YY-XXXX)
    const count = await tx.studentApplication.count({
      where: { tenantId, roundId: input.roundId },
    });
    const applicationNo = formatApplicationNo(round.academicYear, count + 1);

    return tx.studentApplication.create({
      data: {
        tenantId,
        roundId: input.roundId,
        programId: input.programId,
        applicationNo,
        nationalId: input.nationalId,
        title: input.title,
        applicantNameTh: input.applicantNameTh,
        applicantNameEn: input.applicantNameEn,
        email: input.email,
        phone: input.phone,
        schoolName: input.schoolName,
        gpax: input.gpax,
        formData: (input.formData as Prisma.InputJsonValue) ?? {},
        documents: (input.documents as unknown as Prisma.InputJsonValue) ?? [],
        status: "SUBMITTED",
      },
      include: {
        round: { select: { roundName: true } },
        program: { select: { nameTh: true, code: true } },
      },
    });
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    roundId: created.roundId,
    roundName: created.round.roundName,
    programId: created.programId,
    programNameTh: created.program.nameTh,
    programCode: created.program.code,
    applicationNo: created.applicationNo,
    nationalId: created.nationalId,
    title: created.title,
    applicantNameTh: created.applicantNameTh,
    applicantNameEn: created.applicantNameEn,
    email: created.email,
    phone: created.phone,
    schoolName: created.schoolName,
    gpax: created.gpax,
    formData: (created.formData as Record<string, unknown>) || {},
    documents: (created.documents as Array<{ name: string; url: string; type?: string }>) || [],
    status: created.status,
    score: null,
    reviewerComment: null,
    reviewedById: null,
    reviewedAt: null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function reviewStudentApplication(
  tenantId: string,
  input: ReviewApplicationInput,
  reviewerId: string
): Promise<StudentApplicationDto> {
  const existing = await prisma.studentApplication.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw new Error("ไม่พบข้อมูลใบสมัครที่ต้องการประเมิน");
  }

  const updated = await prisma.studentApplication.update({
    where: { id: input.id },
    data: {
      status: input.status,
      score: input.score !== undefined ? input.score : existing.score,
      reviewerComment: input.reviewerComment !== undefined ? input.reviewerComment : existing.reviewerComment,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    },
    include: {
      round: { select: { roundName: true } },
      program: { select: { nameTh: true, code: true } },
      reviewedBy: { select: { name: true } },
    },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    roundId: updated.roundId,
    roundName: updated.round.roundName,
    programId: updated.programId,
    programNameTh: updated.program.nameTh,
    programCode: updated.program.code,
    applicationNo: updated.applicationNo,
    nationalId: updated.nationalId,
    title: updated.title,
    applicantNameTh: updated.applicantNameTh,
    applicantNameEn: updated.applicantNameEn,
    email: updated.email,
    phone: updated.phone,
    schoolName: updated.schoolName,
    gpax: updated.gpax,
    formData: (updated.formData as Record<string, unknown>) || {},
    documents: (updated.documents as Array<{ name: string; url: string; type?: string }>) || [],
    status: updated.status,
    score: updated.score,
    reviewerComment: updated.reviewerComment,
    reviewedById: updated.reviewedById,
    reviewedByName: updated.reviewedBy?.name || null,
    reviewedAt: updated.reviewedAt ? updated.reviewedAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function trackPublicApplication(
  tenantId: string,
  nationalId: string,
  applicationNo: string
): Promise<PublicApplicationStatusDto | null> {
  const item = await prisma.studentApplication.findFirst({
    where: {
      tenantId,
      nationalId: nationalId.trim(),
      applicationNo: applicationNo.trim().toUpperCase(),
    },
    include: {
      round: { select: { roundName: true } },
      program: { select: { nameTh: true } },
    },
  });

  if (!item) return null;

  return {
    applicationNo: item.applicationNo,
    maskedName: maskName(item.applicantNameTh),
    programNameTh: item.program.nameTh,
    roundName: item.round.roundName,
    status: item.status,
    score: item.status === "PASSED" || item.status === "INTERVIEW_ELIGIBLE" ? item.score : null,
    submittedAt: item.createdAt.toISOString(),
  };
}
