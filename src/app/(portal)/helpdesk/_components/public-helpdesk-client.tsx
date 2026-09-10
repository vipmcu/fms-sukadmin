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
import type { ServiceCategoryDto, ServiceTicketDto } from "@/features/maintenance";

interface PublicHelpdeskClientProps {
  categories: ServiceCategoryDto[];
}

export function PublicHelpdeskClient({ categories }: PublicHelpdeskClientProps) {
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
        return <Monitor className="h-5 w-5 text-[#1e3328]" />;
      case "ELE":
        return <Zap className="h-5 w-5 text-[#c5a059]" />;
      case "PLUMB":
        return <Droplets className="h-5 w-5 text-[#1e3328]" />;
      case "BLDG":
        return <Building className="h-5 w-5 text-[#c5a059]" />;
      default:
        return <Wrench className="h-5 w-5 text-[#1e3328]" />;
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
        <div className="glass-card-elevate rounded-3xl border border-[#ded9cb] p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#c5a059] block">
              Ticket Confirmed
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#16251e]">
              ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว
            </h2>
            <p className="text-xs sm:text-sm text-[#55635c] font-light">
              เจ้าหน้าที่และช่างเทคนิคได้รับข้อมูลแล้ว และจะเร่งเข้าตรวจสอบตามมาตรฐาน SLA
            </p>
          </div>

          <div className="rounded-2xl bg-[#ede7dc]/60 p-6 border border-[#ded9cb]/80 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-[#ded9cb]/80 pb-3">
              <span className="text-xs text-[#55635c]">เลขที่ Ticket</span>
              <span className="font-mono text-xl font-bold text-[#1e3328]">
                {submittedTicket.ticketNo}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#55635c]">หัวข้อปัญหา:</span>{" "}
                <span className="font-medium text-[#16251e]">{submittedTicket.title}</span>
              </div>
              <div>
                <span className="text-[#55635c]">สถานที่:</span>{" "}
                <span className="font-medium text-[#16251e]">{submittedTicket.location}</span>
              </div>
              <div>
                <span className="text-[#55635c]">ผู้แจ้ง:</span>{" "}
                <span className="font-medium text-[#16251e]">{submittedTicket.requesterName}</span>
              </div>
              <div>
                <span className="text-[#55635c]">เบอร์โทรศัพท์:</span>{" "}
                <span className="font-mono text-[#16251e]">{submittedTicket.requesterPhone}</span>
              </div>
              {submittedTicket.slaDeadline && (
                <div className="col-span-2 pt-2 border-t border-[#ded9cb]/80 mt-1">
                  <span className="text-[#55635c]">กำหนดเวลาแก้ไขตาม SLA: </span>
                  <span className="font-medium text-emerald-700">
                    {new Date(submittedTicket.slaDeadline).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
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
              className="px-6 py-2.5 rounded-full border border-[#ded9cb] hover:bg-[#ede7dc] text-[#16251e] text-xs font-medium transition-all"
            >
              แจ้งรายการอื่นเพิ่มเติม
            </button>
            <Link
              href={`/helpdesk/tracking?ticketNo=${submittedTicket.ticketNo}&phone=${submittedTicket.requesterPhone}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1e3328] hover:bg-[#13221b] text-white text-xs font-medium tracking-wide shadow-md transition-all"
            >
              <Search className="h-3.5 w-3.5 text-[#c5a059]" />
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#ded9cb] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7f5ef] border border-[#c5a059]/40 text-[#16251e] text-[10px] font-semibold tracking-[0.2em] uppercase mb-2">
            <Sparkles className="size-3 text-[#c5a059]" />
            <span>Digital SLA Service Desk</span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-4xl font-normal tracking-tight text-[#16251e]">
            ศูนย์แจ้งซ่อมและขอใช้บริการออนไลน์
          </h1>
          <p className="text-xs sm:text-sm text-[#55635c] mt-1 font-light">
            แจ้งปัญหาขัดข้อง โสตทัศนูปกรณ์ คอมพิวเตอร์ ไฟฟ้า แอร์ ประปา และอาคารสถานที่
          </p>
        </div>

        <Link
          href="/helpdesk/tracking"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#ded9cb] hover:border-[#c5a059] hover:bg-[#ede7dc] text-[#16251e] text-xs font-medium transition-all self-start sm:self-auto"
        >
          <Search className="h-3.5 w-3.5 text-[#c5a059]" />
          <span>ติดตามสถานะที่เคยแจ้งไว้</span>
        </Link>
      </div>

      {/* Form Card */}
      <div className="glass-card-elevate rounded-3xl border border-[#ded9cb] p-6 sm:p-10 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Categories Radio Cards */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#16251e] uppercase tracking-wider block">
              เลือกประเภทงานบริการ / หมวดหมู่ปัญหา *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.categoryId === cat.id
                      ? "border-[#c5a059] bg-[#ede7dc]/80 ring-2 ring-[#c5a059]/30"
                      : "border-[#ded9cb] bg-[#f7f5ef] hover:bg-[#ede7dc]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="categoryId"
                    value={cat.id}
                    checked={formData.categoryId === cat.id}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="sr-only"
                  />
                  <div className="mb-2">{getCategoryIcon(cat.code)}</div>
                  <div className="font-serif-luxury text-sm text-[#16251e]">
                    {cat.nameTh}
                  </div>
                  <div className="text-[11px] text-[#55635c] font-light mt-0.5">
                    SLA: {cat.defaultSlaHours} ชม.
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Issue Details */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#16251e]">
                หัวข้อปัญหา / อาการผิดปกติที่พบ *
              </label>
              <input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="เช่น โปรเจกเตอร์ห้อง 301 ภาพไม่ออก หรือ เครื่องปรับอากาศไม่เย็น"
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-[#ded9cb] rounded-xl bg-[#f7f5ef] text-[#16251e] placeholder:text-[#55635c]/60 focus:outline-none focus:ring-2 focus:ring-[#1e3328]/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#16251e]">
                  สถานที่เกิดปัญหา (อาคาร / ชั้น / ห้อง) *
                </label>
                <input
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="เช่น อาคารบริหาร ชั้น 4 ห้องบรรยาย 402"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-[#ded9cb] rounded-xl bg-[#f7f5ef] text-[#16251e] placeholder:text-[#55635c]/60 focus:outline-none focus:ring-2 focus:ring-[#1e3328]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#16251e]">
                  ระดับความเร่งด่วน *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as ServiceTicketDto["priority"],
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-[#ded9cb] rounded-xl bg-[#f7f5ef] text-[#16251e] focus:outline-none focus:ring-2 focus:ring-[#1e3328]/30"
                >
                  <option value="CRITICAL">วิกฤต (กระทบการเรียนการสอน/สอบทันที)</option>
                  <option value="HIGH">สูง (กระทบการทำงานทั่วไป)</option>
                  <option value="MEDIUM">ปานกลาง (ใช้งานได้บางส่วน)</option>
                  <option value="LOW">ต่ำ (ปัญหาเล็กน้อย/ทั่วไป)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#16251e]">
                รายละเอียดเพิ่มเติมของอาการชำรุด *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="ระบุอาการ วันเวลาที่พบ หรือสภาพแวดล้อมที่เกี่ยวข้อง เพื่อให้ช่างเตรียมเครื่องมือได้ตรงจุด..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-[#ded9cb] rounded-xl bg-[#f7f5ef] text-[#16251e] placeholder:text-[#55635c]/60 focus:outline-none focus:ring-2 focus:ring-[#1e3328]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#16251e]">
                รูปถ่ายจุดชำรุด (ลิงก์รูปภาพ หรือ Google Drive / Cloud URL)
              </label>
              <input
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://... (หากมี)"
                className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono border border-[#ded9cb] rounded-xl bg-[#f7f5ef] text-[#16251e] placeholder:text-[#55635c]/60 focus:outline-none focus:ring-2 focus:ring-[#1e3328]/30"
              />
            </div>
          </div>

          {/* Requester Contact */}
          <div className="border-t border-[#ded9cb]/80 pt-5 space-y-4">
            <h3 className="font-serif-luxury text-base text-[#16251e]">
              ข้อมูลผู้แจ้งเรื่องเพื่อติดต่อกลับ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#16251e]">
                  ชื่อ-นามสกุล *
                </label>
                <input
                  required
                  value={formData.requesterName}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  placeholder="เช่น อ.สมศักดิ์ รักสอน"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-[#ded9cb] rounded-xl bg-[#f7f5ef] text-[#16251e] placeholder:text-[#55635c]/60 focus:outline-none focus:ring-2 focus:ring-[#1e3328]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#16251e]">
                  เบอร์โทรศัพท์ติดต่อ *
                </label>
                <input
                  required
                  value={formData.requesterPhone}
                  onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono border border-[#ded9cb] rounded-xl bg-[#f7f5ef] text-[#16251e] placeholder:text-[#55635c]/60 focus:outline-none focus:ring-2 focus:ring-[#1e3328]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#16251e]">
                  อีเมล *
                </label>
                <input
                  type="email"
                  required
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                  placeholder="email@faculty.edu"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-[#ded9cb] rounded-xl bg-[#f7f5ef] text-[#16251e] placeholder:text-[#55635c]/60 focus:outline-none focus:ring-2 focus:ring-[#1e3328]/30"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#ded9cb]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#55635c] flex items-center gap-1.5 font-light">
              <ShieldCheck className="h-4 w-4 text-[#c5a059]" />
              <span>ข้อมูลจะถูกส่งเข้าคิวงานของช่างตาม SLA ทันที</span>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#1e3328] hover:bg-[#13221b] text-white text-xs font-medium uppercase tracking-wider transition-all shadow-md w-full sm:w-auto justify-center"
            >
              {isPending ? "กำลังส่งคำขอ..." : "ส่งเรื่องแจ้งซ่อม"}
              <ArrowRight className="h-3.5 w-3.5 text-[#c5a059]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
