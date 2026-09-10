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
} from "lucide-react";
import type { AcademicProgramDto } from "@/features/curriculum";

interface PublicProgramsClientProps {
  programs: AcademicProgramDto[];
}

export function PublicProgramsClient({ programs }: PublicProgramsClientProps) {
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  const getLevelBadge = (lvl: string) => {
    switch (lvl) {
      case "BACHELOR":
        return { label: "ปริญญาตรี", color: "bg-[#c5a059]/15 text-[#1e3328] border border-[#c5a059]/30" };
      case "MASTER":
        return { label: "ปริญญาโท", color: "bg-[#1e3328]/10 text-[#1e3328] border border-[#1e3328]/20" };
      case "DOCTORAL":
        return { label: "ปริญญาเอก", color: "bg-[#121c17] text-[#dfbe80] border border-[#dfbe80]/30" };
      default:
        return { label: "ประกาศนียบัตร", color: "bg-[#ded9cb] text-[#16251e]" };
    }
  };

  const filtered = programs.filter((p) => {
    const matchLevel = selectedLevel === "ALL" || p.level === selectedLevel;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      p.code.toLowerCase().includes(q) ||
      p.nameTh.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.degreeTh.toLowerCase().includes(q) ||
      p.careerOpportunities.some((c) => c.toLowerCase().includes(q));
    return matchLevel && matchSearch;
  });

  return (
    <div className="space-y-12 pb-12">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#f7f5ef] border border-[#c5a059]/40 text-[#16251e] text-[11px] font-semibold tracking-[0.2em] uppercase">
          <Sparkles className="size-3 text-[#c5a059]" />
          <span>Curated Academic Pathways</span>
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl font-normal tracking-tight text-[#16251e]">
          หลักสูตรการศึกษาและวิชาการ
        </h1>
        <p className="text-[#55635c] text-xs sm:text-base font-light leading-relaxed">
          หลักสูตรทันสมัยที่ตอบสนองตลาดแรงงานสากล
          บูรณาการภาคทฤษฎีและปฏิบัติการพร้อมคณาจารย์ผู้เชี่ยวชาญ
        </p>
      </div>

      {/* 2. Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-card-elevate p-4 rounded-3xl border border-[#ded9cb] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#55635c]" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหลักสูตร, สาขาวิชา, ปริญญา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-[#ded9cb] rounded-2xl bg-[#f7f5ef] text-[#16251e] placeholder:text-[#55635c]/60 focus:outline-none focus:ring-2 focus:ring-[#1e3328]/30"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#ede7dc]/80 rounded-2xl w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedLevel("ALL")}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
              selectedLevel === "ALL"
                ? "bg-[#1e3328] text-white shadow-xs"
                : "text-[#55635c] hover:text-[#16251e]"
            }`}
          >
            ทั้งหมด ({programs.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevel("BACHELOR")}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
              selectedLevel === "BACHELOR"
                ? "bg-[#1e3328] text-white shadow-xs"
                : "text-[#55635c] hover:text-[#16251e]"
            }`}
          >
            ปริญญาตรี
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevel("MASTER")}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
              selectedLevel === "MASTER"
                ? "bg-[#1e3328] text-white shadow-xs"
                : "text-[#55635c] hover:text-[#16251e]"
            }`}
          >
            ปริญญาโท
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevel("DOCTORAL")}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
              selectedLevel === "DOCTORAL"
                ? "bg-[#1e3328] text-white shadow-xs"
                : "text-[#55635c] hover:text-[#16251e]"
            }`}
          >
            ปริญญาเอก
          </button>
        </div>
      </div>

      {/* 3. Program Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-[#ded9cb] glass-card-elevate">
          <GraduationCap className="size-10 mx-auto text-[#c5a059]/60 mb-3" />
          <h3 className="font-serif-luxury text-lg text-[#16251e]">ไม่พบหลักสูตรที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-[#55635c] mt-1 font-light">
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
                className="flex flex-col justify-between p-7 sm:p-8 glass-card-elevate rounded-3xl border border-[#ded9cb] shadow-xs hover:shadow-xl hover:border-[#c5a059]/60 transition-all group space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#ede7dc] rounded text-[#55635c]">
                        {p.code}
                      </span>
                      <span className={`text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full uppercase ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    {p.isAcceptingApplications ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="size-3" />
                        เปิดรับสมัคร
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#55635c] bg-[#ded9cb]/50 px-2.5 py-0.5 rounded-full">
                        ปิดรับสมัคร
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="font-serif-luxury text-2xl text-[#16251e] group-hover:text-[#1e3328] transition-colors leading-snug">
                      {p.nameTh}
                    </h2>
                    <p className="text-xs text-[#55635c] mt-0.5 font-light">{p.nameEn}</p>
                    <div className="mt-2 text-xs font-serif-luxury text-[#1e3328]">
                      ชื่อปริญญา: <span className="font-sans font-normal text-[#55635c]">{p.degreeTh}</span>
                    </div>
                  </div>

                  {p.descriptionTh && (
                    <p className="text-xs text-[#55635c] line-clamp-3 leading-relaxed font-light">
                      {p.descriptionTh}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#ede7dc]/60 border border-[#ded9cb]/60 text-xs text-[#55635c]">
                    <div className="flex items-center gap-1.5 font-light">
                      <BookOpen className="size-3 text-[#c5a059]" />
                      <span>{p.totalCredits} หน่วยกิต</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-light">
                      <Clock className="size-3 text-[#c5a059]" />
                      <span>{p.durationYears} ปี</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate font-light">
                      <Coins className="size-3 text-[#c5a059] shrink-0" />
                      <span className="truncate">
                        {p.tuitionFeePerTerm
                          ? `฿${p.tuitionFeePerTerm.toLocaleString()}/เทอม`
                          : "ตามประกาศ"}
                      </span>
                    </div>
                  </div>

                  {p.careerOpportunities.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-[#55635c] uppercase tracking-wider block">
                        แนวทางการประกอบอาชีพ
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.careerOpportunities.slice(0, 3).map((job, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f7f5ef] border border-[#ded9cb] text-[#16251e] font-light"
                          >
                            {job}
                          </span>
                        ))}
                        {p.careerOpportunities.length > 3 && (
                          <span className="text-[11px] px-2 py-0.5 text-[#55635c] font-light">
                            +{p.careerOpportunities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#ded9cb]/60 flex items-center justify-between gap-3">
                  <Link
                    href={`/programs/${p.id}`}
                    className="text-xs font-medium text-[#1e3328] hover:text-[#c5a059] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>ดูแผนการเรียนและรายวิชา</span>
                    <ArrowRight className="size-3.5" />
                  </Link>

                  {p.isAcceptingApplications && p.applicationLink && (
                    <a
                      href={p.applicationLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1e3328] hover:bg-[#13221b] text-white text-xs font-medium transition-all shadow-xs"
                    >
                      <span>สมัครเรียน</span>
                      <ArrowUpRight className="size-3 text-[#c5a059]" />
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
