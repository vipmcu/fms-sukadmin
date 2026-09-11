"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  Wrench,
  CheckCircle2,
  UserCheck,
  MapPin,
  AlertCircle,
  ArrowLeft,
  Star,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill, type StatusPillTone } from "@/shared/components/liyon";
import { trackTicketAction, rateTicketAction } from "@/features/maintenance/actions";
import { formatDate } from "@/shared/lib/format";
import { useLocale } from "@/shared/lib/i18n/client";
import type { ServiceTicketDto } from "@/features/maintenance";

export function HelpdeskTrackingClient() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialTicketNo = searchParams.get("ticketNo") || "";
  const initialPhone = searchParams.get("phone") || "";

  const [isPending, startTransition] = useTransition();
  const [ticketNo, setTicketNo] = useState(initialTicketNo);
  const [phone, setPhone] = useState(initialPhone);
  const [ticket, setTicket] = useState<ServiceTicketDto | null>(null);
  const [searched, setSearched] = useState(false);

  // Rating State
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [isRatingPending, startRatingTransition] = useTransition();

  const performSearch = (tNo: string, ph: string) => {
    if (!tNo.trim() || !ph.trim()) return;
    startTransition(async () => {
      try {
        const res = await trackTicketAction(tNo.trim(), ph.trim());
        setSearched(true);
        if (res.ok && res.data) {
          setTicket(res.data);
        } else {
          setTicket(null);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error tracking ticket");
      }
    });
  };

  useEffect(() => {
    if (initialTicketNo && initialPhone) {
      performSearch(initialTicketNo, initialPhone);
    }
  }, [initialTicketNo, initialPhone]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNo.trim() || !phone.trim()) {
      toast.error("กรุณากรอกเลขที่ Ticket และเบอร์โทรศัพท์");
      return;
    }
    performSearch(ticketNo, phone);
  };

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    startRatingTransition(async () => {
      try {
        const res = await rateTicketAction({
          ticketId: ticket.id,
          score: ratingScore,
          feedback: ratingFeedback.trim() || null,
        });

        if (res.ok) {
          toast.success("ขอบพระคุณสำหรับการประเมินความพึงพอใจ!");
          setTicket({
            ...ticket,
            rating: res.data,
          });
        } else {
          toast.error(res.error.message);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error submitting rating");
      }
    });
  };

  const getStatusTone = (status: ServiceTicketDto["status"]): StatusPillTone => {
    switch (status) {
      case "OPEN":
        return "warn";
      case "ASSIGNED":
        return "info";
      case "IN_PROGRESS":
        return "info";
      case "WAITING_PARTS":
        return "warn";
      case "RESOLVED":
        return "ok";
      case "CANCELLED":
        return "off";
      default:
        return "off";
    }
  };

  const getStatusLabel = (status: ServiceTicketDto["status"]) => {
    switch (status) {
      case "OPEN":
        return "รับเรื่องแล้ว (รอดำเนินการ)";
      case "ASSIGNED":
        return "มอบหมายช่างเทคนิคแล้ว";
      case "IN_PROGRESS":
        return "กำลังดำเนินการตรวจสอบ/ซ่อม";
      case "WAITING_PARTS":
        return "รออะไหล่ / อุปกรณ์เสริม";
      case "RESOLVED":
        return "ซ่อมแซมแก้ไขเสร็จสิ้น";
      case "CANCELLED":
        return "ยกเลิกคำขอ";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            ติดตามสถานะงานแจ้งซ่อม
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ระบุเลขที่ Ticket และเบอร์โทรศัพท์ที่ใช้ในการแจ้ง
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/helpdesk" aria-label="กลับสู่หน้าระบบแจ้งซ่อม (Back to Helpdesk)">
            <ArrowLeft className="mr-1 h-4 w-4" />
            กลับ
          </Link>
        </Button>
      </div>

      {/* Search Card */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="ticket-no" className="text-xs font-semibold text-foreground">
              เลขที่ใบแจ้งซ่อม (Ticket No.) *
            </label>
            <input
              id="ticket-no"
              aria-label="เลขที่ใบแจ้งซ่อม (Ticket No.)"
              required
              value={ticketNo}
              onChange={(e) => setTicketNo(e.target.value.trim().toUpperCase())}
              placeholder="เช่น SR-202609-0001"
              className="w-full px-3 py-2 text-sm font-mono uppercase border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="requester-phone" className="text-xs font-semibold text-foreground">
              เบอร์โทรศัพท์ที่ใช้แจ้งเรื่อง *
            </label>
            <input
              id="requester-phone"
              aria-label="เบอร์โทรศัพท์ที่ใช้แจ้งเรื่อง"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="08X-XXX-XXXX"
              className="w-full px-3 py-2 text-sm font-mono border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full gap-2 font-bold" aria-label="ค้นหางานแจ้งซ่อม (Search ticket)">
            <Search className="h-4 w-4" />
            {isPending ? "กำลังค้นหา..." : "ค้นหางานแจ้งซ่อม"}
          </Button>
        </form>
      </div>

      {/* No Result */}
      {searched && !ticket && (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground space-y-2">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-500 opacity-80" />
          <div className="font-semibold text-foreground">ไม่พบข้อมูลใบแจ้งซ่อม</div>
          <p className="text-xs max-w-sm mx-auto">
            โปรดตรวจสอบเลขที่ Ticket หรือเบอร์โทรศัพท์ให้ถูกต้อง หรือติดต่อศูนย์บริการหากต้องการความช่วยเหลือ
          </p>
        </div>
      )}

      {/* Result Card */}
      {ticket && (
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-2">
            <div>
              <span className="text-xs text-muted-foreground">เลขที่ Ticket</span>
              <div className="font-mono text-xl font-bold text-primary">
                {ticket.ticketNo}
              </div>
            </div>
            <div>
              <StatusPill tone={getStatusTone(ticket.status)}>
                {getStatusLabel(ticket.status)}
              </StatusPill>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground">หัวข้อปัญหา:</span>
              <div className="font-bold text-foreground text-sm mt-0.5">{ticket.title}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground">หมวดหมู่งาน:</span>
                <div className="font-medium text-foreground">{ticket.categoryNameTh}</div>
              </div>
              <div>
                <span className="text-muted-foreground">สถานที่:</span>
                <div className="font-medium text-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {ticket.location}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">ช่างผู้รับผิดชอบ:</span>
                <div className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  {ticket.assignedTechnicianName || "อยู่ระหว่างจัดสรรช่าง"}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">วันที่แจ้งเรื่อง:</span>
                <div className="font-mono text-foreground mt-0.5">
                  {formatDate(ticket.createdAt, locale, { time: true })}
                </div>
              </div>
            </div>

            {ticket.resolutionNotes && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 p-3.5 text-xs space-y-1">
                <div className="font-semibold text-emerald-800 dark:text-emerald-200">
                  สรุปผลการแก้ไขจากช่างเทคนิค:
                </div>
                <div className="text-emerald-700 dark:text-emerald-300">
                  {ticket.resolutionNotes}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="border-t pt-4 space-y-3">
            <span className="text-xs font-semibold text-muted-foreground">
              ลำดับขั้นตอนการดำเนินงาน:
            </span>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">รับเรื่องแจ้งซ่อมเข้าสู่ระบบ</span>
                  <span className="text-muted-foreground ml-2">
                    ({formatDate(ticket.createdAt, locale)})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    ticket.status !== "OPEN"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">จ่ายงานและมอบหมายช่าง</span>
                  {ticket.assignedTechnicianName && (
                    <span className="text-muted-foreground ml-2">
                      ({ticket.assignedTechnicianName})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    ticket.status === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-600"
                      : ticket.status === "IN_PROGRESS" || ticket.status === "WAITING_PARTS"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">ดำเนินการแก้ไขปัญหา</span>
                  {ticket.status === "WAITING_PARTS" && (
                    <span className="text-amber-600 font-medium ml-2">รออะไหล่</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    ticket.status === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">ปิดงานซ่อมเรียบร้อย</span>
                  {ticket.resolvedAt && (
                    <span className="text-emerald-600 ml-2">
                      ({formatDate(ticket.resolvedAt, locale)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rating Section (Visible when resolved) */}
          {ticket.status === "RESOLVED" && (
            <div className="border-t pt-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                การประเมินความพึงพอใจการให้บริการ
              </h3>

              {ticket.rating ? (
                <div className="rounded-2xl bg-muted/40 p-4 space-y-2 text-xs border">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= ticket.rating!.score
                            ? "text-amber-500 fill-amber-500"
                            : "text-neutral-300"
                        }`}
                      />
                    ))}
                    <span className="font-bold text-foreground ml-2">
                      {ticket.rating.score} / 5 ดาว
                    </span>
                  </div>
                  {ticket.rating.feedback && (
                    <p className="text-muted-foreground italic">
                      &ldquo;{ticket.rating.feedback}&rdquo;
                    </p>
                  )}
                  <div className="text-[10px] text-muted-foreground">
                    ประเมินเมื่อ: {formatDate(ticket.rating.createdAt, locale)}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRateSubmit} className="space-y-3 bg-muted/20 p-4 rounded-2xl border">
                  <div className="text-xs text-muted-foreground">
                    โปรดให้คะแนนความพึงพอใจในการให้บริการของเจ้าหน้าที่
                  </div>

                  {/* 5-star picker */}
                  <div className="flex items-center gap-2" role="group" aria-label="ให้คะแนนความพึงพอใจ 1 ถึง 5 ดาว">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setRatingScore(score)}
                        aria-label={`ให้คะแนน ${score} ดาว จาก 5 ดาว`}
                        aria-pressed={ratingScore === score}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            score <= ratingScore ? "fill-amber-500" : "text-neutral-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-foreground ml-2">
                      {ratingScore} จาก 5 ดาว
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="rating-feedback" className="text-xs font-semibold text-muted-foreground">
                      ข้อเสนอแนะเพิ่มเติม (ถ้ามี)
                    </label>
                    <textarea
                      id="rating-feedback"
                      aria-label="ข้อเสนอแนะเพิ่มเติมสำหรับการให้บริการ"
                      rows={2}
                      value={ratingFeedback}
                      onChange={(e) => setRatingFeedback(e.target.value)}
                      placeholder="เช่น ช่างมาไว สุภาพ ซ่อมได้เรียบร้อยดีมาก"
                      className="w-full px-3 py-1.5 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <Button type="submit" disabled={isRatingPending} size="sm" className="gap-1.5" aria-label="ส่งการประเมินความพึงพอใจ">
                    <Send className="h-3.5 w-3.5" />
                    {isRatingPending ? "กำลังบันทึก..." : "ส่งการประเมิน"}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
