import { prisma } from "@/shared/lib/infra/prisma";
import { Prisma, type AssetStatus } from "@/generated/prisma";
import {
  CreateAssetItemInput,
  UpdateAssetItemInput,
  TransferAssetInput,
  CreateSupplyItemInput,
  UpdateSupplyItemInput,
  AdjustStockInput,
} from "./validations";
import { isLowStock, calculateNewStock } from "./stock";

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

export async function listAssetCategories(tenantId: string): Promise<AssetCategoryDto[]> {
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
