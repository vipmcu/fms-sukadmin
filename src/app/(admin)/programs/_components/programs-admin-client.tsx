"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  GraduationCap,
  Clock,
  Coins,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
  LiyonSwitch,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { AcademicProgramDto } from "@/features/curriculum";
import type { DepartmentDto } from "@/features/personnel";
import {
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
} from "@/features/curriculum/actions";

interface ProgramsAdminClientProps {
  departments: DepartmentDto[];
  initialPrograms: AcademicProgramDto[];
  canManage: boolean;
  canCreate: boolean;
}

export function ProgramsAdminClient({
  departments,
  initialPrograms,
  canManage,
  canCreate,
}: ProgramsAdminClientProps) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  // Program Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AcademicProgramDto | null>(null);

  const [code, setCode] = useState("");
  const [level, setLevel] = useState<"BACHELOR" | "MASTER" | "DOCTORAL" | "CERTIFICATE">("BACHELOR");
  const [departmentId, setDepartmentId] = useState<string>(departments[0]?.id || "");
  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [degreeTh, setDegreeTh] = useState("");
  const [degreeEn, setDegreeEn] = useState("");
  const [totalCredits, setTotalCredits] = useState(128);
  const [durationYears, setDurationYears] = useState(4.0);
  const [tuitionFeePerTerm, setTuitionFeePerTerm] = useState<number | "">("");
  const [descriptionTh, setDescriptionTh] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [careerInput, setCareerInput] = useState("");
  const [curriculumPdfUrl, setCurriculumPdfUrl] = useState("");
  const [isAcceptingApplications, setIsAcceptingApplications] = useState(true);
  const [applicationLink, setApplicationLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);

  const openCreateDialog = () => {
    setEditTarget(null);
    setCode("");
    setLevel("BACHELOR");
    setDepartmentId(departments[0]?.id || "");
    setNameTh("");
    setNameEn("");
    setDegreeTh("");
    setDegreeEn("");
    setTotalCredits(128);
    setDurationYears(4.0);
    setTuitionFeePerTerm("");
    setDescriptionTh("");
    setDescriptionEn("");
    setCareerInput("");
    setCurriculumPdfUrl("");
    setIsAcceptingApplications(true);
    setApplicationLink("");
    setIsActive(true);
    setOrder(initialPrograms.length + 1);
    setDialogOpen(true);
  };

  const openEditDialog = (p: AcademicProgramDto) => {
    setEditTarget(p);
    setCode(p.code);
    setLevel(p.level);
    setDepartmentId(p.departmentId || departments[0]?.id || "");
    setNameTh(p.nameTh);
    setNameEn(p.nameEn);
    setDegreeTh(p.degreeTh);
    setDegreeEn(p.degreeEn);
    setTotalCredits(p.totalCredits);
    setDurationYears(p.durationYears);
    setTuitionFeePerTerm(p.tuitionFeePerTerm ?? "");
    setDescriptionTh(p.descriptionTh || "");
    setDescriptionEn(p.descriptionEn || "");
    setCareerInput(p.careerOpportunities.join(", "));
    setCurriculumPdfUrl(p.curriculumPdfUrl || "");
    setIsAcceptingApplications(p.isAcceptingApplications);
    setApplicationLink(p.applicationLink || "");
    setIsActive(p.isActive);
    setOrder(p.order);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const careers = careerInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      if (editTarget) {
        const res = await updateProgramAction({
          id: editTarget.id,
          code,
          level,
          departmentId: departmentId || undefined,
          nameTh,
          nameEn,
          degreeTh,
          degreeEn,
          totalCredits: Number(totalCredits),
          durationYears: Number(durationYears),
          tuitionFeePerTerm: tuitionFeePerTerm === "" ? undefined : Number(tuitionFeePerTerm),
          descriptionTh: descriptionTh || undefined,
          descriptionEn: descriptionEn || undefined,
          careerOpportunities: careers,
          curriculumPdfUrl: curriculumPdfUrl || undefined,
          isAcceptingApplications,
          applicationLink: applicationLink || undefined,
          isActive,
          order: Number(order),
        });
        if (res.ok) {
          toast.success(t("curriculum.msg.updated"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error?.message || "เกิดข้อผิดพลาดในการแก้ไขหลักสูตร");
        }
      } else {
        const res = await createProgramAction({
          code,
          level,
          departmentId: departmentId || undefined,
          nameTh,
          nameEn,
          degreeTh,
          degreeEn,
          totalCredits: Number(totalCredits),
          durationYears: Number(durationYears),
          tuitionFeePerTerm: tuitionFeePerTerm === "" ? undefined : Number(tuitionFeePerTerm),
          descriptionTh: descriptionTh || undefined,
          descriptionEn: descriptionEn || undefined,
          careerOpportunities: careers,
          curriculumPdfUrl: curriculumPdfUrl || undefined,
          isAcceptingApplications,
          applicationLink: applicationLink || undefined,
          isActive,
          order: Number(order),
        });
        if (res.ok) {
          toast.success(t("curriculum.msg.created"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error?.message || "เกิดข้อผิดพลาดในการสร้างหลักสูตร");
        }
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`ยืนยันการลบหลักสูตร "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteProgramAction(id);
      if (res.ok) {
        toast.success(t("curriculum.msg.deleted"));
        router.refresh();
      } else {
        toast.error(res.error?.message || "ไม่สามารถลบหลักสูตรได้");
      }
    });
  };

  const getLevelBadge = (lvl: string) => {
    switch (lvl) {
      case "BACHELOR":
        return { label: "ปริญญาตรี", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" };
      case "MASTER":
        return { label: "ปริญญาโท", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" };
      case "DOCTORAL":
        return { label: "ปริญญาเอก", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" };
      default:
        return { label: "ประกาศนียบัตร", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
    }
  };

  const filtered = initialPrograms.filter((p) => {
    const matchLevel = selectedLevel === "ALL" || p.level === selectedLevel;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      p.code.toLowerCase().includes(q) ||
      p.nameTh.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.degreeTh.toLowerCase().includes(q);
    return matchLevel && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="size-6 text-primary" />
            {t("curriculum.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("curriculum.subtitle")}
          </p>
        </div>

        {canCreate && (
          <Button
            size="sm"
            onClick={openCreateDialog}
            className="flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            {t("curriculum.btn.create")}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหารหัส, ชื่อหลักสูตร, ปริญญา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            variant={selectedLevel === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLevel("ALL")}
            className="text-xs h-8"
          >
            ทุกระดับ ({initialPrograms.length})
          </Button>
          <Button
            variant={selectedLevel === "BACHELOR" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLevel("BACHELOR")}
            className="text-xs h-8"
          >
            {t("curriculum.level.bachelor")}
          </Button>
          <Button
            variant={selectedLevel === "MASTER" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLevel("MASTER")}
            className="text-xs h-8"
          >
            {t("curriculum.level.master")}
          </Button>
          <Button
            variant={selectedLevel === "DOCTORAL" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLevel("DOCTORAL")}
            className="text-xs h-8"
          >
            {t("curriculum.level.doctoral")}
          </Button>
        </div>
      </div>

      {/* Program Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card">
          <BookOpen className="size-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-semibold text-foreground">ไม่พบข้อมูลหลักสูตร</h3>
          <p className="text-xs text-muted-foreground mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่มเพิ่มหลักสูตรใหม่
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const badge = getLevelBadge(p.level);
            return (
              <div
                key={p.id}
                className="flex flex-col justify-between p-5 bg-card rounded-xl border border-border shadow-xs hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-muted rounded">
                        {p.code}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.isAcceptingApplications ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="size-3" />
                          เปิดรับสมัคร
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          <XCircle className="size-3" />
                          ปิดรับสมัคร
                        </span>
                      )}
                      <StatusPill tone={p.isActive ? "ok" : "off"}>
                        {p.isActive ? "เปิดใช้" : "ปิด"}
                      </StatusPill>
                    </div>
                  </div>

                  <h3 className="font-bold text-foreground text-base mt-2.5">
                    {p.nameTh}
                  </h3>
                  <p className="text-xs text-muted-foreground">{p.nameEn}</p>

                  <div className="mt-2 text-xs text-primary font-medium">
                    {p.degreeTh}
                  </div>

                  {p.descriptionTh && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {p.descriptionTh}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="size-3.5 shrink-0" />
                      <span>{p.totalCredits} หน่วยกิต</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5 shrink-0" />
                      <span>{p.durationYears} ปี</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Coins className="size-3.5 shrink-0" />
                      <span>
                        {p.tuitionFeePerTerm
                          ? `฿${p.tuitionFeePerTerm.toLocaleString()}/เทอม`
                          : "ตามระเบียบ"}
                      </span>
                    </div>
                  </div>

                  {p.careerOpportunities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.careerOpportunities.slice(0, 3).map((job, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {job}
                        </span>
                      ))}
                      {p.careerOpportunities.length > 3 && (
                        <span className="text-[10px] px-1 py-0.5 text-muted-foreground">
                          +{p.careerOpportunities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    {p.applicationLink && (
                      <a
                        href={p.applicationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline font-medium"
                      >
                        <ExternalLink className="size-3" />
                        หน้าสมัคร
                      </a>
                    )}
                    {p.curriculumPdfUrl && (
                      <a
                        href={p.curriculumPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        มคอ.2 (PDF)
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(p)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(p.id, p.nameTh)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Program Dialog */}
      <LiyonDialog open={dialogOpen} onOpenChange={setDialogOpen} wide>
        <form onSubmit={handleSubmit}>
          <LiyonDialogCloseButton label={t("btn.cancel")} />
          <LiyonDialogHeader
            title={editTarget ? `แก้ไข ${editTarget.code}` : "สร้างหลักสูตรใหม่"}
            description="ระบุข้อมูลหลักสูตร ระดับการศึกษา แผนการเรียน และเกณฑ์การรับสมัคร"
          />

          <LiyonDialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LiyonField label="รหัสหลักสูตร (เช่น CS-BSC)">
                  <input
                    required
                    className="w-full px-3 py-2 text-sm font-mono border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="CODE-DEGREE"
                  />
                </LiyonField>

                <LiyonField label="ระดับการศึกษา">
                  <LiyonSelect
                    value={level}
                    onChange={(e) =>
                      setLevel(
                        e.target.value as
                          | "BACHELOR"
                          | "MASTER"
                          | "DOCTORAL"
                          | "CERTIFICATE"
                      )
                    }
                  >
                    <option value="BACHELOR">{t("curriculum.level.bachelor")}</option>
                    <option value="MASTER">{t("curriculum.level.master")}</option>
                    <option value="DOCTORAL">{t("curriculum.level.doctoral")}</option>
                    <option value="CERTIFICATE">{t("curriculum.level.certificate")}</option>
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label="ภาควิชาผู้รับผิดชอบ">
                  <LiyonSelect
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    <option value="">-- ไม่ระบุ --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameTh}
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="ชื่อหลักสูตร (ภาษาไทย)">
                  <input
                    required
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={nameTh}
                    onChange={(e) => setNameTh(e.target.value)}
                    placeholder="หลักสูตรวิทยาศาสตรบัณฑิต..."
                  />
                </LiyonField>

                <LiyonField label="ชื่อหลักสูตร (ภาษาอังกฤษ)">
                  <input
                    required
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Bachelor of Science in..."
                  />
                </LiyonField>
              </div>

              {/* Degrees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="ชื่อปริญญา (ภาษาไทย)">
                  <input
                    required
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={degreeTh}
                    onChange={(e) => setDegreeTh(e.target.value)}
                    placeholder="วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์) วท.บ."
                  />
                </LiyonField>

                <LiyonField label="ชื่อปริญญา (ภาษาอังกฤษ)">
                  <input
                    required
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={degreeEn}
                    onChange={(e) => setDegreeEn(e.target.value)}
                    placeholder="Bachelor of Science (Computer Science) B.S."
                  />
                </LiyonField>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LiyonField label="หน่วยกิตรวมตลอดหลักสูตร">
                  <input
                    required
                    type="number"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={totalCredits}
                    onChange={(e) => setTotalCredits(Number(e.target.value))}
                  />
                </LiyonField>

                <LiyonField label="ระยะเวลาศึกษา (ปี)">
                  <input
                    required
                    type="number"
                    step="0.5"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={durationYears}
                    onChange={(e) => setDurationYears(Number(e.target.value))}
                  />
                </LiyonField>

                <LiyonField label="ค่าธรรมเนียมการศึกษา/ภาค (บาท)">
                  <input
                    type="number"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={tuitionFeePerTerm}
                    onChange={(e) =>
                      setTuitionFeePerTerm(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="เช่น 25000"
                  />
                </LiyonField>
              </div>

              <LiyonField label="คำอธิบายหลักสูตรและจุดเด่น (ภาษาไทย)">
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={descriptionTh}
                  onChange={(e) => setDescriptionTh(e.target.value)}
                  placeholder="รายละเอียดปรัชญาและวัตถุประสงค์ของหลักสูตร..."
                />
              </LiyonField>

              <LiyonField label="อาชีพที่สามารถประกอบได้หลังสำเร็จการศึกษา (คั่นด้วยจุลภาค)">
                <input
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={careerInput}
                  onChange={(e) => setCareerInput(e.target.value)}
                  placeholder="Software Engineer, Data Scientist, System Analyst"
                />
              </LiyonField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="URL ไฟล์เอกสารหลักสูตร มคอ.2 (PDF)">
                  <input
                    type="url"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={curriculumPdfUrl}
                    onChange={(e) => setCurriculumPdfUrl(e.target.value)}
                    placeholder="https://example.com/curriculum.pdf"
                  />
                </LiyonField>

                <LiyonField label="ลิงก์ระบบรับสมัครออนไลน์">
                  <input
                    type="url"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={applicationLink}
                    onChange={(e) => setApplicationLink(e.target.value)}
                    placeholder="https://admission.university.ac.th"
                  />
                </LiyonField>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <LiyonSwitch
                    checked={isAcceptingApplications}
                    onCheckedChange={setIsAcceptingApplications}
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">เปิดรับสมัครบุคคลเข้าศึกษา</div>
                    <div className="text-xs text-muted-foreground">แสดงปุ่มสมัครเรียนบนเว็บไซต์คณะ</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <LiyonSwitch checked={isActive} onCheckedChange={setIsActive} />
                  <div>
                    <div className="text-sm font-medium text-foreground">สถานะหลักสูตร</div>
                    <div className="text-xs text-muted-foreground">เปิดให้แสดงข้อมูลต่อสาธารณะ</div>
                  </div>
                </label>
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              {t("btn.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("btn.saving") : editTarget ? t("btn.save") : t("curriculum.btn.create")}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
