import { prisma } from "@/shared/lib/infra/prisma";
import { Prisma, type TicketPriority, type TicketStatus } from "@/generated/prisma";
import { calculateSlaDeadline, isSlaBreached } from "./sla";
import type {
  CreateServiceTicketInput,
  AssignTicketInput,
  UpdateTicketProgressInput,
  ResolveTicketInput,
  RateTicketInput,
} from "./validations";

export interface ServiceCategoryDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  defaultSlaHours: number;
  icon: string | null;
  ticketCount?: number;
}

export interface TicketCommentDto {
  id: string;
  authorId: string | null;
  authorName: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketRatingDto {
  id: string;
  score: number;
  feedback: string | null;
  createdAt: string;
}

export interface ServiceTicketDto {
  id: string;
  tenantId: string;
  ticketNo: string;
  categoryId: string;
  categoryNameTh: string;
  categoryCode: string;
  title: string;
  description: string;
  location: string;
  resourceId: string | null;
  resourceNameTh?: string | null;
  assetId: string | null;
  assetCode?: string | null;
  assetNameTh?: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  photos: string[];
  completionPhotos: string[];
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  assignedTechnicianId: string | null;
  assignedTechnicianName?: string | null;
  slaDeadline: string | null;
  isBreached: boolean;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  partsCost: number | null;
  comments: TicketCommentDto[];
  rating?: TicketRatingDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceStatsDto {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  slaCompliancePercent: number;
}

export async function listServiceCategories(tenantId: string): Promise<ServiceCategoryDto[]> {
  const items = await prisma.serviceCategory.findMany({
    where: { tenantId },
    include: { _count: { select: { tickets: true } } },
    orderBy: { code: "asc" },
  });

  return items.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    code: c.code,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    defaultSlaHours: c.defaultSlaHours,
    icon: c.icon,
    ticketCount: c._count.tickets,
  }));
}

