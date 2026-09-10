import { z } from "zod";

export const assetStatusEnum = z.enum(["ACTIVE", "IN_USE", "UNDER_REPAIR", "DAMAGED", "DISPOSED"]);

export const createAssetItemSchema = z.object({
  categoryId: z.string().uuid(),
  assetCode: z.string().min(2).max(100),
  nameTh: z.string().min(1).max(255),
  nameEn: z.string().max(255).optional().nullable(),
  brandModel: z.string().max(255).optional().nullable(),
  serialNumber: z.string().max(100).optional().nullable(),
  acquiredDate: z.string().optional().nullable(),
  acquiredPrice: z.number().nonnegative().optional().nullable(),
  fundingSource: z.string().max(100).optional().nullable(),
  status: assetStatusEnum.default("ACTIVE"),
  location: z.string().max(255).optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  responsibleId: z.string().uuid().optional().nullable(),
});

export const updateAssetItemSchema = createAssetItemSchema.extend({
  id: z.string().uuid(),
});

export const transferAssetSchema = z.object({
  id: z.string().uuid(),
  newLocation: z.string().max(255).optional().nullable(),
  newDepartmentId: z.string().uuid().optional().nullable(),
  newResponsibleId: z.string().uuid().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const createSupplyItemSchema = z.object({
  code: z.string().min(2).max(50),
  nameTh: z.string().min(1).max(255),
  unit: z.string().min(1).max(50),
  currentStock: z.number().int().nonnegative().default(0),
  minStock: z.number().int().nonnegative().default(10),
  unitCost: z.number().nonnegative().optional().nullable(),
});

export const updateSupplyItemSchema = createSupplyItemSchema.extend({
  id: z.string().uuid(),
});

export const adjustStockSchema = z.object({
  id: z.string().uuid(),
  quantityChange: z.number().int(), // + for restock, - for usage
  remarks: z.string().optional().nullable(),
});

export type CreateAssetItemInput = z.infer<typeof createAssetItemSchema>;
export type UpdateAssetItemInput = z.infer<typeof updateAssetItemSchema>;
export type TransferAssetInput = z.infer<typeof transferAssetSchema>;
export type CreateSupplyItemInput = z.infer<typeof createSupplyItemSchema>;
export type UpdateSupplyItemInput = z.infer<typeof updateSupplyItemSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
