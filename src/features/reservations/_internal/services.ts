import { prisma } from "@/shared/lib/infra/prisma";
import type { ResourceType, ReservationStatus, Prisma } from "@/generated/prisma";
import { checkReservationCollision } from "./collision";
import type {
  CreateReservationInput,
  ApproveReservationInput,
  RejectReservationInput,
  CancelReservationInput,
  CreateResourceInput,
  UpdateResourceInput,
} from "./validations";

export interface ReservationResourceDto {
  id: string;
  tenantId: string;
  type: ResourceType;
  code: string;
  nameTh: string;
  nameEn: string;
  capacity: number;
  locationOrPlate: string;
  amenities: Record<string, unknown>;
  imageUrl: string | null;
  descriptionTh: string | null;
  descriptionEn: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationDto {
  id: string;
  tenantId: string;
  bookingNo: string;
  resourceId: string;
  resourceNameTh: string;
  resourceNameEn: string;
  resourceType: ResourceType;
  locationOrPlate: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  title: string;
  purpose: string;
  attendeesCount: number;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  destination: string | null;
  driverName: string | null;
  driverPhone: string | null;
  assignedVehiclePlate: string | null;
  approverId: string | null;
  approverName: string | null;
  approvalNote: string | null;
  approvedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicScheduleDto {
  id: string;
  resourceId: string;
  resourceNameTh: string;
  resourceNameEn: string;
  resourceType: ResourceType;
  locationOrPlate: string;
  title: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
}

// ─────────────────────────────────────────────────────────────
// Resource Management Services
// ─────────────────────────────────────────────────────────────

export async function listResources(
  tenantId: string,
  filter?: { type?: ResourceType; isActive?: boolean; search?: string }
): Promise<ReservationResourceDto[]> {
  const where: Record<string, unknown> = { tenantId };
  if (filter?.type) where.type = filter.type;
  if (filter?.isActive !== undefined) where.isActive = filter.isActive;
  if (filter?.search) {
    where.OR = [
      { nameTh: { contains: filter.search, mode: "insensitive" } },
      { nameEn: { contains: filter.search, mode: "insensitive" } },
      { code: { contains: filter.search, mode: "insensitive" } },
      { locationOrPlate: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const items = await prisma.reservationResource.findMany({
    where,
    orderBy: [{ type: "asc" }, { code: "asc" }],
  });

  return items.map((r) => ({
    id: r.id,
    tenantId: r.tenantId,
    type: r.type,
    code: r.code,
    nameTh: r.nameTh,
    nameEn: r.nameEn,
    capacity: r.capacity,
    locationOrPlate: r.locationOrPlate,
    amenities: (r.amenities as Record<string, unknown>) ?? {},
    imageUrl: r.imageUrl,
    descriptionTh: r.descriptionTh,
    descriptionEn: r.descriptionEn,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function getResourceById(
  tenantId: string,
  id: string
): Promise<ReservationResourceDto | null> {
  const r = await prisma.reservationResource.findFirst({
    where: { id, tenantId },
  });
  if (!r) return null;

  return {
    id: r.id,
    tenantId: r.tenantId,
    type: r.type,
    code: r.code,
    nameTh: r.nameTh,
    nameEn: r.nameEn,
    capacity: r.capacity,
    locationOrPlate: r.locationOrPlate,
    amenities: (r.amenities as Record<string, unknown>) ?? {},
    imageUrl: r.imageUrl,
    descriptionTh: r.descriptionTh,
    descriptionEn: r.descriptionEn,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function createResource(
  tenantId: string,
  input: CreateResourceInput
): Promise<ReservationResourceDto> {
  const created = await prisma.reservationResource.create({
    data: {
      tenantId,
      type: input.type,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      capacity: input.capacity,
      locationOrPlate: input.locationOrPlate,
      amenities: (input.amenities as unknown as Prisma.InputJsonValue) ?? {},
      imageUrl: input.imageUrl || null,
      descriptionTh: input.descriptionTh ?? null,
      descriptionEn: input.descriptionEn ?? null,
      isActive: input.isActive,
    },
  });

  return getResourceById(tenantId, created.id) as Promise<ReservationResourceDto>;
}

export async function updateResource(
  tenantId: string,
  input: UpdateResourceInput
): Promise<ReservationResourceDto> {
  const updated = await prisma.reservationResource.update({
    where: { id: input.id, tenantId },
    data: {
      type: input.type,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      capacity: input.capacity,
      locationOrPlate: input.locationOrPlate,
      amenities: (input.amenities as unknown as Prisma.InputJsonValue) ?? {},
      imageUrl: input.imageUrl || null,
      descriptionTh: input.descriptionTh ?? null,
      descriptionEn: input.descriptionEn ?? null,
      isActive: input.isActive,
    },
  });

  return getResourceById(tenantId, updated.id) as Promise<ReservationResourceDto>;
}

// ─────────────────────────────────────────────────────────────
// Reservations Core Services
// ─────────────────────────────────────────────────────────────

export async function listReservations(
  tenantId: string,
  filter?: {
    resourceId?: string;
    requesterId?: string;
    status?: ReservationStatus;
    from?: Date;
    to?: Date;
  }
): Promise<ReservationDto[]> {
  const where: Record<string, unknown> = { tenantId };
  if (filter?.resourceId) where.resourceId = filter.resourceId;
  if (filter?.requesterId) where.requesterId = filter.requesterId;
  if (filter?.status) where.status = filter.status;
  if (filter?.from || filter?.to) {
    where.startTime = {
      ...(filter.from ? { gte: filter.from } : {}),
      ...(filter.to ? { lte: filter.to } : {}),
    };
  }

  const items = await prisma.reservation.findMany({
    where,
    include: {
      resource: {
        select: { nameTh: true, nameEn: true, type: true, locationOrPlate: true },
      },
      requester: {
        select: { name: true, email: true },
      },
      approver: {
        select: { name: true },
      },
    },
    orderBy: { startTime: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
    bookingNo: item.bookingNo,
    resourceId: item.resourceId,
    resourceNameTh: item.resource.nameTh,
    resourceNameEn: item.resource.nameEn,
    resourceType: item.resource.type,
    locationOrPlate: item.resource.locationOrPlate,
    requesterId: item.requesterId,
    requesterName: item.requester.name,
    requesterEmail: item.requester.email,
    title: item.title,
    purpose: item.purpose,
    attendeesCount: item.attendeesCount,
    startTime: item.startTime.toISOString(),
    endTime: item.endTime.toISOString(),
    status: item.status,
    destination: item.destination,
    driverName: item.driverName,
    driverPhone: item.driverPhone,
    assignedVehiclePlate: item.assignedVehiclePlate,
    approverId: item.approverId,
    approverName: item.approver?.name ?? null,
    approvalNote: item.approvalNote,
    approvedAt: item.approvedAt ? item.approvedAt.toISOString() : null,
    cancelledAt: item.cancelledAt ? item.cancelledAt.toISOString() : null,
    cancellationReason: item.cancellationReason,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export async function getReservationById(
  tenantId: string,
  id: string
): Promise<ReservationDto | null> {
  const item = await prisma.reservation.findFirst({
    where: { id, tenantId },
    include: {
      resource: {
        select: { nameTh: true, nameEn: true, type: true, locationOrPlate: true },
      },
      requester: {
        select: { name: true, email: true },
      },
      approver: {
        select: { name: true },
      },
    },
  });
  if (!item) return null;

  return {
    id: item.id,
    tenantId: item.tenantId,
    bookingNo: item.bookingNo,
    resourceId: item.resourceId,
    resourceNameTh: item.resource.nameTh,
    resourceNameEn: item.resource.nameEn,
    resourceType: item.resource.type,
    locationOrPlate: item.resource.locationOrPlate,
    requesterId: item.requesterId,
    requesterName: item.requester.name,
    requesterEmail: item.requester.email,
    title: item.title,
    purpose: item.purpose,
    attendeesCount: item.attendeesCount,
    startTime: item.startTime.toISOString(),
    endTime: item.endTime.toISOString(),
    status: item.status,
    destination: item.destination,
    driverName: item.driverName,
    driverPhone: item.driverPhone,
    assignedVehiclePlate: item.assignedVehiclePlate,
    approverId: item.approverId,
    approverName: item.approver?.name ?? null,
    approvalNote: item.approvalNote,
    approvedAt: item.approvedAt ? item.approvedAt.toISOString() : null,
    cancelledAt: item.cancelledAt ? item.cancelledAt.toISOString() : null,
    cancellationReason: item.cancellationReason,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function createReservation(
  tenantId: string,
  requesterId: string,
  input: CreateReservationInput
): Promise<ReservationDto> {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  // 1. ตรวจสอบทรัพยากร
  const resource = await prisma.reservationResource.findFirst({
    where: { id: input.resourceId, tenantId, isActive: true },
  });
  if (!resource) {
    throw new Error("ไม่พบทรัพยากรที่ต้องการจอง หรือทรัพยากรปิดใช้งาน");
  }

  // 2. ตรวจสอบความจุ
  if (input.attendeesCount > resource.capacity) {
    throw new Error(`จำนวนผู้เข้าร่วม (${input.attendeesCount} คน) เกินความจุสูงสุดของห้อง/รถ (${resource.capacity} ที่นั่ง)`);
  }

  // 3. ตรวจสอบเวลาชนกัน (Collision Check) พร้อม Buffer 30 นาที
  const collision = await checkReservationCollision(prisma, {
    tenantId,
    resourceId: input.resourceId,
    startTime: start,
    endTime: end,
  });

  if (collision.hasCollision) {
    throw new Error("ช่วงเวลาดังกล่าวมีผู้จองแล้ว หรือติดระยะเวลาเตรียมความพร้อม 30 นาที กรุณาเลือกช่วงเวลาอื่น");
  }

  // 4. สร้างเลขที่การจอง (Booking Number)
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bookingNo = `BK-${yearMonth}-${randomSuffix}`;

  // 5. บันทึกคำขอจอง
  const created = await prisma.reservation.create({
    data: {
      tenantId,
      bookingNo,
      resourceId: input.resourceId,
      requesterId,
      title: input.title,
      purpose: input.purpose,
      attendeesCount: input.attendeesCount,
      startTime: start,
      endTime: end,
      destination: input.destination ?? null,
      status: "PENDING",
    },
  });

  // บันทึก Audit Log
  await prisma.auditLog.create({
    data: {
      tenantId,
      actorId: requesterId,
      action: "reservation.create",
      entity: "reservation",
      entityId: created.id,
      after: { bookingNo, title: input.title, startTime: input.startTime, endTime: input.endTime },
    },
  }).catch(() => null); // non-blocking audit write

  return (await getReservationById(tenantId, created.id))!;
}

export async function approveReservation(
  tenantId: string,
  approverId: string,
  input: ApproveReservationInput
): Promise<ReservationDto> {
  const existing = await prisma.reservation.findFirst({
    where: { id: input.id, tenantId },
    include: { resource: true },
  });

  if (!existing) {
    throw new Error("ไม่พบรายการจอง");
  }
  if (existing.status !== "PENDING") {
    throw new Error("คำขอนี้ไม่ได้อยู่ในสถานะรออนุมัติ");
  }

  // หากเป็นยานพาหนะ บังคับระบุชื่อคนขับ
  if (existing.resource.type === "VEHICLE" && !input.driverName) {
    throw new Error("กรุณาระบุชื่อพนักงานขับรถสำหรับการจองยานพาหนะ");
  }

  const updated = await prisma.reservation.update({
    where: { id: input.id, tenantId },
    data: {
      status: "APPROVED",
      approverId,
      approvalNote: input.approvalNote ?? null,
      driverName: input.driverName ?? null,
      driverPhone: input.driverPhone ?? null,
      assignedVehiclePlate: input.assignedVehiclePlate ?? null,
      approvedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      actorId: approverId,
      action: "reservation.approve",
      entity: "reservation",
      entityId: updated.id,
      before: { status: existing.status },
      after: { status: "APPROVED", driverName: input.driverName },
    },
  }).catch(() => null);

  return (await getReservationById(tenantId, updated.id))!;
}

export async function rejectReservation(
  tenantId: string,
  approverId: string,
  input: RejectReservationInput
): Promise<ReservationDto> {
  const existing = await prisma.reservation.findFirst({
    where: { id: input.id, tenantId },
  });

  if (!existing) {
    throw new Error("ไม่พบรายการจอง");
  }
  if (existing.status !== "PENDING") {
    throw new Error("คำขอนี้ไม่ได้อยู่ในสถานะรออนุมัติ");
  }

  const updated = await prisma.reservation.update({
    where: { id: input.id, tenantId },
    data: {
      status: "REJECTED",
      approverId,
      approvalNote: input.rejectionReason,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      actorId: approverId,
      action: "reservation.reject",
      entity: "reservation",
      entityId: updated.id,
      before: { status: existing.status },
      after: { status: "REJECTED", reason: input.rejectionReason },
    },
  }).catch(() => null);

  return (await getReservationById(tenantId, updated.id))!;
}

export async function cancelReservation(
  tenantId: string,
  userId: string,
  isManager: boolean,
  input: CancelReservationInput
): Promise<ReservationDto> {
  const existing = await prisma.reservation.findFirst({
    where: { id: input.id, tenantId },
  });

  if (!existing) {
    throw new Error("ไม่พบรายการจอง");
  }
  if (!isManager && existing.requesterId !== userId) {
    throw new Error("คุณไม่มีสิทธิ์ยกเลิกคำขอของผู้อื่น");
  }
  if (existing.status !== "PENDING" && existing.status !== "APPROVED") {
    throw new Error("ไม่สามารถยกเลิกคำขอที่เสร็จสิ้น ปฏิเสธ หรือยกเลิกไปแล้วได้");
  }

  // ตรวจสอบเงื่อนไขยกเลิกล่วงหน้า 2 ชั่วโมง (สำหรับผู้ใช้ทั่วไป)
  if (!isManager) {
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    const timeUntilStart = existing.startTime.getTime() - Date.now();
    if (timeUntilStart < twoHoursInMs) {
      throw new Error("ไม่สามารถยกเลิกได้ เนื่องจากต้องยกเลิกล่วงหน้าอย่างน้อย 2 ชั่วโมงก่อนเวลาเริ่ม");
    }
  }

  const updated = await prisma.reservation.update({
    where: { id: input.id, tenantId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancellationReason: input.cancellationReason ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      actorId: userId,
      action: "reservation.cancel",
      entity: "reservation",
      entityId: updated.id,
      before: { status: existing.status },
      after: { status: "CANCELLED", reason: input.cancellationReason },
    },
  }).catch(() => null);

  return (await getReservationById(tenantId, updated.id))!;
}

// ─────────────────────────────────────────────────────────────
// Public Portal Services (Privacy-Safe Schedule Board)
// ─────────────────────────────────────────────────────────────

export async function listPublicSchedules(
  tenantId: string,
  filter?: { from?: Date; to?: Date; resourceType?: ResourceType }
): Promise<PublicScheduleDto[]> {
  const where: Record<string, unknown> = {
    tenantId,
    status: { in: ["PENDING", "APPROVED"] },
  };

  if (filter?.resourceType) {
    where.resource = { type: filter.resourceType };
  }

  if (filter?.from || filter?.to) {
    where.startTime = {
      ...(filter.from ? { gte: filter.from } : {}),
      ...(filter.to ? { lte: filter.to } : {}),
    };
  }

  const items = await prisma.reservation.findMany({
    where,
    select: {
      id: true,
      resourceId: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      resource: {
        select: {
          nameTh: true,
          nameEn: true,
          type: true,
          locationOrPlate: true,
        },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    resourceId: item.resourceId,
    resourceNameTh: item.resource.nameTh,
    resourceNameEn: item.resource.nameEn,
    resourceType: item.resource.type,
    locationOrPlate: item.resource.locationOrPlate,
    title: item.title,
    startTime: item.startTime.toISOString(),
    endTime: item.endTime.toISOString(),
    status: item.status,
  }));
}
