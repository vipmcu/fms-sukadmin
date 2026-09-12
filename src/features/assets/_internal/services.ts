import { prisma } from "@/shared/lib/infra/prisma";
import { Prisma, type AssetStatus, type RequisitionStatus } from "@/generated/prisma";
import {
  CreateAssetItemInput,
  UpdateAssetItemInput,
  TransferAssetInput,
  CreateSupplyItemInput,
  UpdateSupplyItemInput,
  AdjustStockInput,
  CreateSupplyRequisitionInput,
} from "./validations";
import { isLowStock, calculateNewStock } from "./stock";
import {
  canApproveRequisition,
  canCancelRequisition,
  canDispatchRequisition,
  canRejectRequisition,
} from "./requisition-workflow";

export interface AssetCategoryDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  depreciationRate: number;
  usefulLifeYears: number;
  itemCount?: number;
}

export interface AssetItemDto {
  id: string;
  tenantId: string;
  categoryId: string;
  categoryNameTh: string;
  categoryCode: string;
  assetCode: string;
  nameTh: string;
  nameEn: string | null;
  brandModel: string | null;
  serialNumber: string | null;
  acquiredDate: string | null;
  acquiredPrice: number | null;
  fundingSource: string | null;
  status: AssetStatus;
  location: string | null;
  departmentId: string | null;
  departmentNameTh?: string | null;
  responsibleId: string | null;
  responsibleNameTh?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplyItemDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitCost: number | null;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplyRequisitionItemDto {
  id: string;
  supplyItemId: string;
  supplyCode: string;
  supplyNameTh: string;
  unit: string;
  quantity: number;
}

export interface SupplyRequisitionDto {
  id: string;
  tenantId: string;
  requisitionNo: string;
  requesterId: string;
  requesterName: string;
  status: RequisitionStatus;
  purpose: string | null;
  rejectionReason: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  dispatchedById: string | null;
  dispatchedAt: string | null;
  items: SupplyRequisitionItemDto[];
  createdAt: string;
  updatedAt: string;
}

export async function listAssetCategories(tenantId: string): Promise<AssetCategoryDto[]> {
  if (!tenantId) return [];
  const items = await prisma.assetCategory.findMany({
    where: { tenantId },
    include: { _count: { select: { items: true } } },
    orderBy: { code: "asc" },
  });

  return items.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    code: c.code,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    depreciationRate: c.depreciationRate,
    usefulLifeYears: c.usefulLifeYears,
    itemCount: c._count.items,
  }));
}

