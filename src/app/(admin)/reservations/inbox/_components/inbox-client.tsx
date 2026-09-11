"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, MapPin, Users as UsersIcon } from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  StatusPill,
  type StatusPillTone,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { ReservationsNav } from "../../_components/reservations-nav";
import { approveReservationAction, rejectReservationAction } from "@/features/reservations/actions";
import type { ReservationDto } from "@/features/reservations";

interface InboxClientProps {
  initialReservations: ReservationDto[];
  canManage: boolean;
}

export function InboxClient({ initialReservations, canManage }: InboxClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  // Dialog states
  const [approveTarget, setApproveTarget] = useState<ReservationDto | null>(null);
  const [approvalNote, setApprovalNote] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [assignedVehiclePlate, setAssignedVehiclePlate] = useState("");

  const [rejectTarget, setRejectTarget] = useState<ReservationDto | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const filtered = initialReservations.filter((item) => {
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
    return true;
  });

  const getStatusTone = (status: string): StatusPillTone => {
    switch (status) {
      case "APPROVED":
        return "ok";
      case "PENDING":
        return "warn";
      case "REJECTED":
        return "bad";
      default:
        return "off";
    }
  };

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveTarget) return;

    startTransition(async () => {
      const res = await approveReservationAction({
        id: approveTarget.id,
        approvalNote: approvalNote || undefined,
        driverName: driverName || undefined,
        driverPhone: driverPhone || undefined,
        assignedVehiclePlate: assignedVehiclePlate || undefined,
      });

      if (res.ok) {
        toast.success(t("reservations.msg.approveSuccess"));
        setApproveTarget(null);
        setApprovalNote("");
        setDriverName("");
        setDriverPhone("");
        setAssignedVehiclePlate("");
        router.refresh();
      } else {
        toast.error(res.error?.message || "เกิดข้อผิดพลาดในการอนุมัติ");
      }
    });
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;

    startTransition(async () => {
      const res = await rejectReservationAction({
        id: rejectTarget.id,
        rejectionReason,
      });

      if (res.ok) {
        toast.success(t("reservations.msg.rejectSuccess"));
        setRejectTarget(null);
        setRejectionReason("");
        router.refresh();
      } else {
        toast.error(res.error?.message || "เกิดข้อผิดพลาดในการปฏิเสธคำขอ");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("reservations.tab.inbox")}</h1>
        <p className="text-muted-foreground text-sm">ตรวจสอบและพิจารณาอนุมัติคำขอใช้ห้องประชุมและยานพาหนะ</p>
      </div>

      <ReservationsNav canApprove={true} canManage={canManage} />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === st
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {st === "PENDING" && `${t("reservations.status.pending")} (${initialReservations.filter((r) => r.status === "PENDING").length})`}
            {st === "APPROVED" && t("reservations.status.approved")}
            {st === "REJECTED" && t("reservations.status.rejected")}
            {st === "ALL" && "ทั้งหมด"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card">
          <Clock className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-base font-semibold">ไม่มีรายการในสถานะนี้</h3>
          <p className="text-sm text-muted-foreground mt-1">คิวงานของคุณได้รับการจัดการเรียบร้อยแล้ว</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isPending = item.status === "PENDING";
            const s = new Date(item.startTime);
            const e = new Date(item.endTime);

            return (
              <div
                key={item.id}
                className="p-5 bg-card border border-border rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusPill tone={getStatusTone(item.status)}>
                      {t(`reservations.status.${item.status.toLowerCase()}` as Parameters<typeof t>[0])}
                    </StatusPill>
                    <span className="text-xs font-mono text-muted-foreground">{item.bookingNo}</span>
                    <span className="text-xs font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded">
                      {item.resourceNameTh}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.purpose}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      <span>{formatDate(s, locale)} ({s.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} - {e.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="size-3.5" />
                      <span>{item.requesterName} ({item.attendeesCount} คน)</span>
                    </div>
                    {item.destination && (
                      <div className="flex items-center gap-1.5 text-primary">
                        <MapPin className="size-3.5" />
                        <span>ปลายทาง: {item.destination}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isPending && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectTarget(item)}
                      className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="size-4" />
                      <span>{t("reservations.btn.reject")}</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setApproveTarget(item);
                        setAssignedVehiclePlate(item.locationOrPlate);
                      }}
                      className="gap-1.5"
                    >
                      <CheckCircle2 className="size-4" />
                      <span>{t("reservations.btn.approve")}</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Approve Dialog */}
      <LiyonDialog
        open={Boolean(approveTarget)}
        onOpenChange={(open) => !open && setApproveTarget(null)}
      >
        <form onSubmit={handleApproveSubmit}>
          <LiyonDialogCloseButton label={t("reservations.btn.close")} />
          <LiyonDialogHeader
            title={t("reservations.dialog.approveTitle")}
            description={`ยืนยันการอนุมัติคำขอ ${approveTarget?.bookingNo}`}
          />

          <LiyonDialogBody>
            <div className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                <div><strong>หัวข้อ:</strong> {approveTarget?.title}</div>
                <div><strong>ทรัพยากร:</strong> {approveTarget?.resourceNameTh}</div>
                <div><strong>ผู้ขอ:</strong> {approveTarget?.requesterName}</div>
              </div>

              {approveTarget?.resourceType === "VEHICLE" && (
                <>
                  <LiyonField label={t("reservations.field.driverName")}>
                    <input
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี"
                      required
                    />
                  </LiyonField>

                  <LiyonField label={t("reservations.field.driverPhone")}>
                    <input
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="เช่น 081-234-5678"
                    />
                  </LiyonField>

                  <LiyonField label={t("reservations.field.assignedVehiclePlate")}>
                    <input
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={assignedVehiclePlate}
                      onChange={(e) => setAssignedVehiclePlate(e.target.value)}
                      placeholder="ทะเบียนรถที่จัดสรร"
                    />
                  </LiyonField>
                </>
              )}

              <LiyonField label={t("reservations.field.approvalNote")}>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="ข้อความถึงผู้ขอ (ถ้ามี)"
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setApproveTarget(null)}
              disabled={pending}
            >
              {t("reservations.btn.close")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "กำลังบันทึก..." : t("reservations.btn.approve")}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Reject Dialog */}
      <LiyonDialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        danger
      >
        <form onSubmit={handleRejectSubmit}>
          <LiyonDialogCloseButton label={t("reservations.btn.close")} />
          <LiyonDialogHeader
            title={t("reservations.dialog.rejectTitle")}
            description={`ปฏิเสธคำขอจอง ${rejectTarget?.bookingNo}`}
          />

          <LiyonDialogBody>
            <div className="space-y-4">
              <LiyonField label={t("reservations.field.rejectionReason")}>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-destructive"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="ระบุเหตุผลในการปฏิเสธ (อย่างน้อย 5 ตัวอักษร)"
                  required
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectTarget(null)}
              disabled={pending}
            >
              {t("reservations.btn.close")}
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "กำลังปฏิเสธ..." : t("reservations.btn.reject")}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
