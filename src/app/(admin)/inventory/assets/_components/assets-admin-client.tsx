"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Package,
  Plus,
  QrCode,
  Search,
  ArrowRightLeft,
  Trash2,
  Building,
  User,
  MapPin,
  Layers,
  Edit2,
  Printer,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StatusPill,
  type StatusPillTone,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import {
  createAssetItemAction,
  updateAssetItemAction,
  transferAssetAction,
  deleteAssetItemAction,
} from "@/features/assets/actions";
import type { AssetItemDto, AssetCategoryDto } from "@/features/assets";
import type { DepartmentDto, PersonnelProfileDto } from "@/features/personnel";

interface AssetsAdminClientProps {
  categories: AssetCategoryDto[];
  initialItems: AssetItemDto[];
  departments: DepartmentDto[];
  personnel: PersonnelProfileDto[];
  canCreate: boolean;
  canEdit: boolean;
  canTransfer: boolean;
  canDelete: boolean;
}

export function AssetsAdminClient({
  categories,
  initialItems,
  departments,
  personnel,
  canCreate,
  canEdit,
  canTransfer,
  canDelete,
}: AssetsAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState<AssetItemDto[]>(initialItems);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Create/Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AssetItemDto | null>(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    assetCode: "",
    nameTh: "",
    nameEn: "",
    brandModel: "",
    serialNumber: "",
    acquiredDate: "",
    acquiredPrice: "",
    fundingSource: "",
    status: "ACTIVE" as AssetItemDto["status"],
    location: "",
    departmentId: "",
    responsibleId: "",
  });

  // Transfer Dialog State
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<AssetItemDto | null>(null);
  const [transferData, setTransferData] = useState({
    newLocation: "",
    newDepartmentId: "",
    newResponsibleId: "",
    remarks: "",
  });

  // QR Label Dialog State
  const [qrItem, setQrItem] = useState<AssetItemDto | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchSearch =
      search === "" ||
      item.assetCode.toLowerCase().includes(search.toLowerCase()) ||
      item.nameTh.toLowerCase().includes(search.toLowerCase()) ||
      (item.brandModel && item.brandModel.toLowerCase().includes(search.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(search.toLowerCase()));

    const matchCategory = selectedCategory === "ALL" || item.categoryId === selectedCategory;
    const matchStatus = selectedStatus === "ALL" || item.status === selectedStatus;

    return matchSearch && matchCategory && matchStatus;
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      categoryId: categories[0]?.id || "",
      assetCode: "",
      nameTh: "",
      nameEn: "",
      brandModel: "",
      serialNumber: "",
      acquiredDate: new Date().toISOString().split("T")[0]!,
      acquiredPrice: "",
      fundingSource: "งบประมาณแผ่นดิน",
      status: "ACTIVE",
      location: "",
      departmentId: departments[0]?.id || "",
      responsibleId: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: AssetItemDto) => {
    setEditingItem(item);
    setFormData({
      categoryId: item.categoryId,
      assetCode: item.assetCode,
      nameTh: item.nameTh,
      nameEn: item.nameEn || "",
      brandModel: item.brandModel || "",
      serialNumber: item.serialNumber || "",
      acquiredDate: item.acquiredDate ? item.acquiredDate.split("T")[0]! : "",
      acquiredPrice: item.acquiredPrice ? String(item.acquiredPrice) : "",
      fundingSource: item.fundingSource || "",
      status: item.status,
      location: item.location || "",
      departmentId: item.departmentId || "",
      responsibleId: item.responsibleId || "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenTransfer = (item: AssetItemDto) => {
    setTransferTarget(item);
    setTransferData({
      newLocation: item.location || "",
      newDepartmentId: item.departmentId || "",
      newResponsibleId: item.responsibleId || "",
      remarks: "",
    });
    setIsTransferOpen(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (editingItem) {
          const res = await updateAssetItemAction({
            id: editingItem.id,
            categoryId: formData.categoryId,
            assetCode: formData.assetCode,
            nameTh: formData.nameTh,
            nameEn: formData.nameEn || null,
            brandModel: formData.brandModel || null,
            serialNumber: formData.serialNumber || null,
            acquiredDate: formData.acquiredDate ? new Date(formData.acquiredDate).toISOString() : null,
            acquiredPrice: formData.acquiredPrice ? Number(formData.acquiredPrice) : null,
            fundingSource: formData.fundingSource || null,
            status: formData.status,
            location: formData.location || null,
            departmentId: formData.departmentId || null,
            responsibleId: formData.responsibleId || null,
          });

          if (res.ok) {
            toast.success("บันทึกข้อมูลครุภัณฑ์สำเร็จ");
            setItems((prev) =>
              prev.map((it) => (it.id === editingItem.id ? res.data : it))
            );
            setIsDialogOpen(false);
            router.refresh();
          } else {
            toast.error(res.error.message);
          }
        } else {
          const res = await createAssetItemAction({
            categoryId: formData.categoryId,
            assetCode: formData.assetCode,
            nameTh: formData.nameTh,
            nameEn: formData.nameEn || null,
            brandModel: formData.brandModel || null,
            serialNumber: formData.serialNumber || null,
            acquiredDate: formData.acquiredDate ? new Date(formData.acquiredDate).toISOString() : null,
            acquiredPrice: formData.acquiredPrice ? Number(formData.acquiredPrice) : null,
            fundingSource: formData.fundingSource || null,
            status: formData.status,
            location: formData.location || null,
            departmentId: formData.departmentId || null,
            responsibleId: formData.responsibleId || null,
          });

          if (res.ok) {
            toast.success("ลงทะเบียนครุภัณฑ์สำเร็จ");
            setItems((prev) => [res.data, ...prev]);
            setIsDialogOpen(false);
            router.refresh();
          } else {
            toast.error(res.error.message);
          }
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error saving asset");
      }
    });
  };

  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTarget) return;

    startTransition(async () => {
      try {
        const res = await transferAssetAction({
          id: transferTarget.id,
          newLocation: transferData.newLocation || null,
          newDepartmentId: transferData.newDepartmentId || null,
          newResponsibleId: transferData.newResponsibleId || null,
          remarks: transferData.remarks || null,
        });

        if (res.ok) {
          toast.success("โอนย้ายสถานที่และผู้รับผิดชอบสำเร็จ");
          setItems((prev) =>
            prev.map((it) => (it.id === transferTarget.id ? res.data : it))
          );
          setIsTransferOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error transferring asset");
      }
    });
  };

  const handleDeleteAsset = (item: AssetItemDto) => {
    if (!confirm(`ต้องการลบครุภัณฑ์ "${item.assetCode} - ${item.nameTh}" หรือไม่?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteAssetItemAction(item.id);
        if (res.ok) {
          toast.success("ลบครุภัณฑ์สำเร็จ");
          setItems((prev) => prev.filter((it) => it.id !== item.id));
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error deleting asset");
      }
    });
  };

  const getStatusTone = (status: AssetItemDto["status"]): StatusPillTone => {
    switch (status) {
      case "ACTIVE":
        return "ok";
      case "IN_USE":
        return "info";
      case "UNDER_REPAIR":
        return "warn";
      case "DAMAGED":
        return "bad";
      case "DISPOSED":
        return "off";
      default:
        return "off";
    }
  };

  const getStatusLabel = (status: AssetItemDto["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "พร้อมใช้งาน";
      case "IN_USE":
        return "กำลังใช้งาน";
      case "UNDER_REPAIR":
        return "อยู่ระหว่างส่งซ่อม";
      case "DAMAGED":
        return "ชำรุดเสียหาย";
      case "DISPOSED":
        return "แทงจำหน่ายแล้ว";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ทะเบียนครุภัณฑ์และสินทรัพย์
          </h1>
          <p className="text-sm text-muted-foreground">
            ระบบบริหารจัดการครุภัณฑ์ การตรวจนับสต็อก การโอนย้าย และพิมพ์ป้าย QR Code ประจำทรัพย์สิน
          </p>
        </div>

        {canCreate && (
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            ลงทะเบียนครุภัณฑ์
          </Button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">ครุภัณฑ์ทั้งหมด</div>
            <div className="text-2xl font-bold text-foreground">
              {items.length} <span className="text-sm font-normal text-muted-foreground">รายการ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">พร้อมใช้งาน (Active)</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {items.filter((i) => i.status === "ACTIVE").length} <span className="text-sm font-normal text-muted-foreground">รายการ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <ArrowRightLeft className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">ส่งซ่อม / ใช้งานอยู่</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {items.filter((i) => i.status === "IN_USE" || i.status === "UNDER_REPAIR").length} <span className="text-sm font-normal text-muted-foreground">รายการ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">มูลค่ารวมประเมิน</div>
            <div className="text-2xl font-bold text-foreground">
              ฿{items.reduce((sum, i) => sum + (i.acquiredPrice || 0), 0).toLocaleString("th-TH")}
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
            placeholder="ค้นหาด้วยรหัสครุภัณฑ์, ชื่อรายการ, ยี่ห้อ/รุ่น, หรือห้องที่ตั้ง..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-[180px]">
            <LiyonSelect
              value={selectedCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameTh}
                </option>
              ))}
            </LiyonSelect>
          </div>

          <div className="w-[160px]">
            <LiyonSelect
              value={selectedStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">ทุกสถานะ</option>
              <option value="ACTIVE">พร้อมใช้งาน</option>
              <option value="IN_USE">กำลังใช้งาน</option>
              <option value="UNDER_REPAIR">อยู่ระหว่างส่งซ่อม</option>
              <option value="DAMAGED">ชำรุดเสียหาย</option>
              <option value="DISPOSED">จำหน่ายแล้ว</option>
            </LiyonSelect>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-card-foreground">
            <thead className="border-b bg-muted/50 text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">รหัสครุภัณฑ์</th>
                <th className="px-4 py-3">ชื่อรายการ / ยี่ห้อรุ่น</th>
                <th className="px-4 py-3">หมวดหมู่</th>
                <th className="px-4 py-3">สถานที่ / หน่วยงาน</th>
                <th className="px-4 py-3">ผู้ถือครอง</th>
                <th className="px-4 py-3 text-right">ราคาจัดหา</th>
                <th className="px-4 py-3 text-center">สถานะ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    <Package className="mx-auto h-8 w-8 opacity-40 mb-2" />
                    ไม่พบรายการครุภัณฑ์ตรงตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-primary">
                      {item.assetCode}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-foreground">{item.nameTh}</div>
                      {item.brandModel && (
                        <div className="text-xs text-muted-foreground">{item.brandModel}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {item.categoryNameTh || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div className="flex items-center gap-1 text-foreground">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {item.location || "-"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {item.departmentNameTh || ""}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div className="flex items-center gap-1 text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {item.responsibleNameTh || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs">
                      {item.acquiredPrice ? `฿${item.acquiredPrice.toLocaleString("th-TH")}` : "-"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusPill tone={getStatusTone(item.status)}>
                        {getStatusLabel(item.status)}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => setQrItem(item)}
                          title="พิมพ์ป้าย QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        {canTransfer && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenTransfer(item)}
                            title="โอนย้ายสถานที่ / ผู้รับผิดชอบ"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                        )}
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEdit(item)}
                            title="แก้ไขข้อมูล"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteAsset(item)}
                            title="ลบครุภัณฑ์"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
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
          title={editingItem ? "แก้ไขข้อมูลครุภัณฑ์" : "ลงทะเบียนครุภัณฑ์ใหม่"}
        />
        <LiyonDialogCloseButton label="ปิด" />

        <form onSubmit={handleSaveAsset}>
          <LiyonDialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="หมวดหมู่ครุภัณฑ์ *">
                  <LiyonSelect
                    value={formData.categoryId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameTh} ({c.code})
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label="รหัสครุภัณฑ์ *">
                  <input
                    required
                    placeholder="เช่น COM-2567-001"
                    value={formData.assetCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, assetCode: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>
              </div>

              <LiyonField label="ชื่อครุภัณฑ์ (ภาษาไทย) *">
                <input
                  required
                  placeholder="ระบุชื่อครุภัณฑ์ภาษาไทย"
                  value={formData.nameTh}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, nameTh: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </LiyonField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="ยี่ห้อ / รุ่น">
                  <input
                    placeholder="เช่น Dell OptiPlex 7410"
                    value={formData.brandModel}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, brandModel: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="Serial Number">
                  <input
                    placeholder="เช่น SN-DELL-98214301"
                    value={formData.serialNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, serialNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LiyonField label="ราคาจัดหา (บาท)">
                  <input
                    type="number"
                    placeholder="เช่น 35000"
                    value={formData.acquiredPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, acquiredPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="วันที่ได้มา">
                  <input
                    type="date"
                    value={formData.acquiredDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, acquiredDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="สถานะครุภัณฑ์">
                  <LiyonSelect
                    value={formData.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormData({ ...formData, status: e.target.value as AssetItemDto["status"] })
                    }
                  >
                    <option value="ACTIVE">พร้อมใช้งาน (Active)</option>
                    <option value="IN_USE">กำลังใช้งาน (In Use)</option>
                    <option value="UNDER_REPAIR">ส่งซ่อม (Under Repair)</option>
                    <option value="DAMAGED">ชำรุดเสียหาย (Damaged)</option>
                    <option value="DISPOSED">จำหน่ายแล้ว (Disposed)</option>
                  </LiyonSelect>
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="ภาควิชา / หน่วยงานสังกัด">
                  <LiyonSelect
                    value={formData.departmentId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormData({ ...formData, departmentId: e.target.value })
                    }
                  >
                    <option value="">-- ไม่ระบุ --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameTh}
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label="ผู้ถือครอง / ผู้รับผิดชอบ">
                  <LiyonSelect
                    value={formData.responsibleId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormData({ ...formData, responsibleId: e.target.value })
                    }
                  >
                    <option value="">-- ไม่ระบุ --</option>
                    {personnel.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullNameTh} ({p.departmentNameTh})
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>
              </div>

              <LiyonField label="สถานที่จัดวาง / ห้องที่ตั้ง">
                <input
                  placeholder="เช่น ห้องปฏิบัติการคอมพิวเตอร์ 402 อาคารบริหาร"
                  value={formData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </LiyonField>
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

      {/* Transfer Dialog */}
      <LiyonDialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <LiyonDialogHeader
          title={
            <span className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              โอนย้ายสถานที่และผู้รับผิดชอบ
            </span>
          }
        />
        <LiyonDialogCloseButton label="ปิด" />

        {transferTarget && (
          <form onSubmit={handleSaveTransfer}>
            <LiyonDialogBody>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-3">
                  <div className="font-semibold text-foreground">
                    {transferTarget.assetCode} - {transferTarget.nameTh}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    สถานที่เดิม: {transferTarget.location || "-"} | ผู้รับผิดชอบเดิม:{" "}
                    {transferTarget.responsibleNameTh || "-"}
                  </div>
                </div>

                <LiyonField label="สถานที่จัดวางใหม่">
                  <input
                    placeholder="เช่น ห้องบรรยาย 301 หรือ สำนักงานคณบดี ชั้น 2"
                    value={transferData.newLocation}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTransferData({ ...transferData, newLocation: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LiyonField label="ภาควิชา / หน่วยงานใหม่">
                    <LiyonSelect
                      value={transferData.newDepartmentId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setTransferData({ ...transferData, newDepartmentId: e.target.value })
                      }
                    >
                      <option value="">-- คงเดิม / ไม่ระบุ --</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nameTh}
                        </option>
                      ))}
                    </LiyonSelect>
                  </LiyonField>

                  <LiyonField label="ผู้รับผิดชอบคนใหม่">
                    <LiyonSelect
                      value={transferData.newResponsibleId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setTransferData({ ...transferData, newResponsibleId: e.target.value })
                      }
                    >
                      <option value="">-- คงเดิม / ไม่ระบุ --</option>
                      {personnel.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullNameTh}
                        </option>
                      ))}
                    </LiyonSelect>
                  </LiyonField>
                </div>

                <LiyonField label="หมายเหตุ / เลขที่หนังสือขอโอนย้าย">
                  <input
                    placeholder="เช่น บันทึกข้อความ อว. 0621/443"
                    value={transferData.remarks}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTransferData({ ...transferData, remarks: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTransferOpen(false)}
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "กำลังบันทึก..." : "ยืนยันการโอนย้าย"}
              </Button>
            </LiyonDialogFooter>
          </form>
        )}
      </LiyonDialog>

      {/* QR Label Print Dialog */}
      <LiyonDialog open={!!qrItem} onOpenChange={(open) => !open && setQrItem(null)}>
        <LiyonDialogHeader
          title={
            <span className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              ป้ายสติ๊กเกอร์ QR Code ประจำครุภัณฑ์
            </span>
          }
        />
        <LiyonDialogCloseButton label="ปิด" />

        {qrItem && (
          <div>
            <LiyonDialogBody>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-muted/20">
                <div className="bg-white p-4 rounded-xl shadow-sm border text-center text-neutral-900 w-64">
                  <div className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase mb-1">
                    Faculty Asset Tag
                  </div>
                  <div className="font-mono font-bold text-base text-neutral-900 border-b pb-1 mb-2">
                    {qrItem.assetCode}
                  </div>
                  {/* Visual QR Simulator */}
                  <div className="w-36 h-36 mx-auto bg-neutral-100 rounded-lg flex items-center justify-center border p-2">
                    <QrCode className="w-32 h-32 text-neutral-800" />
                  </div>
                  <div className="text-xs font-semibold mt-2 line-clamp-1">
                    {qrItem.nameTh}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    สแกนเพื่อตรวจสอบสถานะ / แจ้งซ่อม
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-4 text-center">
                  ลิงก์สาธารณะ:{" "}
                  <a
                    href={`/asset-qr/${qrItem.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline inline-flex items-center gap-0.5"
                  >
                    /asset-qr/{qrItem.id}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <Button
                variant="outline"
                onClick={() => setQrItem(null)}
              >
                ปิดหน้าต่าง
              </Button>
              <Button
                onClick={() => {
                  window.print();
                }}
                className="gap-1.5"
              >
                <Printer className="h-4 w-4" />
                สั่งพิมพ์ป้าย
              </Button>
            </LiyonDialogFooter>
          </div>
        )}
      </LiyonDialog>
    </div>
  );
}