export async function listAssetItems(
  tenantId: string,
  filter?: { status?: AssetStatus; categoryId?: string; search?: string }
): Promise<AssetItemDto[]> {
  if (!tenantId) return [];
  const where: Prisma.AssetItemWhereInput = { tenantId };

  if (filter?.status) {
    where.status = filter.status;
  }
  if (filter?.categoryId) {
    where.categoryId = filter.categoryId;
  }
  if (filter?.search) {
    where.OR = [
      { assetCode: { contains: filter.search, mode: "insensitive" } },
      { nameTh: { contains: filter.search, mode: "insensitive" } },
      { brandModel: { contains: filter.search, mode: "insensitive" } },
      { location: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const items = await prisma.assetItem.findMany({
    where,
    include: {
      category: { select: { nameTh: true, code: true } },
      department: { select: { nameTh: true } },
      responsible: { select: { prefixTh: true, firstNameTh: true, lastNameTh: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryCode: a.category.code,
    assetCode: a.assetCode,
    nameTh: a.nameTh,
    nameEn: a.nameEn,
    brandModel: a.brandModel,
    serialNumber: a.serialNumber,
    acquiredDate: a.acquiredDate ? a.acquiredDate.toISOString().split("T")[0] : null,
    acquiredPrice: a.acquiredPrice ? Number(a.acquiredPrice) : null,
    fundingSource: a.fundingSource,
    status: a.status,
    location: a.location,
    departmentId: a.departmentId,
    departmentNameTh: a.department?.nameTh || null,
    responsibleId: a.responsibleId,
    responsibleNameTh: a.responsible
      ? `${a.responsible.prefixTh} ${a.responsible.firstNameTh} ${a.responsible.lastNameTh}`
      : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}

export async function getAssetById(tenantId: string, id: string): Promise<AssetItemDto | null> {
  const a = await prisma.assetItem.findFirst({
    where: { id, tenantId },
    include: {
      category: { select: { nameTh: true, code: true } },
      department: { select: { nameTh: true } },
      responsible: { select: { prefixTh: true, firstNameTh: true, lastNameTh: true } },
    },
  });

  if (!a) return null;

  return {
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryCode: a.category.code,
    assetCode: a.assetCode,
    nameTh: a.nameTh,
    nameEn: a.nameEn,
    brandModel: a.brandModel,
    serialNumber: a.serialNumber,
    acquiredDate: a.acquiredDate ? a.acquiredDate.toISOString().split("T")[0] : null,
    acquiredPrice: a.acquiredPrice ? Number(a.acquiredPrice) : null,
    fundingSource: a.fundingSource,
    status: a.status,
    location: a.location,
    departmentId: a.departmentId,
    departmentNameTh: a.department?.nameTh || null,
    responsibleId: a.responsibleId,
    responsibleNameTh: a.responsible
      ? `${a.responsible.prefixTh} ${a.responsible.firstNameTh} ${a.responsible.lastNameTh}`
      : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export async function createAssetItem(
  tenantId: string,
  input: CreateAssetItemInput,
  actorId: string
): Promise<AssetItemDto> {
  const existing = await prisma.assetItem.findFirst({
    where: { tenantId, assetCode: input.assetCode },
  });
  if (existing) {
    throw new Error(`รหัสครุภัณฑ์ ${input.assetCode} มีอยู่ในระบบแล้ว`);
  }

  const item = await prisma.$transaction(async (tx) => {
    const created = await tx.assetItem.create({
      data: {
        tenantId,
        categoryId: input.categoryId,
        assetCode: input.assetCode,
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        brandModel: input.brandModel,
        serialNumber: input.serialNumber,
        acquiredDate: input.acquiredDate ? new Date(input.acquiredDate) : null,
        acquiredPrice: input.acquiredPrice ? new Prisma.Decimal(input.acquiredPrice) : null,
        fundingSource: input.fundingSource,
        status: input.status,
        location: input.location,
        departmentId: input.departmentId,
        responsibleId: input.responsibleId,
      },
      include: {
        category: { select: { nameTh: true, code: true } },
        department: { select: { nameTh: true } },
        responsible: { select: { prefixTh: true, firstNameTh: true, lastNameTh: true } },
      },
    });

    await tx.assetTransaction.create({
      data: {
        assetId: created.id,
        actionType: "CREATE",
        toValue: `สร้างทะเบียนครุภัณฑ์ ${created.assetCode}`,
        actorId,
      },
    });

    return created;
  });

  return {
    id: item.id,
    tenantId: item.tenantId,
    categoryId: item.categoryId,
    categoryNameTh: item.category.nameTh,
    categoryCode: item.category.code,
    assetCode: item.assetCode,
    nameTh: item.nameTh,
    nameEn: item.nameEn,
    brandModel: item.brandModel,
    serialNumber: item.serialNumber,
    acquiredDate: item.acquiredDate ? item.acquiredDate.toISOString().split("T")[0] : null,
    acquiredPrice: item.acquiredPrice ? Number(item.acquiredPrice) : null,
    fundingSource: item.fundingSource,
    status: item.status,
    location: item.location,
    departmentId: item.departmentId,
    departmentNameTh: item.department?.nameTh || null,
    responsibleId: item.responsibleId,
    responsibleNameTh: item.responsible
      ? `${item.responsible.prefixTh} ${item.responsible.firstNameTh} ${item.responsible.lastNameTh}`
      : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function updateAssetItem(
  tenantId: string,
  input: UpdateAssetItemInput,
  actorId: string
): Promise<AssetItemDto> {
  const existing = await prisma.assetItem.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw new Error("ไม่พบรายการครุภัณฑ์ที่ต้องการแก้ไข");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.assetItem.update({
      where: { id: input.id },
      data: {
        categoryId: input.categoryId,
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        brandModel: input.brandModel,
        serialNumber: input.serialNumber,
        acquiredDate: input.acquiredDate ? new Date(input.acquiredDate) : null,
        acquiredPrice: input.acquiredPrice ? new Prisma.Decimal(input.acquiredPrice) : null,
        fundingSource: input.fundingSource,
        status: input.status,
        location: input.location,
        departmentId: input.departmentId,
        responsibleId: input.responsibleId,
      },
      include: {
        category: { select: { nameTh: true, code: true } },
        department: { select: { nameTh: true } },
        responsible: { select: { prefixTh: true, firstNameTh: true, lastNameTh: true } },
      },
    });

    if (existing.status !== input.status) {
      await tx.assetTransaction.create({
        data: {
          assetId: input.id,
          actionType: "STATUS_CHANGE",
          fromValue: existing.status,
          toValue: input.status,
          actorId,
        },
      });
    }

    return res;
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    categoryId: updated.categoryId,
    categoryNameTh: updated.category.nameTh,
    categoryCode: updated.category.code,
    assetCode: updated.assetCode,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    brandModel: updated.brandModel,
    serialNumber: updated.serialNumber,
    acquiredDate: updated.acquiredDate ? updated.acquiredDate.toISOString().split("T")[0] : null,
    acquiredPrice: updated.acquiredPrice ? Number(updated.acquiredPrice) : null,
    fundingSource: updated.fundingSource,
    status: updated.status,
    location: updated.location,
    departmentId: updated.departmentId,
    departmentNameTh: updated.department?.nameTh || null,
    responsibleId: updated.responsibleId,
    responsibleNameTh: updated.responsible
      ? `${updated.responsible.prefixTh} ${updated.responsible.firstNameTh} ${updated.responsible.lastNameTh}`
      : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function transferAsset(
  tenantId: string,
  input: TransferAssetInput,
  actorId: string
): Promise<AssetItemDto> {
  const existing = await prisma.assetItem.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw new Error("ไม่พบรายการครุภัณฑ์ที่ต้องการโอนย้าย");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.assetItem.update({
      where: { id: input.id },
      data: {
        location: input.newLocation !== undefined ? input.newLocation : existing.location,
        departmentId: input.newDepartmentId !== undefined ? input.newDepartmentId : existing.departmentId,
        responsibleId: input.newResponsibleId !== undefined ? input.newResponsibleId : existing.responsibleId,
      },
      include: {
        category: { select: { nameTh: true, code: true } },
        department: { select: { nameTh: true } },
        responsible: { select: { prefixTh: true, firstNameTh: true, lastNameTh: true } },
      },
    });

    await tx.assetTransaction.create({
      data: {
        assetId: input.id,
        actionType: "TRANSFER",
        fromValue: `Location: ${existing.location || "-"}, Custodian: ${existing.responsibleId || "-"}`,
        toValue: `Location: ${input.newLocation || "-"}, Custodian: ${input.newResponsibleId || "-"}`,
        remarks: input.remarks,
        actorId,
      },
    });

    return res;
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    categoryId: updated.categoryId,
    categoryNameTh: updated.category.nameTh,
    categoryCode: updated.category.code,
    assetCode: updated.assetCode,
    nameTh: updated.nameTh,
    nameEn: updated.nameEn,
    brandModel: updated.brandModel,
    serialNumber: updated.serialNumber,
    acquiredDate: updated.acquiredDate ? updated.acquiredDate.toISOString().split("T")[0] : null,
    acquiredPrice: updated.acquiredPrice ? Number(updated.acquiredPrice) : null,
    fundingSource: updated.fundingSource,
    status: updated.status,
    location: updated.location,
    departmentId: updated.departmentId,
    departmentNameTh: updated.department?.nameTh || null,
    responsibleId: updated.responsibleId,
    responsibleNameTh: updated.responsible
      ? `${updated.responsible.prefixTh} ${updated.responsible.firstNameTh} ${updated.responsible.lastNameTh}`
      : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteAssetItem(tenantId: string, id: string, _actorId: string): Promise<boolean> {
  const existing = await prisma.assetItem.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw new Error("ไม่พบรายการครุภัณฑ์ที่ต้องการลบ");
  }

  await prisma.assetItem.delete({
    where: { id },
  });

  return true;
}

export async function listSupplyItems(tenantId: string): Promise<SupplyItemDto[]> {
  if (!tenantId) return [];
  const items = await prisma.supplyItem.findMany({
    where: { tenantId },
    orderBy: { code: "asc" },
  });

  return items.map((s) => ({
    id: s.id,
    tenantId: s.tenantId,
    code: s.code,
    nameTh: s.nameTh,
    unit: s.unit,
    currentStock: s.currentStock,
    minStock: s.minStock,
    unitCost: s.unitCost ? Number(s.unitCost) : null,
    isLowStock: s.currentStock <= s.minStock,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
}

export async function createSupplyItem(
  tenantId: string,
  input: CreateSupplyItemInput,
  _actorId: string
): Promise<SupplyItemDto> {
  const existing = await prisma.supplyItem.findFirst({
    where: { tenantId, code: input.code },
  });
  if (existing) {
    throw new Error(`รหัสวัสดุ ${input.code} มีอยู่ในระบบแล้ว`);
  }

  const s = await prisma.supplyItem.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      unit: input.unit,
      currentStock: input.currentStock,
      minStock: input.minStock,
      unitCost: input.unitCost ? new Prisma.Decimal(input.unitCost) : null,
    },
  });

  return {
    id: s.id,
    tenantId: s.tenantId,
    code: s.code,
    nameTh: s.nameTh,
    unit: s.unit,
    currentStock: s.currentStock,
    minStock: s.minStock,
    unitCost: s.unitCost ? Number(s.unitCost) : null,
    isLowStock: s.currentStock <= s.minStock,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export async function updateSupplyItem(
  tenantId: string,
  input: UpdateSupplyItemInput,
  _actorId: string
): Promise<SupplyItemDto> {
  const existing = await prisma.supplyItem.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw new Error("ไม่พบรายการวัสดุที่ต้องการแก้ไข");
  }

  const s = await prisma.supplyItem.update({
    where: { id: input.id },
    data: {
      nameTh: input.nameTh,
      unit: input.unit,
      minStock: input.minStock,
      unitCost: input.unitCost ? new Prisma.Decimal(input.unitCost) : null,
    },
  });

  return {
    id: s.id,
    tenantId: s.tenantId,
    code: s.code,
    nameTh: s.nameTh,
    unit: s.unit,
    currentStock: s.currentStock,
    minStock: s.minStock,
    unitCost: s.unitCost ? Number(s.unitCost) : null,
    isLowStock: s.currentStock <= s.minStock,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export async function adjustSupplyStock(
  tenantId: string,
  input: AdjustStockInput,
  _actorId: string
): Promise<SupplyItemDto> {
  const s = await prisma.$transaction(async (tx) => {
    const existing = await tx.supplyItem.findFirst({
      where: { id: input.id, tenantId },
    });
    if (!existing) {
      throw new Error("ไม่พบรายการวัสดุที่ต้องการปรับปรุงสต็อก");
    }

    const newStock = calculateNewStock(existing.currentStock, input.quantityChange);

    return tx.supplyItem.update({
      where: { id: input.id },
      data: { currentStock: newStock },
    });
  });

  return {
    id: s.id,
    tenantId: s.tenantId,
    code: s.code,
    nameTh: s.nameTh,
    unit: s.unit,
    currentStock: s.currentStock,
    minStock: s.minStock,
    unitCost: s.unitCost ? Number(s.unitCost) : null,
    isLowStock: isLowStock(s.currentStock, s.minStock),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

const requisitionInclude = {
  requester: { select: { id: true, name: true } },
  items: { include: { supplyItem: true } },
} as const;

function toRequisitionDto(
  r: {
    id: string;
    tenantId: string;
    requisitionNo: string;
    requesterId: string;
    status: RequisitionStatus;
    purpose: string | null;
    rejectionReason: string | null;
    approvedById: string | null;
    approvedAt: Date | null;
    dispatchedById: string | null;
    dispatchedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    requester: { id: string; name: string };
    items: Array<{
      id: string;
      supplyItemId: string;
      quantity: number;
      supplyItem: { code: string; nameTh: string; unit: string };
    }>;
  }
): SupplyRequisitionDto {
  return {
    id: r.id,
    tenantId: r.tenantId,
    requisitionNo: r.requisitionNo,
    requesterId: r.requesterId,
    requesterName: r.requester.name,
    status: r.status,
    purpose: r.purpose,
    rejectionReason: r.rejectionReason,
    approvedById: r.approvedById,
    approvedAt: r.approvedAt?.toISOString() ?? null,
    dispatchedById: r.dispatchedById,
    dispatchedAt: r.dispatchedAt?.toISOString() ?? null,
    items: r.items.map((i) => ({
      id: i.id,
      supplyItemId: i.supplyItemId,
      supplyCode: i.supplyItem.code,
      supplyNameTh: i.supplyItem.nameTh,
      unit: i.supplyItem.unit,
      quantity: i.quantity,
    })),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

async function generateRequisitionNo(tenantId: string): Promise<string> {
  const d = new Date();
  const yearMonth = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `REQ-${yearMonth}-`;
  const count = await prisma.supplyRequisition.count({
    where: { tenantId, requisitionNo: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

export async function listSupplyRequisitions(tenantId: string): Promise<SupplyRequisitionDto[]> {
  if (!tenantId) return [];
  const rows = await prisma.supplyRequisition.findMany({
    where: { tenantId },
    include: requisitionInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toRequisitionDto);
}

export async function createSupplyRequisition(
  tenantId: string,
  requesterId: string,
  input: CreateSupplyRequisitionInput
): Promise<SupplyRequisitionDto> {
  const supplyIds = [...new Set(input.items.map((i) => i.supplyItemId))];
  if (supplyIds.length !== input.items.length) {
    throw new Error("รายการวัสดุในคำขอต้องไม่ซ้ำกัน");
  }

  const supplies = await prisma.supplyItem.findMany({
    where: { tenantId, id: { in: supplyIds } },
  });
  if (supplies.length !== supplyIds.length) {
    throw new Error("พบรายการวัสดุที่ไม่ได้อยู่ในคลังของคณะนี้");
  }

  const requisitionNo = await generateRequisitionNo(tenantId);
  const created = await prisma.$transaction(async (tx) => {
    const req = await tx.supplyRequisition.create({
      data: {
        tenantId,
        requisitionNo,
        requesterId,
        status: "PENDING",
        purpose: input.purpose ?? null,
        items: {
          create: input.items.map((i) => ({
            supplyItemId: i.supplyItemId,
            quantity: i.quantity,
          })),
        },
      },
      include: requisitionInclude,
    });
    await tx.auditLog.create({
      data: {
        tenantId,
        actorId: requesterId,
        action: "supply_requisition.create",
        entity: "supply_requisition",
        entityId: req.id,
        after: { requisitionNo, itemCount: input.items.length },
      },
    });
    return req;
  });
  return toRequisitionDto(created);
}

export async function approveSupplyRequisition(
  tenantId: string,
  approverId: string,
  id: string
): Promise<SupplyRequisitionDto> {
  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.supplyRequisition.findFirst({
      where: { id, tenantId },
      include: requisitionInclude,
    });
    if (!existing) throw new Error("ไม่พบคำขอเบิกวัสดุ");
    if (!canApproveRequisition(existing.status)) {
      throw new Error("คำขอนี้ไม่อยู่ในสถานะที่อนุมัติได้");
    }
    const req = await tx.supplyRequisition.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedById: approverId,
        approvedAt: new Date(),
      },
      include: requisitionInclude,
    });
    await tx.auditLog.create({
      data: {
        tenantId,
        actorId: approverId,
        action: "supply_requisition.approve",
        entity: "supply_requisition",
        entityId: id,
        before: { status: existing.status },
        after: { status: "APPROVED" },
      },
    });
    return req;
  });
  return toRequisitionDto(updated);
}

export async function rejectSupplyRequisition(
  tenantId: string,
  approverId: string,
  id: string,
  rejectionReason: string
): Promise<SupplyRequisitionDto> {
  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.supplyRequisition.findFirst({
      where: { id, tenantId },
      include: requisitionInclude,
    });
    if (!existing) throw new Error("ไม่พบคำขอเบิกวัสดุ");
    if (!canRejectRequisition(existing.status)) {
      throw new Error("คำขอนี้ไม่อยู่ในสถานะที่ปฏิเสธได้");
    }
    const req = await tx.supplyRequisition.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason,
        approvedById: approverId,
        approvedAt: new Date(),
      },
      include: requisitionInclude,
    });
    await tx.auditLog.create({
      data: {
        tenantId,
        actorId: approverId,
        action: "supply_requisition.reject",
        entity: "supply_requisition",
        entityId: id,
        before: { status: existing.status },
        after: { status: "REJECTED", rejectionReason },
      },
    });
    return req;
  });
  return toRequisitionDto(updated);
}

export async function cancelSupplyRequisition(
  tenantId: string,
  requesterId: string,
  id: string
): Promise<SupplyRequisitionDto> {
  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.supplyRequisition.findFirst({
      where: { id, tenantId },
      include: requisitionInclude,
    });
    if (!existing) throw new Error("ไม่พบคำขอเบิกวัสดุ");
    if (existing.requesterId !== requesterId) {
      throw new Error("ยกเลิกได้เฉพาะผู้ยื่นคำขอเท่านั้น");
    }
    if (!canCancelRequisition(existing.status)) {
      throw new Error("คำขอนี้ไม่อยู่ในสถานะที่ยกเลิกได้");
    }
    const req = await tx.supplyRequisition.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: requisitionInclude,
    });
    await tx.auditLog.create({
      data: {
        tenantId,
        actorId: requesterId,
        action: "supply_requisition.cancel",
        entity: "supply_requisition",
        entityId: id,
        before: { status: existing.status },
        after: { status: "CANCELLED" },
      },
    });
    return req;
  });
  return toRequisitionDto(updated);
}

export async function dispatchSupplyRequisition(
  tenantId: string,
  dispatcherId: string,
  id: string
): Promise<SupplyRequisitionDto> {
  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.supplyRequisition.findFirst({
      where: { id, tenantId },
      include: requisitionInclude,
    });
    if (!existing) throw new Error("ไม่พบคำขอเบิกวัสดุ");
    if (!canDispatchRequisition(existing.status)) {
      throw new Error("จ่ายวัสดุได้เฉพาะคำขอที่อนุมัติแล้ว");
    }

    for (const item of existing.items) {
      const supply = await tx.supplyItem.findFirst({
        where: { id: item.supplyItemId, tenantId },
      });
      if (!supply) throw new Error(`ไม่พบวัสดุ ${item.supplyItem.code}`);
      const newStock = calculateNewStock(supply.currentStock, -item.quantity);
      await tx.supplyItem.update({
        where: { id: supply.id },
        data: { currentStock: newStock },
      });
    }

    const req = await tx.supplyRequisition.update({
      where: { id },
      data: {
        status: "DISPATCHED",
        dispatchedById: dispatcherId,
        dispatchedAt: new Date(),
      },
      include: requisitionInclude,
    });
    await tx.auditLog.create({
      data: {
        tenantId,
        actorId: dispatcherId,
        action: "supply_requisition.dispatch",
        entity: "supply_requisition",
        entityId: id,
        before: { status: existing.status },
        after: { status: "DISPATCHED" },
      },
    });
    return req;
  });
  return toRequisitionDto(updated);
}
