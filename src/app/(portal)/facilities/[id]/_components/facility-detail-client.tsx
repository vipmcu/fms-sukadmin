"use client";

import Link from "next/link";
import {
  DoorOpen,
  Car,
  Users,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck,
  Tv,
  Mic,
  Wifi,
  Video,
  FileSpreadsheet,
  AlertCircle,
  LogIn,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReservationResourceDto } from "@/features/reservations";

interface FacilityDetailClientProps {
  resource: ReservationResourceDto;
  isLoggedIn?: boolean;
}

export function FacilityDetailClient({ resource, isLoggedIn = false }: FacilityDetailClientProps) {
  const isRoom = resource.type === "ROOM";
  const amenities = (resource.amenities || {}) as Record<string, unknown>;
  const amenityKeys = Object.keys(amenities);

  // Amenity label & icon mapper
  const getAmenityInfo = (key: string, val: unknown) => {
    const k = key.toLowerCase();
    let label = key;
    let icon = <Check className="size-4 text-emerald-500" />;

    if (k.includes("projector") || k.includes("tv") || k.includes("screen")) {
      label = "โปรเจกเตอร์ / จอแสดงผล";
      icon = <Tv className="size-4 text-blue-500" />;
    } else if (k.includes("mic") || k.includes("sound") || k.includes("audio")) {
      label = "ระบบเสียงและไมโครโฟน";
      icon = <Mic className="size-4 text-amber-500" />;
    } else if (k.includes("video") || k.includes("zoom") || k.includes("conference")) {
      label = "ระบบประชุมทางไกล (VDO Conference)";
      icon = <Video className="size-4 text-purple-500" />;
    } else if (k.includes("wifi") || k.includes("internet")) {
      label = "เครือข่ายอินเทอร์เน็ตไร้สาย (Wi-Fi)";
      icon = <Wifi className="size-4 text-emerald-500" />;
    } else if (k.includes("board") || k.includes("whiteboard")) {
      label = "กระดานไวท์บอร์ด";
      icon = <FileSpreadsheet className="size-4 text-slate-500" />;
    } else if (k.includes("gps")) {
      label = "ระบบติดตาม GPS";
      icon = <CheckCircle2 className="size-4 text-emerald-500" />;
    } else if (k.includes("air") || k.includes("ac")) {
      label = "ระบบปรับอากาศ";
      icon = <CheckCircle2 className="size-4 text-cyan-500" />;
    }

    const valueStr = typeof val === "boolean" ? "" : `: ${String(val)}`;
    return { label: `${label}${valueStr}`, icon };
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/facilities"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>กลับไปยังแคตตาล็อกห้องและยานพาหนะ</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-primary/10 text-primary rounded-lg">
                {resource.code}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-muted text-muted-foreground rounded-lg">
                {isRoom ? "ห้องประชุม / สัมมนา" : "ยานพาหนะส่วนกลาง"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <CheckCircle2 className="size-3" />
                <span>พร้อมให้บริการ</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {resource.nameTh}
            </h1>
            <p className="text-sm text-muted-foreground font-medium">{resource.nameEn}</p>

            <div className="flex flex-wrap items-center gap-4 pt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="size-4 text-primary" />
                <span>
                  ความจุรองรับ: <strong className="text-foreground">{resource.capacity}</strong> {isRoom ? "ที่นั่ง" : "ที่นั่งโดยสาร"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4 text-primary" />
                <span>
                  {isRoom ? "ที่ตั้งห้อง:" : "ป้ายทะเบียน:"}{" "}
                  <strong className="text-foreground">{resource.locationOrPlate}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 self-start">
            {isRoom ? <DoorOpen className="size-10 sm:size-12" /> : <Car className="size-10 sm:size-12" />}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Specifications and Rules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Section */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3 shadow-xs">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>ข้อมูลและรายละเอียดการใช้งาน</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {resource.descriptionTh || "ไม่มีข้อมูลรายละเอียดเพิ่มเติมสำหรับทรัพยากรนี้"}
            </p>
            {resource.descriptionEn && (
              <p className="text-xs text-muted-foreground/80 italic pt-2 border-t border-border/50">
                {resource.descriptionEn}
              </p>
            )}
          </div>

          {/* Amenities & Equipment Section */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>สิ่งอำนวยความสะดวกและอุปกรณ์ประจำ</span>
            </h2>

            {amenityKeys.length === 0 ? (
              <p className="text-xs text-muted-foreground">ไม่พบรายการอุปกรณ์เฉพาะเจาะจง</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {amenityKeys.map((key) => {
                  const info = getAmenityInfo(key, amenities[key]);
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/40 text-xs font-medium text-foreground"
                    >
                      <div className="p-1 rounded-lg bg-background shadow-2xs shrink-0">
                        {info.icon}
                      </div>
                      <span className="truncate">{info.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reservation Rules & Policies */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <span>ระเบียบและข้อกำหนดการจองทรัพยากร</span>
            </h2>

            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>การจัดสรรเวลา (Buffer Time):</strong> ระบบจะเว้นช่วงเวลาทำความสะอาดและตรวจสอบความพร้อม 30 นาทีก่อนและหลังการใช้งานเสมอ
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>นโยบายการยกเลิก:</strong> ผู้จองสามารถยกเลิกคำขอได้ล่วงหน้าอย่างน้อย 2 ชั่วโมงก่อนเวลาเริ่มใช้งาน หากต่ำกว่า 2 ชั่วโมงกรุณาติดต่อเจ้าหน้าที่ดูแลโดยตรง
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>การพิจารณาอนุมัติ:</strong> คำขอจะได้รับการตรวจสอบและพิจารณาอนุมัติโดยเจ้าหน้าที่อาคารสถานที่/ยานพาหนะตามลำดับคิว
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Reservation Call to Action Box */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-6 sticky top-24">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-foreground">ต้องการจองใช้งาน?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                คณาจารย์และบุคลากรสามารถเข้าสู่ระบบ Admin Console เพื่อส่งคำขอจองและระบุรายละเอียดการใช้งาน
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {isLoggedIn ? (
                <Button asChild size="lg" className="w-full gap-2 font-semibold shadow-sm">
                  <Link href={`/reservations/calendar?resourceId=${resource.id}`}>
                    <Calendar className="size-4" />
                    <span>ดำเนินการจองห้องนี้ทันที</span>
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="w-full gap-2 font-semibold shadow-sm">
                  <Link href={`/login?callbackUrl=/reservations/calendar?resourceId=${resource.id}`}>
                    <LogIn className="size-4" />
                    <span>เข้าสู่ระบบเพื่อจอง</span>
                  </Link>
                </Button>
              )}

              <Button asChild variant="outline" size="default" className="w-full gap-2">
                <Link href="/facilities/schedule">
                  <Calendar className="size-4" />
                  <span>ดูตารางการใช้งานประจำวัน</span>
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                สอบถามข้อมูลเพิ่มเติม
              </span>
              <p className="text-xs text-muted-foreground">
                งานบริหารอาคารสถานที่และยานพาหนะ
                <br />
                คณะวิทยาการจัดการ
                <br />
                โทรศัพท์ภายใน: 02-xxx-xxxx ต่อ 1234
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