export async function listServiceTickets(
  tenantId: string,
  filter?: { status?: TicketStatus; priority?: TicketPriority; technicianId?: string; search?: string }
): Promise<ServiceTicketDto[]> {
  const where: Prisma.ServiceTicketWhereInput = { tenantId };

  if (filter?.status) where.status = filter.status;
  if (filter?.priority) where.priority = filter.priority;
  if (filter?.technicianId) where.assignedTechnicianId = filter.technicianId;
  if (filter?.search) {
    where.OR = [
      { ticketNo: { contains: filter.search, mode: "insensitive" } },
      { title: { contains: filter.search, mode: "insensitive" } },
      { location: { contains: filter.search, mode: "insensitive" } },
      { requesterName: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const items = await prisma.serviceTicket.findMany({
    where,
    include: {
      category: { select: { nameTh: true, code: true } },
      resource: { select: { nameTh: true } },
      asset: { select: { assetCode: true, nameTh: true } },
      technician: { select: { name: true } },
      comments: { orderBy: { createdAt: "asc" } },
      rating: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map((t) => ({
    id: t.id,
    tenantId: t.tenantId,
    ticketNo: t.ticketNo,
    categoryId: t.categoryId,
    categoryNameTh: t.category.nameTh,
    categoryCode: t.category.code,
    title: t.title,
    description: t.description,
    location: t.location,
    resourceId: t.resourceId,
    resourceNameTh: t.resource?.nameTh || null,
    assetId: t.assetId,
    assetCode: t.asset?.assetCode || null,
    assetNameTh: t.asset?.nameTh || null,
    priority: t.priority,
    status: t.status,
    photos: (t.photos as string[]) || [],
    completionPhotos: (t.completionPhotos as string[]) || [],
    requesterName: t.requesterName,
    requesterEmail: t.requesterEmail,
    requesterPhone: t.requesterPhone,
    assignedTechnicianId: t.assignedTechnicianId,
    assignedTechnicianName: t.technician?.name || null,
    slaDeadline: t.slaDeadline ? t.slaDeadline.toISOString() : null,
    isBreached: isSlaBreached(t.slaDeadline, t.resolvedAt),
    resolvedAt: t.resolvedAt ? t.resolvedAt.toISOString() : null,
    resolutionNotes: t.resolutionNotes,
    partsCost: t.partsCost ? Number(t.partsCost) : null,
    comments: t.comments.map((c) => ({
      id: c.id,
      authorId: c.authorId,
      authorName: c.authorName,
      message: c.message,
      isInternal: c.isInternal,
      createdAt: c.createdAt.toISOString(),
    })),
    rating: t.rating
      ? {
          id: t.rating.id,
          score: t.rating.score,
          feedback: t.rating.feedback,
          createdAt: t.rating.createdAt.toISOString(),
        }
      : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));
}

export async function getServiceTicketById(tenantId: string, id: string): Promise<ServiceTicketDto | null> {
  const t = await prisma.serviceTicket.findFirst({
    where: { id, tenantId },
    include: {
      category: { select: { nameTh: true, code: true } },
      resource: { select: { nameTh: true } },
      asset: { select: { assetCode: true, nameTh: true } },
      technician: { select: { name: true } },
      comments: { orderBy: { createdAt: "asc" } },
      rating: true,
    },
  });

  if (!t) return null;

  return {
    id: t.id,
    tenantId: t.tenantId,
    ticketNo: t.ticketNo,
    categoryId: t.categoryId,
    categoryNameTh: t.category.nameTh,
    categoryCode: t.category.code,
    title: t.title,
    description: t.description,
    location: t.location,
    resourceId: t.resourceId,
    resourceNameTh: t.resource?.nameTh || null,
    assetId: t.assetId,
    assetCode: t.asset?.assetCode || null,
    assetNameTh: t.asset?.nameTh || null,
    priority: t.priority,
    status: t.status,
    photos: (t.photos as string[]) || [],
    completionPhotos: (t.completionPhotos as string[]) || [],
    requesterName: t.requesterName,
    requesterEmail: t.requesterEmail,
    requesterPhone: t.requesterPhone,
    assignedTechnicianId: t.assignedTechnicianId,
    assignedTechnicianName: t.technician?.name || null,
    slaDeadline: t.slaDeadline ? t.slaDeadline.toISOString() : null,
    isBreached: isSlaBreached(t.slaDeadline, t.resolvedAt),
    resolvedAt: t.resolvedAt ? t.resolvedAt.toISOString() : null,
    resolutionNotes: t.resolutionNotes,
    partsCost: t.partsCost ? Number(t.partsCost) : null,
    comments: t.comments.map((c) => ({
      id: c.id,
      authorId: c.authorId,
      authorName: c.authorName,
      message: c.message,
      isInternal: c.isInternal,
      createdAt: c.createdAt.toISOString(),
    })),
    rating: t.rating
      ? {
          id: t.rating.id,
          score: t.rating.score,
          feedback: t.rating.feedback,
          createdAt: t.rating.createdAt.toISOString(),
        }
      : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export async function trackPublicTicket(
  tenantId: string,
  ticketNo: string,
  phone: string
): Promise<ServiceTicketDto | null> {
  const t = await prisma.serviceTicket.findFirst({
    where: {
      tenantId,
      ticketNo: { equals: ticketNo, mode: "insensitive" },
      requesterPhone: { endsWith: phone.replace(/\D/g, "") },
    },
    include: {
      category: { select: { nameTh: true, code: true } },
      resource: { select: { nameTh: true } },
      asset: { select: { assetCode: true, nameTh: true } },
      technician: { select: { name: true } },
      comments: { where: { isInternal: false }, orderBy: { createdAt: "asc" } },
      rating: true,
    },
  });

  if (!t) return null;

  return {
    id: t.id,
    tenantId: t.tenantId,
    ticketNo: t.ticketNo,
    categoryId: t.categoryId,
    categoryNameTh: t.category.nameTh,
    categoryCode: t.category.code,
    title: t.title,
    description: t.description,
    location: t.location,
    resourceId: t.resourceId,
    resourceNameTh: t.resource?.nameTh || null,
    assetId: t.assetId,
    assetCode: t.asset?.assetCode || null,
    assetNameTh: t.asset?.nameTh || null,
    priority: t.priority,
    status: t.status,
    photos: (t.photos as string[]) || [],
    completionPhotos: (t.completionPhotos as string[]) || [],
    requesterName: t.requesterName,
    requesterEmail: t.requesterEmail,
    requesterPhone: t.requesterPhone,
    assignedTechnicianId: t.assignedTechnicianId,
    assignedTechnicianName: t.technician?.name || null,
    slaDeadline: t.slaDeadline ? t.slaDeadline.toISOString() : null,
    isBreached: isSlaBreached(t.slaDeadline, t.resolvedAt),
    resolvedAt: t.resolvedAt ? t.resolvedAt.toISOString() : null,
    resolutionNotes: t.resolutionNotes,
    partsCost: t.partsCost ? Number(t.partsCost) : null,
    comments: t.comments.map((c) => ({
      id: c.id,
      authorId: c.authorId,
      authorName: c.authorName,
      message: c.message,
      isInternal: c.isInternal,
      createdAt: c.createdAt.toISOString(),
    })),
    rating: t.rating
      ? {
          id: t.rating.id,
          score: t.rating.score,
          feedback: t.rating.feedback,
          createdAt: t.rating.createdAt.toISOString(),
        }
      : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export async function createServiceTicket(
  tenantId: string,
  input: CreateServiceTicketInput
): Promise<ServiceTicketDto> {
  // Generate Ticket No: SR-YYYYMM-XXXX
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}`;
  const count = await prisma.serviceTicket.count({ where: { tenantId } });
  const seq = (count + 1).toString().padStart(4, "0");
  const ticketNo = `SR-${yearMonth}-${seq}`;

  const slaDeadline = calculateSlaDeadline(input.priority, now);

  const created = await prisma.$transaction(async (tx) => {
    const item = await tx.serviceTicket.create({
      data: {
        tenantId,
        ticketNo,
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        location: input.location,
        resourceId: input.resourceId,
        assetId: input.assetId,
        priority: input.priority,
        status: "OPEN",
        photos: input.photos || [],
        requesterName: input.requesterName,
        requesterEmail: input.requesterEmail,
        requesterPhone: input.requesterPhone,
        slaDeadline,
      },
      include: {
        category: { select: { nameTh: true, code: true } },
        resource: { select: { nameTh: true } },
        asset: { select: { assetCode: true, nameTh: true } },
        technician: { select: { name: true } },
      },
    });

    // If linked to an asset, update asset to UNDER_REPAIR
    if (input.assetId) {
      await tx.assetItem.update({
        where: { id: input.assetId },
        data: { status: "UNDER_REPAIR" },
      });
    }

    return item;
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    ticketNo: created.ticketNo,
    categoryId: created.categoryId,
    categoryNameTh: created.category.nameTh,
    categoryCode: created.category.code,
    title: created.title,
    description: created.description,
    location: created.location,
    resourceId: created.resourceId,
    resourceNameTh: created.resource?.nameTh || null,
    assetId: created.assetId,
    assetCode: created.asset?.assetCode || null,
    assetNameTh: created.asset?.nameTh || null,
    priority: created.priority,
    status: created.status,
    photos: (created.photos as string[]) || [],
    completionPhotos: [],
    requesterName: created.requesterName,
    requesterEmail: created.requesterEmail,
    requesterPhone: created.requesterPhone,
    assignedTechnicianId: null,
    assignedTechnicianName: null,
    slaDeadline: created.slaDeadline ? created.slaDeadline.toISOString() : null,
    isBreached: false,
    resolvedAt: null,
    resolutionNotes: null,
    partsCost: null,
    comments: [],
    rating: null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function assignServiceTicket(
  tenantId: string,
  input: AssignTicketInput,
  actorId: string
): Promise<ServiceTicketDto> {
  const existing = await prisma.serviceTicket.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw new Error("ไม่พบรายการแจ้งซ่อมที่ต้องการมอบหมาย");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.serviceTicket.update({
      where: { id: input.id },
      data: {
        assignedTechnicianId: input.assignedTechnicianId,
        status: existing.status === "OPEN" ? "ASSIGNED" : existing.status,
        priority: input.priority || existing.priority,
        slaDeadline: input.priority ? calculateSlaDeadline(input.priority, existing.createdAt) : existing.slaDeadline,
      },
      include: {
        category: { select: { nameTh: true, code: true } },
        resource: { select: { nameTh: true } },
        asset: { select: { assetCode: true, nameTh: true } },
        technician: { select: { name: true } },
        comments: { orderBy: { createdAt: "asc" } },
        rating: true,
      },
    });

    const actor = await tx.user.findUnique({ where: { id: actorId }, select: { name: true } });
    await tx.ticketComment.create({
      data: {
        ticketId: input.id,
        authorId: actorId,
        authorName: actor?.name || "System",
        message: `มอบหมายงานให้นายช่างเรียบร้อยแล้ว`,
        isInternal: true,
      },
    });

    return res;
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    ticketNo: updated.ticketNo,
    categoryId: updated.categoryId,
    categoryNameTh: updated.category.nameTh,
    categoryCode: updated.category.code,
    title: updated.title,
    description: updated.description,
    location: updated.location,
    resourceId: updated.resourceId,
    resourceNameTh: updated.resource?.nameTh || null,
    assetId: updated.assetId,
    assetCode: updated.asset?.assetCode || null,
    assetNameTh: updated.asset?.nameTh || null,
    priority: updated.priority,
    status: updated.status,
    photos: (updated.photos as string[]) || [],
    completionPhotos: (updated.completionPhotos as string[]) || [],
    requesterName: updated.requesterName,
    requesterEmail: updated.requesterEmail,
    requesterPhone: updated.requesterPhone,
    assignedTechnicianId: updated.assignedTechnicianId,
    assignedTechnicianName: updated.technician?.name || null,
    slaDeadline: updated.slaDeadline ? updated.slaDeadline.toISOString() : null,
    isBreached: isSlaBreached(updated.slaDeadline, updated.resolvedAt),
    resolvedAt: updated.resolvedAt ? updated.resolvedAt.toISOString() : null,
    resolutionNotes: updated.resolutionNotes,
    partsCost: updated.partsCost ? Number(updated.partsCost) : null,
    comments: updated.comments.map((c) => ({
      id: c.id,
      authorId: c.authorId,
      authorName: c.authorName,
      message: c.message,
      isInternal: c.isInternal,
      createdAt: c.createdAt.toISOString(),
    })),
    rating: updated.rating
      ? {
          id: updated.rating.id,
          score: updated.rating.score,
          feedback: updated.rating.feedback,
          createdAt: updated.rating.createdAt.toISOString(),
        }
      : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function updateTicketProgress(
  tenantId: string,
  input: UpdateTicketProgressInput,
  actorId: string
): Promise<ServiceTicketDto> {
  const existing = await prisma.serviceTicket.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw new Error("ไม่พบรายการแจ้งซ่อมที่ต้องการปรับปรุงสถานะ");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.serviceTicket.update({
      where: { id: input.id },
      data: { status: input.status },
      include: {
        category: { select: { nameTh: true, code: true } },
        resource: { select: { nameTh: true } },
        asset: { select: { assetCode: true, nameTh: true } },
        technician: { select: { name: true } },
        comments: { orderBy: { createdAt: "asc" } },
        rating: true,
      },
    });

    if (input.comment) {
      const actor = await tx.user.findUnique({ where: { id: actorId }, select: { name: true } });
      await tx.ticketComment.create({
        data: {
          ticketId: input.id,
          authorId: actorId,
          authorName: actor?.name || "Technician",
          message: input.comment,
          isInternal: false,
        },
      });
    }

    return res;
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    ticketNo: updated.ticketNo,
    categoryId: updated.categoryId,
    categoryNameTh: updated.category.nameTh,
    categoryCode: updated.category.code,
    title: updated.title,
    description: updated.description,
    location: updated.location,
    resourceId: updated.resourceId,
    resourceNameTh: updated.resource?.nameTh || null,
    assetId: updated.assetId,
    assetCode: updated.asset?.assetCode || null,
    assetNameTh: updated.asset?.nameTh || null,
    priority: updated.priority,
    status: updated.status,
    photos: (updated.photos as string[]) || [],
    completionPhotos: (updated.completionPhotos as string[]) || [],
    requesterName: updated.requesterName,
    requesterEmail: updated.requesterEmail,
    requesterPhone: updated.requesterPhone,
    assignedTechnicianId: updated.assignedTechnicianId,
    assignedTechnicianName: updated.technician?.name || null,
    slaDeadline: updated.slaDeadline ? updated.slaDeadline.toISOString() : null,
    isBreached: isSlaBreached(updated.slaDeadline, updated.resolvedAt),
    resolvedAt: updated.resolvedAt ? updated.resolvedAt.toISOString() : null,
    resolutionNotes: updated.resolutionNotes,
    partsCost: updated.partsCost ? Number(updated.partsCost) : null,
    comments: updated.comments.map((c) => ({
      id: c.id,
      authorId: c.authorId,
      authorName: c.authorName,
      message: c.message,
      isInternal: c.isInternal,
      createdAt: c.createdAt.toISOString(),
    })),
    rating: updated.rating
      ? {
          id: updated.rating.id,
          score: updated.rating.score,
          feedback: updated.rating.feedback,
          createdAt: updated.rating.createdAt.toISOString(),
        }
      : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function resolveServiceTicket(
  tenantId: string,
  input: ResolveTicketInput,
  _actorId: string
): Promise<ServiceTicketDto> {
  const existing = await prisma.serviceTicket.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw new Error("ไม่พบรายการแจ้งซ่อมที่ต้องการปิดงาน");
  }

  const resolved = await prisma.$transaction(async (tx) => {
    const res = await tx.serviceTicket.update({
      where: { id: input.id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        resolutionNotes: input.resolutionNotes,
        partsCost: input.partsCost ? new Prisma.Decimal(input.partsCost) : null,
        completionPhotos: input.completionPhotos || [],
      },
      include: {
        category: { select: { nameTh: true, code: true } },
        resource: { select: { nameTh: true } },
        asset: { select: { assetCode: true, nameTh: true } },
        technician: { select: { name: true } },
        comments: { orderBy: { createdAt: "asc" } },
        rating: true,
      },
    });

    // If linked to an asset, return asset to ACTIVE
    if (existing.assetId) {
      await tx.assetItem.update({
        where: { id: existing.assetId },
        data: { status: "ACTIVE" },
      });
    }

    return res;
  });

  return {
    id: resolved.id,
    tenantId: resolved.tenantId,
    ticketNo: resolved.ticketNo,
    categoryId: resolved.categoryId,
    categoryNameTh: resolved.category.nameTh,
    categoryCode: resolved.category.code,
    title: resolved.title,
    description: resolved.description,
    location: resolved.location,
    resourceId: resolved.resourceId,
    resourceNameTh: resolved.resource?.nameTh || null,
    assetId: resolved.assetId,
    assetCode: resolved.asset?.assetCode || null,
    assetNameTh: resolved.asset?.nameTh || null,
    priority: resolved.priority,
    status: resolved.status,
    photos: (resolved.photos as string[]) || [],
    completionPhotos: (resolved.completionPhotos as string[]) || [],
    requesterName: resolved.requesterName,
    requesterEmail: resolved.requesterEmail,
    requesterPhone: resolved.requesterPhone,
    assignedTechnicianId: resolved.assignedTechnicianId,
    assignedTechnicianName: resolved.technician?.name || null,
    slaDeadline: resolved.slaDeadline ? resolved.slaDeadline.toISOString() : null,
    isBreached: isSlaBreached(resolved.slaDeadline, resolved.resolvedAt),
    resolvedAt: resolved.resolvedAt ? resolved.resolvedAt.toISOString() : null,
    resolutionNotes: resolved.resolutionNotes,
    partsCost: resolved.partsCost ? Number(resolved.partsCost) : null,
    comments: resolved.comments.map((c) => ({
      id: c.id,
      authorId: c.authorId,
      authorName: c.authorName,
      message: c.message,
      isInternal: c.isInternal,
      createdAt: c.createdAt.toISOString(),
    })),
    rating: resolved.rating
      ? {
          id: resolved.rating.id,
          score: resolved.rating.score,
          feedback: resolved.rating.feedback,
          createdAt: resolved.rating.createdAt.toISOString(),
        }
      : null,
    createdAt: resolved.createdAt.toISOString(),
    updatedAt: resolved.updatedAt.toISOString(),
  };
}

export async function rateServiceTicket(
  tenantId: string,
  input: RateTicketInput
): Promise<TicketRatingDto> {
  const ticket = await prisma.serviceTicket.findFirst({
    where: { id: input.ticketId, tenantId },
    include: { rating: true },
  });
  if (!ticket) {
    throw new Error("ไม่พบรายการแจ้งซ่อมที่ต้องการประเมิน");
  }
  if (ticket.status !== "RESOLVED") {
    throw new Error("สามารถประเมินความพึงพอใจได้เฉพาะรายการที่ปิดงานซ่อมแล้วเท่านั้น");
  }
  if (ticket.rating) {
    throw new Error("ท่านได้ประเมินความพึงพอใจรายการนี้ไปแล้ว");
  }

  const r = await prisma.ticketRating.create({
    data: {
      ticketId: input.ticketId,
      score: input.score,
      feedback: input.feedback,
    },
  });

  return {
    id: r.id,
    score: r.score,
    feedback: r.feedback,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function getMaintenanceStats(tenantId: string): Promise<MaintenanceStatsDto> {
  const [total, open, assigned, inProgress, resolved, allResolvedWithSla] = await Promise.all([
    prisma.serviceTicket.count({ where: { tenantId } }),
    prisma.serviceTicket.count({ where: { tenantId, status: "OPEN" } }),
    prisma.serviceTicket.count({ where: { tenantId, status: "ASSIGNED" } }),
    prisma.serviceTicket.count({ where: { tenantId, status: "IN_PROGRESS" } }),
    prisma.serviceTicket.count({ where: { tenantId, status: "RESOLVED" } }),
    prisma.serviceTicket.findMany({
      where: { tenantId, status: "RESOLVED", resolvedAt: { not: null }, slaDeadline: { not: null } },
      select: { slaDeadline: true, resolvedAt: true },
    }),
  ]);

  let onTimeCount = 0;
  for (const t of allResolvedWithSla) {
    if (t.slaDeadline && t.resolvedAt && t.resolvedAt <= t.slaDeadline) {
      onTimeCount++;
    }
  }

  const slaCompliancePercent =
    allResolvedWithSla.length > 0
      ? Math.round((onTimeCount / allResolvedWithSla.length) * 100)
      : 100;

  return {
    total,
    open,
    assigned,
    inProgress,
    resolved,
    slaCompliancePercent,
  };
}
