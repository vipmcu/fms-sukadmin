"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, Clock, DoorOpen, Car, ArrowLeft, ShieldCheck, LogIn } from "lucide-react";
import { StatusPill, type StatusPillTone } from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/shared/lib/format";
import { useLocale } from "@/shared/lib/i18n/client";
import type { PublicScheduleDto } from "@/features/reservations";

interface PublicScheduleClientProps {
  initialSchedules: PublicScheduleDto[];
}

export function PublicScheduleClient({ initialSchedules }: PublicScheduleClientProps) {
  const locale = useLocale();
  const [filterType, setFilterType] = useState<"ALL" | "ROOM" | "VEHICLE">("ALL");

  const filtered = initialSchedules.filter((item) => {
    if (filterType !== "ALL" && item.resourceType !== filterType) return false;
    return true;
  });

  const getStatusTone = (status: string): StatusPillTone => {
    return status === "APPROVED" ? "ok" : "warn";
  };

  const formatScheduleTime = (startStr: string, endStr: string) => {
    const s = new Date(startStr);
    const e = new Date(endStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = formatDate(s, locale);
    const timeStr = `${pad(s.getHours())}:${pad(s.getMinutes())} - ${pad(e.getHours())}:${pad(e.getMinutes())} น.`;
    return { dateStr, timeStr };
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <Link
            href="/facilities"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium mb-1"
          >
            <ArrowLeft className="size-3.5" />
            <span>กลับหน้าแคตตาล็อก</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            ตารางการใช้งานห้องประชุมและยานพาหนะประจำวัน
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            ตารางการจองส่วนกลางสำหรับตรวจสอบความพร้อมใช้งาน (อัปเดตแบบ Real-time)
          </p>
        </div>

        <Button asChild size="sm" className="gap-2 shrink-0">
          <Link href="/login?callbackUrl=/reservations/calendar">
            <LogIn className="size-4" />
            <span>เข้าสู่ระบบเพื่อจอง</span>
          </Link>
        </Button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 bg-muted/40 border border-border/80 rounded-xl flex items-center gap-3 text-xs text-muted-foreground">
        <ShieldCheck className="size-5 text-primary shrink-0" />
        <div>
          <strong className="text-foreground">นโยบายความคุ้มครองข้อมูลส่วนบุคคล (Privacy Masking):</strong> หน้านี้แสดงเฉพาะหัวข้องานและช่วงเวลาเพื่ออำนวยความสะดวกในการตรวจสอบช่วงเวลาว่าง โดยระบบจะปิดบังชื่อผู้ขอจอง เบอร์โทรศัพท์ และรายละเอียดภารกิจภายใน
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(["ALL", "ROOM", "VEHICLE"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterType === type
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {type === "ALL" ? "ทั้งหมด" : type === "ROOM" ? "เฉพาะห้องประชุม" : "เฉพาะยานพาหนะ"}
          </button>
        ))}
      </div>

      {/* Schedule Items */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-border rounded-2xl bg-card">
          <CalendarIcon className="size-10 mx-auto text-muted-foreground mb-3 opacity-40" />
          <h3 className="text-base font-semibold">ไม่มีรายการใช้งานในช่วงนี้</h3>
          <p className="text-xs text-muted-foreground mt-1">ห้องประชุมและยานพาหนะทั้งหมดพร้อมให้จองใช้งาน</p>
        </div>
      ) : (
        <div className="border border-border rounded-2xl bg-card overflow-hidden divide-y divide-border">
          {filtered.map((item) => {
            const { dateStr, timeStr } = formatScheduleTime(item.startTime, item.endTime);
            const isRoom = item.resourceType === "ROOM";

            return (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/15 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                    {isRoom ? <DoorOpen className="size-5" /> : <Car className="size-5" />}
                  </span>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-primary">
                        {item.resourceNameTh}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({item.locationOrPlate})
                      </span>
                      <StatusPill tone={getStatusTone(item.status)}>
                        {item.status === "APPROVED" ? "อนุมัติแล้ว" : "อยู่ระหว่างพิจารณา"}
                      </StatusPill>
                    </div>

                    <h3 className="text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 pl-11 md:pl-0">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 font-medium">
                    <Clock className="size-3.5 text-primary" />
                    <span>{dateStr} • {timeStr}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
