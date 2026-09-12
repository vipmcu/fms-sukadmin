import { prisma } from "@/shared/lib/infra/prisma";
import type { DocumentStatus, Prisma } from "@/generated/prisma";
import {
  CreateDocumentTypeInput,
  UpdateDocumentTypeInput,
  CreateDocumentRequestInput,
  ApproveDocumentStepInput,
  RejectDocumentStepInput,
} from "./validations";
import { canReviewDocument, canCancelDocument, calculateApprovalTransition, buildApproverRoleChain } from "./workflow";

export interface DocumentTypeDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string | null;
  requiredFields: unknown[];
  isActive: boolean;
}

export interface DocumentApprovalStepDto {
  id: string;
  documentId: string;
  stepNumber: number;
  approverRole: string;
  approverId: string | null;
  approverName: string | null;
  status: DocumentStatus;
  comment: string | null;
  signatureUrl: string | null;
  actionAt: string | null;
  createdAt: string;
}

export interface DocumentRequestDto {
  id: string;
  tenantId: string;
  documentNo: string;
  typeId: string;
  typeNameTh: string;
  typeNameEn: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  attachments: unknown[];
  status: DocumentStatus;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  currentStep: number;
  totalSteps: number;
  currentApproverRole: string | null;
  finalApprovedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  approvalSteps?: DocumentApprovalStepDto[];
  createdAt: string;
  updatedAt: string;
}

export async function listDocumentTypes(tenantId: string): Promise<DocumentTypeDto[]> {
  if (!tenantId) return [];
  const items = await prisma.documentType.findMany({
    where: { tenantId },
    orderBy: { code: "asc" },
  });
  return items.map((t) => ({
    id: t.id,
    tenantId: t.tenantId,
    code: t.code,
    nameTh: t.nameTh,
    nameEn: t.nameEn,
    descriptionTh: t.descriptionTh,
    requiredFields: (t.requiredFields as unknown[]) ?? [],
    isActive: t.isActive,
  }));
}

export async function createDocumentType(
  tenantId: string,
  input: CreateDocumentTypeInput
): Promise<DocumentTypeDto> {
  const created = await prisma.documentType.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      descriptionTh: input.descriptionTh || null,
      requiredFields: (input.requiredFields as unknown as Prisma.InputJsonValue) ?? [],
      isActive: input.isActive,
    },
  });
  return {
    id: created.id,
    tenantId: created.tenantId,
    code: created.code,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    descriptionTh: created.descriptionTh,
    requiredFields: (created.requiredFields as unknown[]) ?? [],
    isActive: created.isActive,
  };
}

export async function updateDocumentType(
  tenantId: string,
  input: UpdateDocumentTypeInput
): Promise<DocumentTypeDto> {
  const updated = await prisma.documentType.update({
    where: { id: input.id, tenantId },
    data: {
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      descriptionTh: input.descriptionTh || null,
      requiredFields: (input.requiredFields as unknown as Prisma.InputJsonValue) ?? [],
      isActive: input.isActive,
    },
  });
  return {
    id: updated.id,
    tenantId: updated.tenantId,
    code: updated.code,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    descriptionTh: updated.descriptionTh,
    requiredFields: (updated.requiredFields as unknown[]) ?? [],
    isActive: updated.isActive,
  };
}

