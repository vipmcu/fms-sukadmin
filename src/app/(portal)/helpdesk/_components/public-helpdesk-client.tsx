"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Wrench,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Monitor,
  Droplets,
  Building,
  Sparkles,
} from "lucide-react";
import { createServiceTicketAction } from "@/features/maintenance/actions";
import { formatDate } from "@/shared/lib/format";
import { useLocale } from "@/shared/lib/i18n/client";
import type { ServiceCategoryDto, ServiceTicketDto } from "@/features/maintenance";

interface PublicHelpdeskClientProps {
  categories: ServiceCategoryDto[];
}

export function PublicHelpdeskClient({ categories }: PublicHelpdeskClientProps) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialAssetId = searchParams.get("assetId") || "";
  const initialLocation = searchParams.get("location") || "";

  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    categoryId: categories[0]?.id || "",
    title: "",
    description: "",
    location: initialLocation,
    priority: "MEDIUM" as ServiceTicketDto["priority"],
    assetId: initialAssetId || null,
    photoUrl: "",
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
  });

  const [submittedTicket, setSubmittedTicket] = useState<ServiceTicketDto | null>(null);

  const getCategoryIcon = (code: string) => {
    switch (code.toUpperCase()) {
      case "IT":
        return <Monitor className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case "ELE":
        return <Zap className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      case "PLUMB":
        return <Droplets className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case "BLDG":
        return <Building className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      default:
        return <Wrench className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await createServiceTicketAction({
          categoryId: formData.categoryId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
          priority: formData.priority,
          assetId: formData.assetId || undefined,
          photoUrl: formData.photoUrl.trim() || undefined,
          requesterName: formData.requesterName.trim(),
          requesterEmail: formData.requesterEmail.trim() || undefined,
          requesterPhone: formData.requesterPhone.trim(),
        });

        if (!res.ok) {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการส่งคำขอ");
          return;
        }

        toast.success("บันทึกคำขอแจ้งซ่อมเรียบร้อยแล้ว");
        setSubmittedTicket(res.data);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการส่งคำขอ");
      }
    });
  };

  if (submittedTicket) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="lingua-card rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 block">
              Ticket Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-light">
              เจ้าหน้าที่และช่างเทคนิคได้รับข้อมูลแล้ว และจะเร่งเข้าตรวจสอบตามมาตรฐาน SLA
            </p>
          </div>

          <div className="rounded-2xl bg-muted/40 p-6 border border-border/80 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <span className="text-xs text-muted-foreground">เลขที่ Ticket</span>
              <span className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {submittedTicket.ticketNo}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">หัวข้อปัญหา:</span>{" "}
                <span className="font-medium text-foreground">{submittedTicket.title}</span>
              </div>
              <div>
                <span className="text-muted-foreground">สถานที่:</span>{" "}
                <span className="font-medium text-foreground">{submittedTicket.location}</span>
              </div>
              <div>
                <span className="text-muted-foreground">ผู้แจ้ง:</span>{" "}
                <span className="font-medium text-foreground">{submittedTicket.requesterName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">เบอร์โทรศัพท์:</span>{" "}
                <span className="font-mono text-foreground">{submittedTicket.requesterPhone}</span>
              </div>
              {submittedTicket.slaDeadline && (
                <div className="col-span-2 pt-2 border-t border-border/80 mt-1">
                  <span className="text-muted-foreground">กำหนดเวลาแก้ไขตาม SLA: </span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatDate(submittedTicket.slaDeadline, locale, {
                      time: true,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSubmittedTicket(null);
                setFormData({
                  ...formData,
                  title: "",
                  description: "",
                });
              }}
              className="px-6 py-2.5 rounded-full border border-border/80 hover:bg-muted bg-card text-foreground text-xs font-medium transition-all"
            >
              แจ้งรายการอื่นเพิ่มเติม
            </button>
            <Link
              href={`/helpdesk/tracking?ticketNo=${submittedTicket.ticketNo}&phone=${submittedTicket.requesterPhone}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium tracking-wide shadow-md shadow-indigo-600/10 transition-all"
            >
              <Search className="h-3.5 w-3.5 text-amber-300" />
              <span>ติดตามสถานะงานซ่อม</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold tracking-[0.2em] uppercase mb-2">
            <Sparkles className="size-3 text-amber-500" />
            <span>Digital SLA Service Desk</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            ศูนย์แจ้งซ่อมและขอใช้บริการออนไลน์
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-light">
            แจ้งปัญหาขัดข้อง โสตทัศนูปกรณ์ คอมพิวเตอร์ ไฟฟ้า แอร์ ประปา และอาคารสถานที่
          </p>
        </div>

        <Link
          href="/helpdesk/tracking"
          aria-label="ติดตามสถานะที่เคยแจ้งไว้ (Track existing ticket)"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/80 hover:border-indigo-500/40 bg-card hover:bg-muted/60 text-foreground text-xs font-medium transition-all self-start sm:self-auto"
        >
          <Search className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>ติดตามสถานะที่เคยแจ้งไว้</span>
        </Link>
      </div>

      {/* Form Card */}
      <div className="lingua-card rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Categories Radio Cards */}
          <div className="space-y-3">
            <label id="category-group-label" className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              เลือกประเภทงานบริการ / หมวดหมู่ปัญหา *
            </label>
            <div role="radiogroup" aria-labelledby="category-group-label" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.categoryId === cat.id
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
                      : "border-border/80 bg-card hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="categoryId"
                    value={cat.id}
                    checked={formData.categoryId === cat.id}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="sr-only"
                    aria-label={cat.nameTh}
                  />
                  <div className="mb-2">{getCategoryIcon(cat.code)}</div>
                  <div className="text-sm font-semibold text-foreground">
                    {cat.nameTh}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-light mt-0.5">
                    SLA: {cat.defaultSlaHours} ชม.
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Issue Details */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="ticket-title" className="text-xs font-medium text-foreground">
                หัวข้อปัญหา / อาการผิดปกติที่พบ *
              </label>
              <input
                id="ticket-title"
                aria-label="หัวข้อปัญหา หรืออาการผิดปกติที่พบ"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="เช่น โปรเจกเตอร์ห้อง 301 ภาพไม่ออก หรือ เครื่องปรับอากาศไม่เย็น"
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-border/80 rounded-xl bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="ticket-location" className="text-xs font-medium text-foreground">
                  สถานที่เกิดปัญหา (อาคาร / ชั้น / ห้อง) *
                </label>
                <input
                  id="ticket-location"
                  aria-label="สถานที่เกิดปัญหา อาคาร ชั้น ห้อง"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="เช่น อาคารบริหาร ชั้น 4 ห้องบรรยาย 402"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-border/80 rounded-xl bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ticket-priority" className="text-xs font-medium text-foreground">
                  ระดับความเร่งด่วน *
                </label>
                <select
                  id="ticket-priority"
                  aria-label="ระดับความเร่งด่วน"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as ServiceTicketDto["priority"],
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-border/80 rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="CRITICAL">วิกฤต (กระทบการเรียนการสอน/สอบทันที)</option>
                  <option value="HIGH">สูง (กระทบการทำงานทั่วไป)</option>
                  <option value="MEDIUM">ปานกลาง (ใช้งานได้บางส่วน)</option>
                  <option value="LOW">ต่ำ (ปัญหาเล็กน้อย/ทั่วไป)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ticket-description" className="text-xs font-medium text-foreground">
                รายละเอียดเพิ่มเติมของอาการชำรุด *
              </label>
              <textarea
                id="ticket-description"
                aria-label="รายละเอียดเพิ่มเติมของอาการชำรุด"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="ระบุอาการ วันเวลาที่พบ หรือสภาพแวดล้อมที่เกี่ยวข้อง เพื่อให้ช่างเตรียมเครื่องมือได้ตรงจุด..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-border/80 rounded-xl bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ticket-photourl" className="text-xs font-medium text-foreground">
                รูปถ่ายจุดชำรุด (ลิงก์รูปภาพ หรือ Google Drive / Cloud URL)
              </label>
              <input
                id="ticket-photourl"
                aria-label="ลิงก์รูปถ่ายจุดชำรุด"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://... (หากมี)"
                className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono border border-border/80 rounded-xl bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* Requester Contact */}
          <div className="border-t border-border/80 pt-5 space-y-4">
            <h3 className="text-base font-bold text-foreground">
              ข้อมูลผู้แจ้งเรื่องเพื่อติดต่อกลับ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="requester-name" className="text-xs font-medium text-foreground">
                  ชื่อ-นามสกุล *
                </label>
                <input
                  id="requester-name"
                  aria-label="ชื่อ-นามสกุล ผู้แจ้งเรื่อง"
                  required
                  value={formData.requesterName}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  placeholder="เช่น อ.สมศักดิ์ รักสอน"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-border/80 rounded-xl bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="requester-phone" className="text-xs font-medium text-foreground">
                  เบอร์โทรศัพท์ติดต่อ *
                </label>
                <input
                  id="requester-phone"
                  aria-label="เบอร์โทรศัพท์ติดต่อ"
                  required
                  value={formData.requesterPhone}
                  onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono border border-border/80 rounded-xl bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="requester-email" className="text-xs font-medium text-foreground">
                  อีเมล *
                </label>
                <input
                  id="requester-email"
                  aria-label="อีเมลติดต่อ"
                  type="email"
                  required
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                  placeholder="email@faculty.edu"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-border/80 rounded-xl bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-light">
              <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>ข้อมูลจะถูกส่งเข้าคิวงานของช่างตาม SLA ทันที</span>
            </div>
            <button
              type="submit"
              disabled={isPending}
              aria-label="ส่งเรื่องแจ้งซ่อม (Submit maintenance request)"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium uppercase tracking-wider transition-all shadow-md shadow-indigo-600/10 w-full sm:w-auto justify-center"
            >
              {isPending ? "กำลังส่งคำขอ..." : "ส่งเรื่องแจ้งซ่อม"}
              <ArrowRight className="h-3.5 w-3.5 text-amber-300" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
