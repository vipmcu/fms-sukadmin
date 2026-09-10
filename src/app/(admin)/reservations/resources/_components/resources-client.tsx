"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Edit2, DoorOpen, Car, Users, MapPin } from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
  LiyonSwitch,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { ReservationsNav } from "../../_components/reservations-nav";
import { createResourceAction, updateResourceAction } from "@/features/reservations/actions";
import type { ReservationResourceDto } from "@/features/reservations";

interface ResourcesClientProps {
  initialResources: ReservationResourceDto[];
  canApprove: boolean;
}

export function ResourcesClient({ initialResources, canApprove }: ResourcesClientProps) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ReservationResourceDto | null>(null);

  // Form states
  const [type, setType] = useState<"ROOM" | "VEHICLE">("ROOM");
  const [code, setCode] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [capacity, setCapacity] = useState(20);
  const [locationOrPlate, setLocationOrPlate] = useState("");
  const [descriptionTh, setDescriptionTh] = useState("");
  const [isActive, setIsActive] = useState(true);

  const openCreateDialog = () => {
    setEditTarget(null);
    setType("ROOM");
    setCode("");
    setNameTh("");
    setNameEn("");
    setCapacity(20);
    setLocationOrPlate("");
    setDescriptionTh("");
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEditDialog = (res: ReservationResourceDto) => {
    setEditTarget(res);
    setType(res.type);
    setCode(res.code);
    setNameTh(res.nameTh);
    setNameEn(res.nameEn);
    setCapacity(res.capacity);
    setLocationOrPlate(res.locationOrPlate);
    setDescriptionTh(res.descriptionTh || "");
    setIsActive(res.isActive);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      if (editTarget) {
        const res = await updateResourceAction({
          id: editTarget.id,
          type,
          code,
          nameTh,
          nameEn,
          capacity: Number(capacity),
          locationOrPlate,
          descriptionTh: descriptionTh || undefined,
          isActive,
        });

        if (res.ok) {
          toast.success(t("reservations.msg.resourceUpdated"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error?.message || "เกิดข้อผิดพลาดในการแก้ไข");
        }
      } else {
        const res = await createResourceAction({
          type,
          code,
          nameTh,
          nameEn,
          capacity: Number(capacity),
          locationOrPlate,
          descriptionTh: descriptionTh || undefined,
          isActive,
        });

        if (res.ok) {
          toast.success(t("reservations.msg.resourceCreated"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error?.message || "เกิดข้อผิดพลาดในการสร้าง");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("reservations.tab.resources")}</h1>
          <p className="text-muted-foreground text-sm">จัดการข้อมูลห้องประชุมและยานพาหนะส่วนกลางของคณะ</p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2 shrink-0">
          <Plus className="size-4" />
          <span>เพิ่มห้อง/ยานพาหนะ</span>
        </Button>
      </div>

      <ReservationsNav canApprove={canApprove} canManage={true} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialResources.map((r) => {
          const isRoom = r.type === "ROOM";

          return (
            <div
              key={r.id}
              className="p-5 bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-primary/10 text-primary">
                      {isRoom ? <DoorOpen className="size-5" /> : <Car className="size-5" />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-muted rounded">
                          {r.code}
                        </span>
                        <StatusPill tone={r.isActive ? "ok" : "off"}>
                          {r.isActive ? "เปิดใช้งาน" : "ปิดปรับปรุง"}
                        </StatusPill>
                      </div>
                      <h3 className="text-base font-semibold text-foreground mt-1">{r.nameTh}</h3>
                      <p className="text-xs text-muted-foreground">{r.nameEn}</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(r)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="size-4" />
                  </Button>
                </div>

                {r.descriptionTh && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{r.descriptionTh}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    <span>ความจุ: {r.capacity} {isRoom ? "ที่นั่ง" : "คน"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    <span>{r.locationOrPlate}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Dialog */}
      <LiyonDialog open={dialogOpen} onOpenChange={setDialogOpen} wide>
        <form onSubmit={handleSubmit}>
          <LiyonDialogCloseButton label={t("reservations.btn.close")} />
          <LiyonDialogHeader
            title={editTarget ? `แก้ไข ${editTarget.nameTh}` : "เพิ่มทรัพยากรใหม่"}
            description="กำหนดข้อมูล รหัส ความจุ และสถานที่ของห้องประชุมหรือยานพาหนะ"
          />

          <LiyonDialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="ประเภท">
                  <LiyonSelect
                    value={type}
                    onChange={(e) => setType(e.target.value as "ROOM" | "VEHICLE")}
                    disabled={Boolean(editTarget)}
                  >
                    <option value="ROOM">{t("reservations.type.room")}</option>
                    <option value="VEHICLE">{t("reservations.type.vehicle")}</option>
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label="รหัสทรัพยากร (เช่น RM-301, VAN-01)">
                  <input
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="ชื่อภาษาไทย">
                  <input
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={nameTh}
                    onChange={(e) => setNameTh(e.target.value)}
                    placeholder="เช่น ห้องประชุมสารภี 1"
                    required
                  />
                </LiyonField>

                <LiyonField label="ชื่อภาษาอังกฤษ">
                  <input
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Sarapee Conference Room 1"
                    required
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="ความจุ (ที่นั่ง/ผู้โดยสาร)">
                  <input
                    type="number"
                    min={1}
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    required
                  />
                </LiyonField>

                <LiyonField label={type === "ROOM" ? "สถานที่ตั้ง (อาคาร/ชั้น/ห้อง)" : "ป้ายทะเบียนรถ"}>
                  <input
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={locationOrPlate}
                    onChange={(e) => setLocationOrPlate(e.target.value)}
                    placeholder={type === "ROOM" ? "เช่น อาคาร 3 ชั้น 3" : "เช่น ฮข-1234 กทม."}
                    required
                  />
                </LiyonField>
              </div>

              <LiyonField label="รายละเอียด / อุปกรณ์ประจำห้อง">
                <textarea
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  value={descriptionTh}
                  onChange={(e) => setDescriptionTh(e.target.value)}
                  placeholder="เช่น มีโปรเจกเตอร์ 2 ตัว ไมโครโฟนไร้สาย 4 ตัว ระบบ Hybrid Zoom Rooms"
                />
              </LiyonField>

              <div className="flex items-center gap-3 pt-2">
                <LiyonSwitch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <span className="text-sm font-medium">เปิดให้จองในระบบ</span>
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={pending}
            >
              {t("reservations.btn.close")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "กำลังบันทึก..." : t("reservations.btn.save")}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
