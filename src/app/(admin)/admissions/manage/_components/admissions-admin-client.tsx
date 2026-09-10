"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  GraduationCap,
  Users,
  Search,
  Calendar,
  CheckCircle2,
  FileText,
  Download,
  Plus,
  Award,
  Clock,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StatusPill,
  type StatusPillTone,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import {
  createAdmissionRoundAction,
  reviewStudentApplicationAction,
} from "@/features/admissions/actions";
import type {
  AdmissionRoundDto,
  StudentApplicationDto,
} from "@/features/admissions";
import type { AcademicProgramDto } from "@/features/curriculum";

interface AdmissionsAdminClientProps {
  rounds: AdmissionRoundDto[];
  initialApplications: StudentApplicationDto[];
  programs: AcademicProgramDto[];
  canManage: boolean;
  canReview: boolean;
  canScore: boolean;
  canExport: boolean;
}

export function AdmissionsAdminClient({
  rounds,
  initialApplications,
  programs,
  canManage,
  canReview,
  canScore,
  canExport,
}: AdmissionsAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"APPLICATIONS" | "ROUNDS">("APPLICATIONS");
  const [applications, setApplications] = useState<StudentApplicationDto[]>(initialApplications);
  const [roundsList, setRoundsList] = useState<AdmissionRoundDto[]>(rounds);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedRound, setSelectedRound] = useState<string>("ALL");
  const [selectedProgram, setSelectedProgram] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Review Dialog State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<StudentApplicationDto | null>(null);
  const [reviewForm, setReviewForm] = useState({
    status: "DOCS_APPROVED" as StudentApplicationDto["status"],
    score: "",
    comment: "",
  });

  // Create Round Dialog State
  const [isRoundOpen, setIsRoundOpen] = useState(false);
  const [roundForm, setRoundForm] = useState(() => ({
    academicYear: 2568,
    roundName: "TCAS 1 แฟ้มสะสมผลงาน (Portfolio)",
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    announcementDate: "2026-11-15",
    isActive: true,
    quotas: programs.map((p) => ({
      programId: p.id,
      programName: p.nameTh,
      seats: 30,
      tuitionFee: 25000,
    })),
  }));

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const matchSearch =
      search === "" ||
      app.applicationNo.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantNameTh.toLowerCase().includes(search.toLowerCase()) ||
      app.nationalId.includes(search) ||
      (app.schoolName && app.schoolName.toLowerCase().includes(search.toLowerCase()));

    const matchRound = selectedRound === "ALL" || app.roundId === selectedRound;
    const matchProgram = selectedProgram === "ALL" || app.programId === selectedProgram;
    const matchStatus = selectedStatus === "ALL" || app.status === selectedStatus;

    return matchSearch && matchRound && matchProgram && matchStatus;
  });

  // Metrics
  const totalApps = applications.length;
  const pendingDocs = applications.filter((a) => a.status === "SUBMITTED").length;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW_ELIGIBLE").length;
  const passedCount = applications.filter((a) => a.status === "PASSED").length;

  const getStatusTone = (status: StudentApplicationDto["status"]): StatusPillTone => {
    switch (status) {
      case "DRAFT":
        return "off";
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

  const getStatusLabel = (status: StudentApplicationDto["status"]) => {
    switch (status) {
      case "DRAFT":
        return "ฉบับร่าง";
      case "SUBMITTED":
        return "รอตรวจหลักฐาน";
      case "DOCS_APPROVED":
        return "เอกสารผ่านแล้ว";
      case "DOCS_REJECTED":
        return "เอกสารไม่สมบูรณ์";
      case "INTERVIEW_ELIGIBLE":
        return "มีสิทธิ์สัมภาษณ์";
      case "PASSED":
        return "ผ่านการคัดเลือก";
      case "REJECTED":
        return "ไม่ผ่านการคัดเลือก";
      case "CANCELLED":
        return "สละสิทธิ์ / ยกเลิก";
      default:
        return status;
    }
  };

  const handleOpenReview = (app: StudentApplicationDto) => {
    setSelectedApp(app);
    setReviewForm({
      status: app.status === "SUBMITTED" ? "DOCS_APPROVED" : app.status,
      score: app.score !== null ? String(app.score) : "",
      comment: app.reviewerComment || "",
    });
    setIsReviewOpen(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    startTransition(async () => {
      try {
        const res = await reviewStudentApplicationAction({
          id: selectedApp.id,
          status: reviewForm.status,
          score: reviewForm.score ? Number(reviewForm.score) : null,
          reviewerComment: reviewForm.comment || null,
        });

        if (res.ok) {
          toast.success("บันทึกผลการตรวจสอบและให้คะแนนสำเร็จ");
          setApplications((prev) =>
            prev.map((a) => (a.id === selectedApp.id ? res.data : a))
          );
          setIsReviewOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error reviewing application");
      }
    });
  };

  const handleCreateRound = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await createAdmissionRoundAction({
          academicYear: Number(roundForm.academicYear),
          roundName: roundForm.roundName,
          startDate: new Date(roundForm.startDate).toISOString(),
          endDate: new Date(roundForm.endDate).toISOString(),
          announcementDate: roundForm.announcementDate
            ? new Date(roundForm.announcementDate).toISOString()
            : null,
          isActive: roundForm.isActive,
          quotas: roundForm.quotas.map((q) => ({
            programId: q.programId,
            quotaSeats: Number(q.seats),
            tuitionFee: q.tuitionFee ? Number(q.tuitionFee) : null,
            criteriaTh: null,
          })),
        });

        if (res.ok) {
          toast.success("เปิดรอบการรับสมัครใหม่สำเร็จ");
          setRoundsList((prev) => [res.data, ...prev]);
          setIsRoundOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error creating round");
      }
    });
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        "เลขที่ใบสมัคร",
        "รอบรับสมัคร",
        "สาขาวิชา",
        "ชื่อ-นามสกุล",
        "เลขบัตรประชาชน",
        "เบอร์โทร",
        "อีเมล",
        "โรงเรียน",
        "GPAX",
        "สถานะ",
        "คะแนน",
        "วันที่สมัคร",
      ];

      const rows = filteredApps.map((a) => [
        `"${a.applicationNo}"`,
        `"${a.roundName}"`,
        `"${a.programNameTh}"`,
        `"${a.applicantNameTh}"`,
        `"'${a.nationalId}"`,
        `"${a.phone}"`,
        `"${a.email}"`,
        `"${a.schoolName || "-"}"`,
        `"${a.gpax ?? "-"}"`,
        `"${getStatusLabel(a.status)}"`,
        `"${a.score ?? "-"}"`,
        `"${new Date(a.createdAt).toLocaleDateString("th-TH")}"`,
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `admissions_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("ส่งออกข้อมูล CSV สำเร็จ");
    } catch {
      toast.error("เกิดข้อผิดพลาดในการส่งออกไฟล์ CSV");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ระบบบริหารจัดการรับสมัครนิสิตใหม่
          </h1>
          <p className="text-sm text-muted-foreground">
            จัดการรอบรับสมัคร ตรวจสอบคุณสมบัติและหลักฐานผู้สมัคร บันทึกคะแนนสัมภาษณ์ และส่งออกข้อมูล
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canExport && (
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="gap-2"
              disabled={filteredApps.length === 0}
            >
              <Download className="h-4 w-4" />
              ส่งออก CSV
            </Button>
          )}

          {canManage && (
            <Button onClick={() => setIsRoundOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              เปิดรอบรับสมัครใหม่
            </Button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">ผู้สมัครทั้งหมด</div>
            <div className="text-2xl font-bold text-foreground">
              {totalApps} <span className="text-sm font-normal text-muted-foreground">คน</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">รอตรวจสอบหลักฐาน</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingDocs} <span className="text-sm font-normal text-muted-foreground">คน</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">มีสิทธิ์สัมภาษณ์</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {interviewCount} <span className="text-sm font-normal text-muted-foreground">คน</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">ผ่านการคัดเลือก</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {passedCount} <span className="text-sm font-normal text-muted-foreground">คน</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab("APPLICATIONS")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "APPLICATIONS"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          รายชื่อผู้สมัคร ({applications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ROUNDS")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "ROUNDS"
              ? "border-primary text-primary font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" />
          รอบการรับสมัคร ({roundsList.length})
        </button>
      </div>

      {/* Tab 1: Applications */}
      {activeTab === "APPLICATIONS" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="ค้นหาด้วยเลขที่ใบสมัคร, ชื่อ-นามสกุล, เลขประจำตัวประชาชน, หรือโรงเรียน..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-[180px]">
                <LiyonSelect
                  value={selectedRound}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRound(e.target.value)}
                >
                  <option value="ALL">ทุกรอบรับสมัคร</option>
                  {roundsList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roundName}
                    </option>
                  ))}
                </LiyonSelect>
              </div>

              <div className="w-[180px]">
                <LiyonSelect
                  value={selectedProgram}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedProgram(e.target.value)}
                >
                  <option value="ALL">ทุกสาขาวิชา</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameTh}
                    </option>
                  ))}
                </LiyonSelect>
              </div>

              <div className="w-[150px]">
                <LiyonSelect
                  value={selectedStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
                >
                  <option value="ALL">ทุกสถานะ</option>
                  <option value="SUBMITTED">รอตรวจหลักฐาน</option>
                  <option value="DOCS_APPROVED">เอกสารผ่าน</option>
                  <option value="INTERVIEW_ELIGIBLE">มีสิทธิ์สัมภาษณ์</option>
                  <option value="PASSED">ผ่านการคัดเลือก</option>
                  <option value="REJECTED">ไม่ผ่าน</option>
                </LiyonSelect>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-card-foreground">
                <thead className="border-b bg-muted/50 text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">เลขที่ใบสมัคร</th>
                    <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                    <th className="px-4 py-3">สาขาวิชา / รอบ</th>
                    <th className="px-4 py-3 text-center">GPAX</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                    <th className="px-4 py-3 text-center">คะแนน</th>
                    <th className="px-4 py-3 text-right">วันที่ยื่น</th>
                    <th className="px-4 py-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                        <GraduationCap className="mx-auto h-8 w-8 opacity-40 mb-2" />
                        ไม่พบข้อมูลใบสมัครตามเงื่อนไข
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-primary">
                          {app.applicationNo}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-foreground">{app.applicantNameTh}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span>ID: {app.nationalId.slice(0, 3)}****{app.nationalId.slice(-4)}</span>
                            {app.schoolName && <span>• {app.schoolName}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs">
                          <div className="font-medium text-foreground">{app.programNameTh}</div>
                          <div className="text-muted-foreground">{app.roundName}</div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-semibold text-xs">
                          {app.gpax !== null ? app.gpax.toFixed(2) : "-"}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusPill tone={getStatusTone(app.status)}>
                            {getStatusLabel(app.status)}
                          </StatusPill>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-xs font-bold">
                          {app.score !== null ? (
                            <span className="text-primary">{app.score}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString("th-TH")}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canReview && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleOpenReview(app)}
                              >
                                <FileCheck className="h-3.5 w-3.5" />
                                ตรวจ / ให้คะแนน
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Admission Rounds */}
      {activeTab === "ROUNDS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roundsList.map((round) => (
            <div
              key={round.id}
              className="rounded-xl border bg-card p-5 shadow-sm space-y-4 text-card-foreground"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      ปีการศึกษา {round.academicYear}
                    </span>
                    <StatusPill tone={round.isOpen ? "ok" : "off"}>
                      {round.isOpen ? "เปิดรับสมัครอยู่" : "ปิดรับสมัครแล้ว"}
                    </StatusPill>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-2">
                    {round.roundName}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-3 rounded-lg">
                <div>
                  <span className="text-muted-foreground">เปิดรับ:</span>{" "}
                  <span className="font-medium">
                    {new Date(round.startDate).toLocaleDateString("th-TH")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">สิ้นสุด:</span>{" "}
                  <span className="font-medium">
                    {new Date(round.endDate).toLocaleDateString("th-TH")}
                  </span>
                </div>
                {round.announcementDate && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">ประกาศผล:</span>{" "}
                    <span className="font-medium">
                      {new Date(round.announcementDate).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  โควตาที่นั่งตามสาขาวิชา ({round.quotas.length} สาขา):
                </div>
                <div className="divide-y text-xs border rounded-lg overflow-hidden bg-background">
                  {round.quotas.map((q) => (
                    <div key={q.id} className="p-2.5 flex items-center justify-between">
                      <span className="font-medium text-foreground">{q.programNameTh}</span>
                      <span className="font-mono text-primary font-bold">
                        {q.quotaSeats} ที่นั่ง
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review & Score Dialog */}
      <LiyonDialog open={isReviewOpen} onOpenChange={setIsReviewOpen} wide>
        <LiyonDialogHeader
          title={
            selectedApp ? (
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <span>ตรวจคุณสมบัติและบันทึกคะแนน: {selectedApp.applicationNo}</span>
              </div>
            ) : (
              "ตรวจคุณสมบัติผู้สมัคร"
            )
          }
        />
        <LiyonDialogCloseButton label="ปิด" />

        {selectedApp && (
          <form onSubmit={handleSaveReview}>
            <LiyonDialogBody>
              <div className="space-y-5">
                {/* Applicant Summary */}
                <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-2">
                    <div>
                      <div className="text-lg font-bold text-foreground">
                        {selectedApp.applicantNameTh}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        เลขบัตรประชาชน: {selectedApp.nationalId}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary">
                        {selectedApp.programNameTh}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedApp.roundName}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">โรงเรียน:</span>
                      <div className="font-medium text-foreground">{selectedApp.schoolName || "-"}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">GPAX:</span>
                      <div className="font-mono font-bold text-foreground">{selectedApp.gpax?.toFixed(2) ?? "-"}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">เบอร์โทรศัพท์:</span>
                      <div className="font-mono text-foreground">{selectedApp.phone}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">อีเมล:</span>
                      <div className="text-foreground">{selectedApp.email}</div>
                    </div>
                  </div>
                </div>

                {/* Documents Attached */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    เอกสารและหลักฐานแนบ ({selectedApp.documents.length} รายการ)
                  </div>
                  {selectedApp.documents.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic p-3 border rounded-lg bg-background">
                      ไม่มีเอกสารแนบ
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedApp.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-lg border bg-background hover:bg-muted transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                            <span className="truncate font-medium">{doc.name}</span>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Review Decision Form */}
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LiyonField label="สถานะผลการพิจารณา *">
                      <LiyonSelect
                        value={reviewForm.status}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setReviewForm({
                            ...reviewForm,
                            status: e.target.value as StudentApplicationDto["status"],
                          })
                        }
                      >
                        <option value="DOCS_APPROVED">เอกสารผ่านการตรวจสอบ (Docs Approved)</option>
                        <option value="DOCS_REJECTED">เอกสารไม่สมบูรณ์ / ตีกลับ (Docs Rejected)</option>
                        <option value="INTERVIEW_ELIGIBLE">มีสิทธิ์เข้าสอบสัมภาษณ์ (Interview Eligible)</option>
                        <option value="PASSED">ผ่านการคัดเลือก (Admitted / Passed)</option>
                        <option value="REJECTED">ไม่ผ่านการคัดเลือก (Rejected)</option>
                      </LiyonSelect>
                    </LiyonField>

                    {canScore && (
                      <LiyonField label="คะแนนการประเมิน / สัมภาษณ์ (0 - 100)">
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          max={100}
                          value={reviewForm.score}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setReviewForm({ ...reviewForm, score: e.target.value })
                          }
                          placeholder="เช่น 85.50"
                          className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </LiyonField>
                    )}
                  </div>

                  <LiyonField label="ความเห็นกรรมการ / ข้อความแจ้งผู้สมัคร">
                    <textarea
                      rows={3}
                      value={reviewForm.comment}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setReviewForm({ ...reviewForm, comment: e.target.value })
                      }
                      placeholder="เช่น เอกสารครบถ้วน คุณสมบัติตรงตามเกณฑ์ หรือ กรุณาแนบใบ ปพ.1 ใหม่"
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </LiyonField>
                </div>
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReviewOpen(false)}
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "กำลังบันทึก..." : "บันทึกผลการประเมิน"}
              </Button>
            </LiyonDialogFooter>
          </form>
        )}
      </LiyonDialog>

      {/* Create Round Dialog */}
      <LiyonDialog open={isRoundOpen} onOpenChange={setIsRoundOpen} wide>
        <LiyonDialogHeader title="เปิดรอบการรับสมัครนิสิตใหม่" />
        <LiyonDialogCloseButton label="ปิด" />

        <form onSubmit={handleCreateRound}>
          <LiyonDialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label="ปีการศึกษา *">
                  <input
                    type="number"
                    min={2500}
                    max={2600}
                    required
                    value={roundForm.academicYear}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRoundForm({ ...roundForm, academicYear: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="ชื่อรอบรับสมัคร *">
                  <input
                    required
                    value={roundForm.roundName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRoundForm({ ...roundForm, roundName: e.target.value })
                    }
                    placeholder="เช่น TCAS 1 Portfolio หรือ โควตาพิเศษ"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <LiyonField label="วันเริ่มรับสมัคร *">
                  <input
                    type="date"
                    required
                    value={roundForm.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRoundForm({ ...roundForm, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="วันสิ้นสุดรับสมัคร *">
                  <input
                    type="date"
                    required
                    value={roundForm.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRoundForm({ ...roundForm, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="วันประกาศผลคัดเลือก">
                  <input
                    type="date"
                    value={roundForm.announcementDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRoundForm({ ...roundForm, announcementDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>
              </div>

              {/* Quotas */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  กำหนดจำนวนที่นั่งโควตาตามหลักสูตร / สาขาวิชา:
                </div>
                <div className="space-y-2 border rounded-xl p-3 bg-muted/20">
                  {roundForm.quotas.map((q, idx) => (
                    <div key={q.programId} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div className="text-xs font-medium text-foreground truncate">
                        {q.programName}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">ที่นั่ง:</span>
                        <input
                          type="number"
                          min={1}
                          value={q.seats}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = Number(e.target.value);
                            setRoundForm((prev) => {
                              const nextQ = [...prev.quotas];
                              nextQ[idx] = { ...nextQ[idx]!, seats: val };
                              return { ...prev, quotas: nextQ };
                            });
                          }}
                          className="w-full px-2 py-1 text-xs border border-input rounded bg-background"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">ค่าเทอม (฿):</span>
                        <input
                          type="number"
                          min={0}
                          value={q.tuitionFee}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = Number(e.target.value);
                            setRoundForm((prev) => {
                              const nextQ = [...prev.quotas];
                              nextQ[idx] = { ...nextQ[idx]!, tuitionFee: val };
                              return { ...prev, quotas: nextQ };
                            });
                          }}
                          className="w-full px-2 py-1 text-xs border border-input rounded bg-background"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRoundOpen(false)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "เปิดรอบรับสมัคร"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
