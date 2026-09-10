"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  CheckCircle2,
  Award,
  ArrowLeft,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill, type StatusPillTone } from "@/shared/components/liyon";
import { trackApplicationAction } from "@/features/admissions/actions";
import type { PublicApplicationStatusDto } from "@/features/admissions";

export function TrackingClient() {
  const searchParams = useSearchParams();
  const initialAppNo = searchParams.get("appNo") || "";
  const initialId = searchParams.get("id") || "";

  const [isPending, startTransition] = useTransition();
  const [nationalId, setNationalId] = useState(initialId);
  const [applicationNo, setApplicationNo] = useState(initialAppNo);
  const [result, setResult] = useState<PublicApplicationStatusDto | null>(null);
  const [searched, setSearched] = useState(false);

  const performSearch = (nid: string, appNo: string) => {
    if (!nid.trim() || !appNo.trim()) return;
    startTransition(async () => {
      try {
        const res = await trackApplicationAction(nid.trim(), appNo.trim());
        setSearched(true);
        if (res.ok && res.data) {
          setResult(res.data);
        } else {
          setResult(null);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error tracking application");
      }
    });
  };

  useEffect(() => {
    if (initialAppNo && initialId) {
      performSearch(initialId, initialAppNo);
    }
  }, [initialAppNo, initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalId.trim() || !applicationNo.trim()) {
      toast.error("กรุณากรอกเลขประจำตัวประชาชน และเลขที่ใบสมัคร");
      return;
    }
    performSearch(nationalId, applicationNo);
  };

  const getStatusTone = (status: PublicApplicationStatusDto["status"]): StatusPillTone => {
    switch (status) {
      case "SUBMITTED":
        return "warn";
      case "DOCS_APPROVED":
        return "info";
      case "DOCS_REJECTED":
        return "bad";
      case "INTERVIEW_ELIGIBLE":
        return "info";
      case "PASSED":
        return "ok";
      case "REJECTED":
        return "bad";
      case "CANCELLED":
        return "off";
      default:
        return "off";
    }
  };

  const getStatusLabel = (status: PublicApplicationStatusDto["status"]) => {
    switch (status) {
      case "SUBMITTED":
        return "รอตรวจสอบเอกสารหลักฐาน";
      case "DOCS_APPROVED":
        return "เอกสารผ่านการตรวจสอบแล้ว";
      case "DOCS_REJECTED":
        return "เอกสารไม่สมบูรณ์ (โปรดติดต่อเจ้าหน้าที่)";
      case "INTERVIEW_ELIGIBLE":
        return "มีสิทธิ์เข้าสอบสัมภาษณ์";
      case "PASSED":
        return "ผ่านการคัดเลือก (มีสิทธิ์เข้าศึกษา)";
      case "REJECTED":
        return "ไม่ผ่านการคัดเลือก";
      case "CANCELLED":
        return "สละสิทธิ์ / ยกเลิก";
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
            ติดตามสถานะใบสมัครออนไลน์
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ระบุเลขประจำตัวประชาชน และเลขที่ใบสมัครเพื่อตรวจสอบผล
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admissions">
            <ArrowLeft className="mr-1 h-4 w-4" />
            กลับ
          </Link>
        </Button>
      </div>

      {/* Search Box */}
      <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              เลขประจำตัวประชาชน 13 หลัก *
            </label>
            <input
              required
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
              placeholder="เลข 13 หลักที่ใช้ในการสมัคร"
              className="w-full px-3 py-2 text-sm font-mono border border-input rounded-md bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              เลขที่ใบสมัคร (Application No.) *
            </label>
            <input
              required
              value={applicationNo}
              onChange={(e) => setApplicationNo(e.target.value.trim().toUpperCase())}
              placeholder="เช่น APP-2568-XXXX"
              className="w-full px-3 py-2 text-sm font-mono uppercase border border-input rounded-md bg-background"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full gap-2 font-bold">
            <Search className="h-4 w-4" />
            {isPending ? "กำลังค้นหา..." : "ค้นหาสถานะใบสมัคร"}
          </Button>
        </form>
      </div>

      {/* Result Display */}
      {searched && !result && (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground space-y-2">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-500 opacity-80" />
          <div className="font-semibold text-foreground">ไม่พบข้อมูลใบสมัคร</div>
          <p className="text-xs max-w-sm mx-auto">
            โปรดตรวจสอบเลขประจำตัวประชาชน หรือเลขที่ใบสมัครให้ถูกต้องอีกครั้ง หากมีข้อสงสัยโปรดติดต่อฝ่ายรับสมัคร
          </p>
        </div>
      )}

      {result && (
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-2">
            <div>
              <span className="text-xs text-muted-foreground">เลขที่ใบสมัคร</span>
              <div className="font-mono text-xl font-bold text-primary">
                {result.applicationNo}
              </div>
            </div>
            <div>
              <StatusPill tone={getStatusTone(result.status)}>
                {getStatusLabel(result.status)}
              </StatusPill>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">ชื่อผู้สมัคร (PDPA Masked):</span>
              <div className="font-semibold text-foreground text-sm mt-0.5">
                {result.maskedName}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">รอบรับสมัคร:</span>
              <div className="font-medium text-foreground text-sm mt-0.5">
                {result.roundName}
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">สาขาวิชาที่สมัคร:</span>
              <div className="font-bold text-foreground text-sm mt-0.5">
                {result.programNameTh}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">วันที่ยื่นใบสมัคร:</span>
              <div className="font-mono text-foreground mt-0.5">
                {new Date(result.submittedAt).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">คะแนนการประเมิน:</span>
              <div className="font-mono font-bold text-foreground mt-0.5">
                {result.score !== null ? (
                  <span className="text-primary text-sm">{result.score} / 100</span>
                ) : (
                  <span className="text-muted-foreground">อยู่ระหว่างประเมิน</span>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-t pt-4 space-y-3">
            <span className="text-xs font-semibold text-muted-foreground">
              ไทม์ไลน์ความคืบหน้า:
            </span>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">ยื่นใบสมัครสำเร็จ</span>
                  <span className="text-muted-foreground ml-2">
                    ({new Date(result.submittedAt).toLocaleDateString("th-TH")})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    result.status !== "SUBMITTED"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">ตรวจสอบเอกสารหลักฐาน</span>
                  {result.status === "DOCS_REJECTED" && (
                    <span className="text-destructive font-semibold ml-2">เอกสารไม่สมบูรณ์</span>
                  )}
                  {result.status !== "SUBMITTED" && result.status !== "DOCS_REJECTED" && (
                    <span className="text-emerald-600 font-medium ml-2">ผ่านการตรวจสอบแล้ว</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    result.status === "PASSED"
                      ? "bg-emerald-100 text-emerald-600"
                      : result.status === "INTERVIEW_ELIGIBLE"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">ผลการคัดเลือก</span>
                  {result.status === "PASSED" && (
                    <span className="text-emerald-600 font-bold ml-2">ผ่านการคัดเลือก</span>
                  )}
                  {result.status === "REJECTED" && (
                    <span className="text-destructive font-semibold ml-2">ไม่ผ่านการคัดเลือก</span>
                  )}
                  {result.status === "INTERVIEW_ELIGIBLE" && (
                    <span className="text-indigo-600 font-semibold ml-2">มีสิทธิ์สัมภาษณ์</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
