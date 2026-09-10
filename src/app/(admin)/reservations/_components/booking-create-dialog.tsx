"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { createReservationAction } from "@/features/reservations/actions";
import type { ReservationResourceDto } from "@/features/reservations";

interface BookingCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: ReservationResourceDto[];
  onSuccess?: () => void;
}

export function BookingCreateDialog({
  open,
  onOpenChange,
  resources,
  onSuccess,
}: BookingCreateDialogProps) {
  const t = useT();
  const [pending, startTransition] = useTransition();

  const [resourceId, setResourceId] = useState(resources[0]?.id || "");
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [destination, setDestination] = useState("");

  const [startTime, setStartTime] = useState(() => {
    const d = new Date(Date.now() + 25 * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date(Date.now() + 27 * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedResource = resources.find((r) => r.id === resourceId);
  const isVehicle = selectedResource?.type === "VEHICLE";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await createReservationAction({
        resourceId,
        title,
        purpose,
        attendeesCount: Number(attendeesCount),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        destination: isVehicle ? destination : undefined,
      });

      if (res.ok) {
        toast.success(t("reservations.msg.createSuccess"));
        onOpenChange(false);
        setTitle("");
        setPurpose("");
        setDestination("");
        onSuccess?.();
      } else {
        const msg = res.error?.message || t("reservations.err.collision");
        setErrorMsg(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <form onSubmit={handleSubmit}>
        <LiyonDialogCloseButton label={t("reservations.btn.close")} />
        <LiyonDialogHeader
          title={t("reservations.dialog.createTitle")}
          description={t("reservations.subtitle")}
        />

        <LiyonDialogBody>
          {errorMsg && (
            <div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <LiyonField label={t("reservations.field.resource")} htmlFor="res-select">
              <LiyonSelect
                id="res-select"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                required
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.type === "ROOM" ? t("reservations.type.room") : t("reservations.type.vehicle")}] {r.nameTh} ({r.code}) — {r.capacity} ที่นั่ง
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("reservations.field.title")} htmlFor="res-title">
              <input
                id="res-title"
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ประชุมสภาอาจารย์, สัมมนาวิชาการ"
                required
              />
            </LiyonField>

            <LiyonField label={t("reservations.field.purpose")} htmlFor="res-purpose">
              <textarea
                id="res-purpose"
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="ระบุรายละเอียดและวัตถุประสงค์การใช้งาน"
                required
              />
            </LiyonField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("reservations.field.attendees")} htmlFor="res-attendees">
                <input
                  id="res-attendees"
                  type="number"
                  min={1}
                  max={selectedResource?.capacity || 100}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={attendeesCount}
                  onChange={(e) => setAttendeesCount(Number(e.target.value))}
                  required
                />
              </LiyonField>

              {isVehicle && (
                <LiyonField label={t("reservations.field.destination")} htmlFor="res-dest">
                  <input
                    id="res-dest"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="เช่น ศาลายา, อิมแพ็ค เมืองทองธานี"
                    required
                  />
                </LiyonField>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("reservations.field.startTime")} htmlFor="res-start">
                <input
                  id="res-start"
                  type="datetime-local"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </LiyonField>

              <LiyonField label={t("reservations.field.endTime")} htmlFor="res-end">
                <input
                  id="res-end"
                  type="datetime-local"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </LiyonField>
            </div>

            <div className="p-3 bg-muted/60 rounded-md text-xs text-muted-foreground">
              💡 <strong>เงื่อนไขการจอง:</strong> ต้องจองล่วงหน้าอย่างน้อย 24 ชั่วโมง และระบบจะกันเวลาสำหรับจัดเตรียมความพร้อมและทำความสะอาด 30 นาทีก่อนและหลังช่วงเวลาที่ระบุโดยอัตโนมัติ
            </div>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {t("reservations.btn.close")}
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "กำลังบันทึก..." : t("reservations.btn.create")}
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
