"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users as UsersIcon, Car, DoorOpen } from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import { StatusPill, type StatusPillTone } from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { ReservationsNav } from "../../_components/reservations-nav";
import { BookingCreateDialog } from "../../_components/booking-create-dialog";
import type { ReservationDto, ReservationResourceDto } from "@/features/reservations";

interface CalendarClientProps {
  initialReservations: ReservationDto[];
  resources: ReservationResourceDto[];
  canApprove: boolean;
  canManage: boolean;
  canCreate: boolean;
}

export function CalendarClient({
  initialReservations,
  resources,
  canApprove,
  canManage,
  canCreate,
}: CalendarClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();

  const [typeFilter, setTypeFilter] = useState<"ALL" | "ROOM" | "VEHICLE">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = initialReservations.filter((item) => {
    if (typeFilter !== "ALL" && item.resourceType !== typeFilter) return false;
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

  const formatTimeRange = (startStr: string, endStr: string) => {
    const s = new Date(startStr);
    const e = new Date(endStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    const datePart = formatDate(s, locale);
    const timePart = `${pad(s.getHours())}:${pad(s.getMinutes())} - ${pad(e.getHours())}:${pad(e.getMinutes())} น.`;
    return { datePart, timePart };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("reservations.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("reservations.subtitle")}</p>
        </div>

        {canCreate && (
          <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
            <Plus className="size-4" />
            <span>{t("reservations.btn.create")}</span>
          </Button>
        )}
      </div>

      <ReservationsNav canApprove={canApprove} canManage={canManage} />

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/30 border border-border rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">ประเภท:</span>
          {(["ALL", "ROOM", "VEHICLE"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                typeFilter === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground border border-input"
              }`}
            >
              {type === "ALL" ? "ทั้งหมด" : type === "ROOM" ? t("reservations.type.room") : t("reservations.type.vehicle")}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">สถานะ:</span>
          {(["ALL", "APPROVED", "PENDING"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground border border-input"
              }`}
            >
              {st === "ALL" ? "ทั้งหมด" : st === "APPROVED" ? t("reservations.status.approved") : t("reservations.status.pending")}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List / Schedule View */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card">
          <CalendarIcon className="size-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-base font-semibold">{t("reservations.msg.empty")}</h3>
          <p className="text-sm text-muted-foreground mt-1">ยังไม่มีรายการจองตามเงื่อนไขที่เลือก</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const { datePart, timePart } = formatTimeRange(item.startTime, item.endTime);
            const isRoom = item.resourceType === "ROOM";

            return (
              <div
                key={item.id}
                className="p-5 bg-card border border-border rounded-xl shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        {isRoom ? <DoorOpen className="size-4" /> : <Car className="size-4" />}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-primary block">
                          {item.resourceNameTh}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.bookingNo}
                        </span>
                      </div>
                    </div>
                    <StatusPill tone={getStatusTone(item.status)}>
                      {t(`reservations.status.${item.status.toLowerCase()}` as Parameters<typeof t>[0])}
                    </StatusPill>
                  </div>

                  <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                    {item.purpose}
                  </p>

                  <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{datePart} • {timePart}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{item.locationOrPlate} {item.destination ? `➔ ${item.destination}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{item.attendeesCount} คน (ผู้ขอ: {item.requesterName})</span>
                    </div>
                    {item.driverName && (
                      <div className="flex items-center gap-2 text-primary">
                        <Car className="size-3.5 shrink-0" />
                        <span>พลขับ: {item.driverName} {item.driverPhone ? `(${item.driverPhone})` : ""}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BookingCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resources={resources}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