export async function listDocumentRequests(
  tenantId: string,
  filter?: {
    status?: DocumentStatus;
    requesterId?: string;
    approverRole?: string;
    search?: string;
  }
): Promise<DocumentRequestDto[]> {
  if (!tenantId) return [];
  const where: Prisma.DocumentRequestWhereInput = { tenantId };

  if (filter?.status) where.status = filter.status;
  if (filter?.requesterId) where.requesterId = filter.requesterId;
  if (filter?.approverRole) where.currentApproverRole = filter.approverRole;

  if (filter?.search) {
    const q = filter.search.trim();
    where.OR = [
      { documentNo: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.documentRequest.findMany({
    where,
    include: {
      type: true,
      requester: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map((d) => ({
    id: d.id,
    tenantId: d.tenantId,
    documentNo: d.documentNo,
    typeId: d.typeId,
    typeNameTh: d.type.nameTh,
    typeNameEn: d.type.nameEn,
    title: d.title,
    content: d.content,
    metadata: (d.metadata as Record<string, unknown>) ?? {},
    attachments: (d.attachments as unknown[]) ?? [],
    status: d.status,
    requesterId: d.requesterId,
    requesterName: d.requester.name,
    requesterEmail: d.requester.email,
    currentStep: d.currentStep,
    totalSteps: d.totalSteps,
    currentApproverRole: d.currentApproverRole,
    finalApprovedAt: d.finalApprovedAt?.toISOString() ?? null,
    rejectedAt: d.rejectedAt?.toISOString() ?? null,
    rejectionReason: d.rejectionReason,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
}

export async function getDocumentRequestById(
  tenantId: string,
  id: string
): Promise<DocumentRequestDto | null> {
  const d = await prisma.documentRequest.findFirst({
    where: { id, tenantId },
    include: {
      type: true,
      requester: { select: { id: true, name: true, email: true } },
      approvalSteps: {
        include: { approver: { select: { name: true } } },
        orderBy: { stepNumber: "asc" },
      },
    },
  });
  if (!d) return null;

  return {
    id: d.id,
    tenantId: d.tenantId,
    documentNo: d.documentNo,
    typeId: d.typeId,
    typeNameTh: d.type.nameTh,
    typeNameEn: d.type.nameEn,
    title: d.title,
    content: d.content,
    metadata: (d.metadata as Record<string, unknown>) ?? {},
    attachments: (d.attachments as unknown[]) ?? [],
    status: d.status,
    requesterId: d.requesterId,
    requesterName: d.requester.name,
    requesterEmail: d.requester.email,
    currentStep: d.currentStep,
    totalSteps: d.totalSteps,
    currentApproverRole: d.currentApproverRole,
    finalApprovedAt: d.finalApprovedAt?.toISOString() ?? null,
    rejectedAt: d.rejectedAt?.toISOString() ?? null,
    rejectionReason: d.rejectionReason,
    approvalSteps: d.approvalSteps.map((s) => ({
      id: s.id,
      documentId: s.documentId,
      stepNumber: s.stepNumber,
      approverRole: s.approverRole,
      approverId: s.approverId,
      approverName: s.approver?.name ?? null,
      status: s.status,
      comment: s.comment,
      signatureUrl: s.signatureUrl,
      actionAt: s.actionAt?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
    })),
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

async function generateDocumentNo(tenantId: string): Promise<string> {
  const d = new Date();
  const yearMonth = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `DOC-${yearMonth}-`;

  const count = await prisma.documentRequest.count({
    where: { tenantId, documentNo: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

export async function createDocumentRequest(
  tenantId: string,
  requesterId: string,
  input: CreateDocumentRequestInput
): Promise<DocumentRequestDto> {
  const documentNo = await generateDocumentNo(tenantId);
  const approverRoles = buildApproverRoleChain(
    input.totalSteps,
    input.currentApproverRole,
    input.approverRoles
  );
  const metadata = {
    ...(input.metadata ?? {}),
    approverRoles,
  };

  const created = await prisma.documentRequest.create({
    data: {
      tenantId,
      documentNo,
      typeId: input.typeId,
      title: input.title,
      content: input.content,
      metadata: metadata as Prisma.InputJsonValue,
      attachments: (input.attachments as unknown as Prisma.InputJsonValue) ?? [],
      status: "SUBMITTED",
      requesterId,
      currentStep: 1,
      totalSteps: input.totalSteps,
      currentApproverRole: approverRoles[0] ?? input.currentApproverRole,
    },
  });

  // บันทึก Audit Log
  await prisma.auditLog.create({
    data: {
      tenantId,
      actorId: requesterId,
      action: "document.create",
      entity: "document_request",
      entityId: created.id,
      after: { documentNo, title: input.title, status: "SUBMITTED" },
    },
  }).catch(() => null);

  return (await getDocumentRequestById(tenantId, created.id))!;
}

export async function approveDocumentStep(
  tenantId: string,
  approverId: string,
  approverRole: string,
  input: ApproveDocumentStepInput
): Promise<DocumentRequestDto> {
  const updatedId = await prisma.$transaction(async (tx) => {
    const existing = await tx.documentRequest.findFirst({
      where: { id: input.documentId, tenantId },
    });
    if (!existing) throw new Error("ไม่พบรายการเอกสาร");
    if (!canReviewDocument(existing.status)) {
      throw new Error("เอกสารนี้ไม่ได้อยู่ในสถานะรอพิจารณาลงนาม");
    }

    const meta = (existing.metadata ?? {}) as { approverRoles?: string[] };
    const roleChain =
      Array.isArray(meta.approverRoles) && meta.approverRoles.length > 0
        ? meta.approverRoles
        : buildApproverRoleChain(existing.totalSteps, existing.currentApproverRole ?? "DEPT_HEAD");
    const roleForStep = existing.currentApproverRole || approverRole;

    const { isFinalStep, nextStatus, nextStep, nextRole } = calculateApprovalTransition(
      existing.currentStep,
      existing.totalSteps,
      roleChain
    );

    // บันทึกขั้นตอนการอนุมัติ
    await tx.documentApprovalStep.upsert({
      where: {
        documentId_stepNumber: {
          documentId: existing.id,
          stepNumber: existing.currentStep,
        },
      },
      create: {
        documentId: existing.id,
        stepNumber: existing.currentStep,
        approverRole: roleForStep,
        approverId,
        status: "APPROVED",
        comment: input.comment || null,
        signatureUrl: input.signatureUrl || null,
        actionAt: new Date(),
      },
      update: {
        approverRole: roleForStep,
        approverId,
        status: "APPROVED",
        comment: input.comment || null,
        signatureUrl: input.signatureUrl || null,
        actionAt: new Date(),
      },
    });

    const updated = await tx.documentRequest.update({
      where: { id: existing.id, tenantId },
      data: {
        status: nextStatus,
        currentStep: nextStep,
        currentApproverRole: nextRole,
        finalApprovedAt: isFinalStep ? new Date() : null,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        actorId: approverId,
        action: "document.approve_step",
        entity: "document_request",
        entityId: updated.id,
        before: { status: existing.status, step: existing.currentStep },
        after: { status: nextStatus, step: nextStep },
      },
    }).catch(() => null);

    return updated.id;
  });

  return (await getDocumentRequestById(tenantId, updatedId))!;
}

export async function rejectDocumentStep(
  tenantId: string,
  approverId: string,
  approverRole: string,
  input: RejectDocumentStepInput
): Promise<DocumentRequestDto> {
  const updatedId = await prisma.$transaction(async (tx) => {
    const existing = await tx.documentRequest.findFirst({
      where: { id: input.documentId, tenantId },
    });
    if (!existing) throw new Error("ไม่พบรายการเอกสาร");
    if (!canReviewDocument(existing.status)) {
      throw new Error("เอกสารนี้ไม่ได้อยู่ในสถานะรอพิจารณาลงนาม");
    }

    const roleForStep = existing.currentApproverRole || approverRole;

    await tx.documentApprovalStep.upsert({
      where: {
        documentId_stepNumber: {
          documentId: existing.id,
          stepNumber: existing.currentStep,
        },
      },
      create: {
        documentId: existing.id,
        stepNumber: existing.currentStep,
        approverRole: roleForStep,
        approverId,
        status: "REJECTED",
        comment: input.rejectionReason,
        actionAt: new Date(),
      },
      update: {
        approverRole: roleForStep,
        approverId,
        status: "REJECTED",
        comment: input.rejectionReason,
        actionAt: new Date(),
      },
    });

    const updated = await tx.documentRequest.update({
      where: { id: existing.id, tenantId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectionReason: input.rejectionReason,
        currentApproverRole: null,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        actorId: approverId,
        action: "document.reject_step",
        entity: "document_request",
        entityId: updated.id,
        before: { status: existing.status },
        after: { status: "REJECTED", reason: input.rejectionReason },
      },
    }).catch(() => null);

    return updated.id;
  });

  return (await getDocumentRequestById(tenantId, updatedId))!;
}

export async function cancelDocumentRequest(
  tenantId: string,
  requesterId: string,
  id: string
): Promise<DocumentRequestDto> {
  const existing = await prisma.documentRequest.findFirst({
    where: { id, tenantId, requesterId },
  });
  if (!existing) throw new Error("ไม่พบรายการคำร้องหรือคุณไม่มีสิทธิ์ยกเลิก");
  if (!canCancelDocument(existing.status)) {
    throw new Error("ไม่สามารถยกเลิกคำร้องที่กำลังพิจารณาหรือเสร็จสิ้นแล้วได้");
  }

  const updated = await prisma.documentRequest.update({
    where: { id, tenantId },
    data: {
      status: "CANCELLED",
      currentApproverRole: null,
    },
  });

  return (await getDocumentRequestById(tenantId, updated.id))!;
}
