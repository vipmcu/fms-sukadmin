"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Ban, Calendar } from "lucide-react";
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
import { BookingCreateDialog } from "../../_components/booking-create-dialog";
import { cancelReservationAction } from "@/features/reservations/actions";
import type { ReservationDto, ReservationResourceDto } from "@/features/reservations";

interface MyBookingsClientProps {
  initialBookings: ReservationDto[];
  resources: ReservationResourceDto[];
  canApprove: boolean;
  canManage: boolean;
}

export function MyBookingsClient({
  initialBookings,
  resources,
  canApprove,
  canManage,
}: MyBookingsClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<ReservationDto | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [now] = useState(() => Date.now());

  const getStatusTone = (status: string): StatusPillTone => {
    switch (status) {
      case "APPROVED":
        return "ok";
      case "PENDING":
        return "warn";
      case "REJECTED":
      case "CANCELLED":
        return "bad";
      default:
        return "off";
    }
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget) return;

    startTransition(async () => {
      const res = await cancelReservationAction({
        id: cancelTarget.id,
        cancellationReason: cancelReason || undefined,
      });

      if (res.ok) {
        toast.success(t("reservations.msg.cancelSuccess"));
        setCancelTarget(null);
        setCancelReason("");
        router.refresh();
      } else {
        toast.error(res.error?.message || t("reservations.err.cancelTooLate"));
      }
    });
  };

  const isCancellable = (booking: ReservationDto) => {
    if (booking.status !== "PENDING" && booking.status !== "APPROVED") return false;
    const twoHoursMs = 2 * 60 * 60 * 1000;
    return new Date(booking.startTime).getTime() - now >= twoHoursMs;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("reservations.tab.my")}</h1>
          <p className="text-muted-foreground text-sm">ติดตามสถานะและประวัติการยื่นคำขอจองห้องและรถยนต์ของคุณ</p>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 shrink-0">
          <Plus className="size-4" />
          <span>{t("reservations.btn.create")}</span>
        </Button>
      </div>

      <ReservationsNav canApprove={canApprove} canManage={canManage} />

      {initialBookings.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card">
          <Calendar className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-base font-semibold">{t("reservations.msg.empty")}</h3>
          <p className="text-sm text-muted-foreground mt-1">คุณยังไม่มีรายการจองห้องประชุมหรือยานพาหนะ</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">{t("reservations.field.bookingNo")}</th>
                  <th className="px-4 py-3">{t("reservations.field.resource")}</th>
                  <th className="px-4 py-3">{t("reservations.field.title")}</th>
                  <th className="px-4 py-3">วันและเวลาที่ใช้งาน</th>
                  <th className="px-4 py-3">{t("reservations.field.status")}</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {initialBookings.map((b) => {
                  const s = new Date(b.startTime);
                  const e = new Date(b.endTime);
                  const cancellable = isCancellable(b);

                  return (
                    <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-medium text-muted-foreground">
                        {b.bookingNo}
                      </td>
                      <td className="px-4 py-3.5 font-medium">
                        <div>{b.resourceNameTh}</div>
                        <div className="text-xs text-muted-foreground">{b.locationOrPlate}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">{b.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{b.purpose}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <div>{formatDate(s, locale)}</div>
                        <div>{s.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} - {e.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusPill tone={getStatusTone(b.status)}>
                          {t(`reservations.status.${b.status.toLowerCase()}` as Parameters<typeof t>[0])}
                        </StatusPill>
                        {b.driverName && (
                          <div className="text-[11px] text-primary mt-1">คนขับ: {b.driverName}</div>
                        )}
                        {b.cancellationReason && (
                          <div className="text-[11px] text-destructive mt-1">เหตุผล: {b.cancellationReason}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {cancellable ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCancelTarget(b)}
                            className="gap-1.5 h-8 text-xs"
                          >
                            <Ban className="size-3.5" />
                            <span>{t("reservations.btn.cancel")}</span>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancellation Dialog */}
      <LiyonDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        danger
      >
        <form onSubmit={handleCancelSubmit}>
          <LiyonDialogCloseButton label={t("reservations.btn.close")} />
          <LiyonDialogHeader
            title={t("reservations.dialog.cancelTitle")}
            description={t("reservations.dialog.cancelConfirm")}
          />

          <LiyonDialogBody>
            <div className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                <div><strong>เลขที่คำขอ:</strong> {cancelTarget?.bookingNo}</div>
                <div><strong>ทรัพยากร:</strong> {cancelTarget?.resourceNameTh}</div>
                <div><strong>หัวข้อ:</strong> {cancelTarget?.title}</div>
              </div>

              <LiyonField label={t("reservations.field.cancellationReason")}>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-destructive"
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="ระบุเหตุผลการยกเลิก (ถ้ามี)"
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelTarget(null)}
              disabled={pending}
            >
              {t("reservations.btn.close")}
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "กำลังยกเลิก..." : t("reservations.btn.cancel")}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      <BookingCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        resources={resources}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
