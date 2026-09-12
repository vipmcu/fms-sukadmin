"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  BookOpen,
  Clock,
  Coins,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Building2,
} from "lucide-react";
import type { AcademicProgramDto } from "@/features/curriculum";
import type { DepartmentDto } from "@/features/personnel";

interface PublicProgramsClientProps {
  programs: AcademicProgramDto[];
  departments?: DepartmentDto[];
}

export function PublicProgramsClient({ programs, departments = [] }: PublicProgramsClientProps) {
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");

  const getLevelBadge = (lvl: string) => {
    switch (lvl) {
      case "BACHELOR":
        return { label: "ปริญญาตรี", color: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60" };
      case "MASTER":
        return { label: "ปริญญาโท", color: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60" };
      case "DOCTORAL":
        return { label: "ปริญญาเอก", color: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60" };
      default:
        return { label: "ประกาศนียบัตร", color: "bg-muted text-muted-foreground border border-border" };
    }
  };

  const filtered = programs.filter((p) => {
    const matchLevel = selectedLevel === "ALL" || p.level === selectedLevel;
    const matchDept = selectedDeptId === "ALL" || p.departmentId === selectedDeptId;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      p.code.toLowerCase().includes(q) ||
      p.nameTh.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.degreeTh.toLowerCase().includes(q) ||
      (p.departmentNameTh && p.departmentNameTh.toLowerCase().includes(q)) ||
      p.careerOpportunities.some((c) => c.toLowerCase().includes(q));
    return matchLevel && matchDept && matchSearch;
  });

  return (
    <div className="space-y-12 pb-12">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold tracking-[0.2em] uppercase">
          <Sparkles className="size-3 text-amber-500" />
          <span>Curated Academic Pathways</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
          หลักสูตรการศึกษาและวิชาการ
        </h1>
        <p className="text-muted-foreground text-xs sm:text-base font-light leading-relaxed">
          หลักสูตรทันสมัยที่ตอบสนองตลาดแรงงานสากล
          บูรณาการภาคทฤษฎีและปฏิบัติการพร้อมคณาจารย์ผู้เชี่ยวชาญ
        </p>
      </div>

      {/* 2. Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between lingua-card p-4 rounded-3xl border border-border/80 bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-center flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาชื่อหลักสูตร, สาขาวิชา, ปริญญา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="ค้นหาชื่อหลักสูตร, สาขาวิชา, ปริญญา"
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-border/80 rounded-2xl bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {departments && departments.length > 0 && (
            <div className="w-full sm:w-auto">
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                aria-label="เลือกภาควิชา/ส่วนงาน"
                className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm border border-border/80 rounded-2xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="ALL">ทุกภาควิชา/ส่วนงาน</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameTh} {d.programCount ? `(${d.programCount})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div role="group" aria-label="กรองระดับการศึกษา (Filter by Education Level)" className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedLevel("ALL")}
            aria-pressed={selectedLevel === "ALL"}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedLevel === "ALL"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ทั้งหมด ({programs.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevel("BACHELOR")}
            aria-pressed={selectedLevel === "BACHELOR"}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedLevel === "BACHELOR"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ปริญญาตรี
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevel("MASTER")}
            aria-pressed={selectedLevel === "MASTER"}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedLevel === "MASTER"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ปริญญาโท
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevel("DOCTORAL")}
            aria-pressed={selectedLevel === "DOCTORAL"}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedLevel === "DOCTORAL"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ปริญญาเอก
          </button>
        </div>
      </div>

      {/* 3. Program Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-border bg-card">
          <GraduationCap className="size-10 mx-auto text-amber-500/60 mb-3" />
          <h3 className="text-lg font-bold text-foreground">ไม่พบหลักสูตรที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-muted-foreground mt-1 font-normal">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกระดับการศึกษาอื่น
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((p) => {
            const badge = getLevelBadge(p.level);

            return (
              <div
                key={p.id}
                className="flex flex-col justify-between p-7 sm:p-8 bg-card rounded-2xl border border-border/80 shadow-xs hover:shadow-lg hover:border-indigo-500/50 transition-all group space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-muted rounded text-muted-foreground">
                        {p.code}
                      </span>
                      <span className={`text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full uppercase ${badge.color}`}>
                        {badge.label}
                      </span>
                      {p.departmentNameTh && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <Building2 className="size-2.5 text-slate-500" />
                          {p.departmentNameTh}
                        </span>
                      )}
                    </div>

                    {p.isAcceptingApplications ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="size-3" />
                        เปิดรับสมัคร
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full">
                        ปิดรับสมัคร
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {p.nameTh}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5 font-normal">{p.nameEn}</p>
                    <div className="mt-2 text-xs font-semibold text-foreground">
                      ชื่อปริญญา: <span className="font-normal text-muted-foreground">{p.degreeTh}</span>
                    </div>
                  </div>

                  {p.descriptionTh && (
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-normal">
                      {p.descriptionTh}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-normal">
                      <BookOpen className="size-3 text-amber-500" />
                      <span>{p.totalCredits} หน่วยกิต</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-normal">
                      <Clock className="size-3 text-amber-500" />
                      <span>{p.durationYears} ปี</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate font-normal">
                      <Coins className="size-3 text-amber-500 shrink-0" />
                      <span className="truncate">
                        {p.tuitionFeePerTerm
                          ? `฿${p.tuitionFeePerTerm.toLocaleString()}/เทอม`
                          : "ตามประกาศ"}
                      </span>
                    </div>
                  </div>

                  {p.careerOpportunities.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        แนวทางการประกอบอาชีพ
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.careerOpportunities.slice(0, 3).map((job, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted/60 border border-border/60 text-foreground font-normal"
                          >
                            {job}
                          </span>
                        ))}
                        {p.careerOpportunities.length > 3 && (
                          <span className="text-[11px] px-2 py-0.5 text-muted-foreground font-normal">
                            +{p.careerOpportunities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                  <Link
                    href={`/programs/${p.id}`}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>ดูแผนการเรียนและรายวิชา</span>
                    <ArrowRight className="size-3.5" />
                  </Link>

                  {p.isAcceptingApplications && p.applicationLink && (
                    <a
                      href={p.applicationLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs active:scale-95"
                    >
                      <span>สมัครเรียน</span>
                      <ArrowUpRight className="size-3 text-slate-950" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
