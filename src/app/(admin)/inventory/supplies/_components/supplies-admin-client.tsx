"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Archive,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  TrendingDown,
  TrendingUp,
  Boxes,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import {
  createSupplyItemAction,
  updateSupplyItemAction,
  adjustSupplyStockAction,
} from "@/features/assets/actions";
import type { SupplyItemDto } from "@/features/assets";

interface SuppliesAdminClientProps {
  initialItems: SupplyItemDto[];
  canManage: boolean;
}

export function SuppliesAdminClient({
  initialItems,
  canManage,
}: SuppliesAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState<SupplyItemDto[]>(initialItems);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("ALL");

  // Create/Edit Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SupplyItemDto | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    nameTh: "",
    unit: "ชิ้น",
    currentStock: 0,
    minStock: 10,
    unitCost: 0,
  });

  // Adjust Stock Dialog
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<SupplyItemDto | null>(null);
  const [adjustType, setAdjustType] = useState<"IN" | "OUT">("IN");
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const [adjustRemarks, setAdjustRemarks] = useState("");

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchSearch =
      search === "" ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.nameTh.toLowerCase().includes(search.toLowerCase());

    const matchStock =
      stockFilter === "ALL" ||
      (stockFilter === "LOW" && item.isLowStock) ||
      (stockFilter === "NORMAL" && !item.isLowStock);

    return matchSearch && matchStock;
  });

  // Stats
  const totalCount = items.length;
  const lowStockCount = items.filter((i) => i.isLowStock).length;
  const totalValue = items.reduce(
    (sum, i) => sum + i.currentStock * (i.unitCost || 0),
    0
  );

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      code: "",
      nameTh: "",
      unit: "ชิ้น",
      currentStock: 0,
      minStock: 10,
      unitCost: 0,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: SupplyItemDto) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      nameTh: item.nameTh,
      unit: item.unit,
      currentStock: item.currentStock,
      minStock: item.minStock,
      unitCost: item.unitCost || 0,
    });
    setIsDialogOpen(true);
  };

  const handleOpenAdjust = (item: SupplyItemDto, defaultType: "IN" | "OUT" = "IN") => {
    setAdjustingItem(item);
    setAdjustType(defaultType);
    setAdjustQuantity(1);
    setAdjustRemarks("");
    setIsAdjustOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (editingItem) {
          const res = await updateSupplyItemAction({
            id: editingItem.id,
            code: formData.code,
            nameTh: formData.nameTh,
            unit: formData.unit,
            currentStock: Number(formData.currentStock),
            minStock: Number(formData.minStock),
            unitCost: formData.unitCost ? Number(formData.unitCost) : null,
          });
          if (res.ok) {
            toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
            setItems((prev) =>
              prev.map((it) => (it.id === editingItem.id ? res.data : it))
            );
            setIsDialogOpen(false);
            router.refresh();
          } else {
            toast.error(res.error.message);
          }
        } else {
          const res = await createSupplyItemAction({
            code: formData.code,
            nameTh: formData.nameTh,
            unit: formData.unit,
            currentStock: Number(formData.currentStock),
            minStock: Number(formData.minStock),
            unitCost: formData.unitCost ? Number(formData.unitCost) : null,
          });
          if (res.ok) {
            toast.success("เพิ่มรายการวัสดุเรียบร้อยแล้ว");
            setItems((prev) => [res.data, ...prev]);
            setIsDialogOpen(false);
            router.refresh();
          } else {
            toast.error(res.error.message);
          }
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error saving supply");
      }
    });
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;
    if (adjustQuantity <= 0) {
      toast.error("จำนวนต้องมากกว่า 0");
      return;
    }

    const change = adjustType === "IN" ? adjustQuantity : -adjustQuantity;

    if (adjustType === "OUT" && adjustingItem.currentStock < adjustQuantity) {
      toast.error("จำนวนคงเหลือไม่เพียงพอสำหรับการเบิกจ่าย");
      return;
    }

    startTransition(async () => {
      try {
        const res = await adjustSupplyStockAction({
          id: adjustingItem.id,
          quantityChange: change,
          remarks: adjustRemarks || null,
        });

        if (res.ok) {
          toast.success(
            adjustType === "IN"
              ? "รับเข้าพัสดุสำเร็จ"
              : "เบิกจ่ายพัสดุสำเร็จ"
          );
          setItems((prev) =>
            prev.map((it) => (it.id === adjustingItem.id ? res.data : it))
          );
          setIsAdjustOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error adjusting stock");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            คลังพัสดุและวัสดุสิ้นเปลือง
          </h1>
          <p className="text-sm text-muted-foreground">
            ระบบควบคุมสต็อกวัสดุสำนักงาน บริหารการรับเข้า-เบิกจ่าย และระบบเตือนจุดสั่งซื้อ
          </p>
        </div>

        {canManage && (
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มวัสดุใหม่
          </Button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">จำนวนรายการวัสดุทั้งหมด</div>
            <div className="text-2xl font-bold text-foreground">
              {totalCount} <span className="text-sm font-normal text-muted-foreground">รายการ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">รายการใกล้หมด (ต้องสั่งซื้อ)</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {lowStockCount} <span className="text-sm font-normal text-muted-foreground">รายการ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">มูลค่าคงคลังประเมิน</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ฿{totalValue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="ค้นหาด้วยรหัสวัสดุ หรือชื่อรายการ..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-[180px]">
            <LiyonSelect
              value={stockFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStockFilter(e.target.value)}
            >
              <option value="ALL">ทุกสถานะคงคลัง</option>
              <option value="NORMAL">สต็อกปกติ</option>
              <option value="LOW">ใกล้หมด (ต่ำกว่าเกณฑ์)</option>
            </LiyonSelect>
          </div>
        </div>
      </div>

      {/* Supplies Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-card-foreground">
            <thead className="border-b bg-muted/50 text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">รหัสวัสดุ</th>
                <th className="px-4 py-3">ชื่อรายการ</th>
                <th className="px-4 py-3 text-center">หน่วยนับ</th>
                <th className="px-4 py-3 text-right">ราคา/หน่วย</th>
                <th className="px-4 py-3 text-right">คงเหลือ</th>
                <th className="px-4 py-3 text-right">เกณฑ์เตือน</th>
                <th className="px-4 py-3 text-center">สถานะ</th>
                {canManage && <th className="px-4 py-3 text-right">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="px-4 py-8 text-center text-muted-foreground">
                    <Archive className="mx-auto h-8 w-8 opacity-40 mb-2" />
                    ไม่พบข้อมูลวัสดุ
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-foreground">
                      {item.code}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {item.nameTh}
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs text-muted-foreground">
                      {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs">
                      {item.unitCost ? `฿${item.unitCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}` : "-"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold">
                      <span className={item.isLowStock ? "text-red-600 dark:text-red-400" : "text-foreground"}>
                        {item.currentStock.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-muted-foreground">
                      {item.minStock.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusPill tone={item.isLowStock ? "bad" : "ok"}>
                        {item.isLowStock ? "ใกล้หมด" : "ปกติ"}
                      </StatusPill>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-300"
                            onClick={() => handleOpenAdjust(item, "IN")}
                            title="รับเข้าสต็อก"
                          >
                            <TrendingUp className="h-3.5 w-3.5 mr-1" />
                            รับเข้า
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-amber-300"
                            onClick={() => handleOpenAdjust(item, "OUT")}
                            title="เบิกจ่ายวัสดุ"
                          >
                            <TrendingDown className="h-3.5 w-3.5 mr-1" />
                            เบิกจ่าย
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEdit(item)}
                            title="แก้ไขข้อมูล"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <LiyonDialogHeader
          title={editingItem ? "แก้ไขข้อมูลวัสดุสิ้นเปลือง" : "เพิ่มวัสดุสิ้นเปลืองใหม่"}
        />
        <LiyonDialogCloseButton label="ปิด" />

        <form onSubmit={handleSaveItem}>
          <LiyonDialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="รหัสวัสดุ *">
                  <input
                    required
                    value={formData.code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="เช่น SUP-001"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="หน่วยนับ *">
                  <input
                    required
                    value={formData.unit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    placeholder="เช่น รีม, กล่อง, ด้าม, แฟ้ม"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>
              </div>

              <LiyonField label="ชื่อวัสดุ *">
                <input
                  required
                  value={formData.nameTh}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, nameTh: e.target.value })
                  }
                  placeholder="เช่น กระดาษ A4 80 แกรม Double A"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </LiyonField>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LiyonField label="สต็อกตั้งต้น">
                  <input
                    type="number"
                    min={0}
                    value={formData.currentStock}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, currentStock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="เกณฑ์เตือนสั่งซื้อ">
                  <input
                    type="number"
                    min={0}
                    value={formData.minStock}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, minStock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="ราคา/หน่วย (บาท)">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.unitCost}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, unitCost: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Adjust Stock Dialog */}
      <LiyonDialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <LiyonDialogHeader
          title={
            <span className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-primary" />
              {adjustType === "IN" ? "รับเข้าพัสดุสู่คลัง" : "บันทึกการเบิกจ่ายพัสดุ"}
            </span>
          }
        />
        <LiyonDialogCloseButton label="ปิด" />

        {adjustingItem && (
          <form onSubmit={handleSaveAdjust}>
            <LiyonDialogBody>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-3">
                  <div className="font-semibold text-foreground">
                    {adjustingItem.nameTh}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span>รหัส: {adjustingItem.code}</span>
                    <span>
                      คงเหลือปัจจุบัน: <strong>{adjustingItem.currentStock}</strong> {adjustingItem.unit}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={adjustType === "IN" ? "default" : "outline"}
                    className={adjustType === "IN" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                    onClick={() => setAdjustType("IN")}
                  >
                    <TrendingUp className="mr-1.5 h-4 w-4" />
                    รับเข้าสต็อก
                  </Button>
                  <Button
                    type="button"
                    variant={adjustType === "OUT" ? "default" : "outline"}
                    className={adjustType === "OUT" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
                    onClick={() => setAdjustType("OUT")}
                  >
                    <TrendingDown className="mr-1.5 h-4 w-4" />
                    เบิกจ่ายวัสดุ
                  </Button>
                </div>

                <LiyonField label={`จำนวน (${adjustingItem.unit}) *`}>
                  <input
                    type="number"
                    min={1}
                    required
                    value={adjustQuantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAdjustQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="หมายเหตุ / วัตถุประสงค์">
                  <input
                    value={adjustRemarks}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustRemarks(e.target.value)}
                    placeholder={adjustType === "IN" ? "เช่น สั่งซื้อตาม PO-67/012" : "เช่น เบิกใช้สำหรับงานประชุมวิชาการ"}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdjustOpen(false)}
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className={adjustType === "IN" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}
              >
                {isPending ? "กำลังประมวลผล..." : "ยืนยันการทำรายการ"}
              </Button>
            </LiyonDialogFooter>
          </form>
        )}
      </LiyonDialog>
    </div>
  );
}
