"use client";

import Link from "next/link";
import {
  Calendar,
  ArrowUpRight,
  Search,
  Sparkles,
} from "lucide-react";
import type { AdmissionRoundDto } from "@/features/admissions";
import type { AcademicProgramDto } from "@/features/curriculum";

interface PublicAdmissionsClientProps {
  rounds: AdmissionRoundDto[];
  programs: AcademicProgramDto[];
}

export function PublicAdmissionsClient({
  rounds,
  programs: _programs,
}: PublicAdmissionsClientProps) {
  const activeRounds = rounds.filter((r) => r.isActive);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Sanctuary Banner */}
      <section className="dark-emerald-elevate rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-14 relative overflow-hidden border border-[#c5a059]/30 shadow-2xl space-y-6">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#1e3328]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 px-3.5 py-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#dfbe80]">
            <Sparkles className="size-3 text-[#c5a059]" />
            <span>Admissions Sanctuary • TCAS 2568</span>
          </div>

          <h1 className="font-serif-luxury text-3xl sm:text-5xl font-normal text-white tracking-tight leading-tight">
            ก้าวสู่อนาคตวิชาชีพที่มั่นคง <br className="hidden sm:inline" />
            ร่วมเป็นส่วนหนึ่งของครอบครัวเรา
          </h1>

          <p className="text-xs sm:text-sm text-[#a0b0a7] font-light leading-relaxed">
            เลือกเรียนในหลักสูตรที่ได้รับการรับรองมาตรฐานสากล
            พร้อมโอกาสฝึกงานในองค์กรชั้นนำทั้งในและต่างประเทศ
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/admissions/apply"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c5a059] hover:bg-[#dfbe80] text-[#121c17] text-xs font-semibold uppercase tracking-wider transition-all shadow-md"
            >
              <span>สมัครเรียนออนไลน์ทันที</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link
              href="/admissions/tracking"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 text-white text-xs font-medium transition-all"
            >
              <Search className="size-3.5 text-[#dfbe80]" />
              <span>ตรวจสอบสถานะใบสมัคร</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Rounds Catalog */}
      <section className="space-y-8">
        <div className="border-b border-[#ded9cb] pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#c5a059] block">
              Enrollment Schedule
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#16251e]">
              รอบการรับสมัครที่เปิดรับ
            </h2>
          </div>
          <p className="text-xs text-[#55635c] font-light">
            กำหนดการและรายละเอียดจำนวนที่นั่งโควตาประจำแต่ละรอบ
          </p>
        </div>

        {activeRounds.length === 0 ? (
          <div className="glass-card-elevate rounded-3xl border border-[#ded9cb] p-12 text-center text-[#55635c] space-y-2">
            <Calendar className="mx-auto h-10 w-10 text-[#c5a059]/60" />
            <div className="font-serif-luxury text-lg text-[#16251e]">ขณะนี้ยังไม่มีรอบรับสมัครที่เปิดทำการ</div>
            <p className="text-xs font-light">โปรดติดตามประกาศกำหนดการเปิดรับสมัครในเร็วๆ นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeRounds.map((round) => (
              <div
                key={round.id}
                className="glass-card-elevate flex flex-col justify-between rounded-3xl border border-[#ded9cb] p-7 hover:border-[#c5a059]/60 hover:shadow-xl transition-all relative overflow-hidden space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-wider px-3 py-1 rounded-full bg-[#1e3328]/10 text-[#1e3328]">
                      ปีการศึกษา {round.academicYear}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        round.isOpen
                          ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                          : "bg-[#ded9cb]/50 text-[#55635c]"
                      }`}
                    >
                      {round.isOpen ? (
                        <>
                          <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>กำลังเปิดรับสมัคร</span>
                        </>
                      ) : (
                        "ปิดรับสมัครแล้ว"
                      )}
                    </span>
                  </div>

                  <h3 className="font-serif-luxury text-2xl text-[#16251e] leading-snug">
                    {round.roundName}
                  </h3>

                  {/* Schedule dates */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#ede7dc]/60 border border-[#ded9cb]/60 p-4 rounded-2xl">
                    <div>
                      <div className="text-[#55635c] text-[11px]">เริ่มรับสมัคร:</div>
                      <div className="font-medium text-[#16251e] mt-0.5">
                        {new Date(round.startDate).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#55635c] text-[11px]">สิ้นสุดรับสมัคร:</div>
                      <div className="font-medium text-[#16251e] mt-0.5">
                        {new Date(round.endDate).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    {round.announcementDate && (
                      <div className="col-span-2 pt-2 border-t border-[#ded9cb]/80 mt-1">
                        <span className="text-[#55635c] text-[11px]">ประกาศผลคัดเลือก: </span>
                        <span className="font-medium text-[#1e3328]">
                          {new Date(round.announcementDate).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Program Quota table */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-[#55635c] uppercase tracking-wider">
                      สาขาวิชาและจำนวนที่เปิดรับ:
                    </div>
                    <div className="divide-y divide-[#ded9cb]/60 border border-[#ded9cb]/80 rounded-2xl overflow-hidden text-xs bg-[#f7f5ef]">
                      {round.quotas.map((q) => (
                        <div key={q.id} className="p-3 flex items-center justify-between">
                          <div className="font-medium text-[#16251e]">
                            {q.programNameTh}
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-bold text-[#1e3328]">{q.quotaSeats}</span>{" "}
                            <span className="text-[#55635c] text-[11px]">ที่นั่ง</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ded9cb]/60 flex items-center justify-between">
                  <div className="text-xs text-[#55635c]">
                    จำนวนที่นั่งรวม:{" "}
                    <strong className="text-[#16251e] font-serif-luxury text-base">
                      {round.quotas.reduce((sum, q) => sum + q.quotaSeats, 0)}
                    </strong>{" "}
                    ที่นั่ง
                  </div>
                  {round.isOpen && (
                    <Link
                      href={`/admissions/apply?roundId=${round.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1e3328] hover:bg-[#13221b] text-white text-xs font-medium tracking-wide transition-all shadow-xs"
                    >
                      <span>สมัครรอบนี้</span>
                      <ArrowUpRight className="size-3.5 text-[#c5a059]" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Steps to Apply */}
      <section className="glass-card-elevate rounded-3xl border border-[#ded9cb] p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#c5a059] block">
            Admissions Process
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#16251e]">
            ขั้นตอนการสมัครเรียนออนไลน์ 4 ขั้นตอน
          </h2>
          <p className="text-xs text-[#55635c] font-light">
            สมัครได้สะดวกทุกที่ทุกเวลา พร้อมระบบตรวจสอบสถานะแบบเรียลไทม์
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-[#ede7dc]/60 p-6 rounded-2xl border border-[#ded9cb]/80 text-center space-y-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1e3328] text-[#c5a059] font-serif-luxury text-sm font-bold mx-auto flex items-center justify-center">
              1
            </div>
            <div className="font-serif-luxury text-base text-[#16251e]">เลือกรอบและสาขา</div>
            <p className="text-xs text-[#55635c] font-light leading-relaxed">
              ศึกษารอบรับสมัครและคุณสมบัติเฉพาะของสาขาที่สนใจ
            </p>
          </div>

          <div className="bg-[#ede7dc]/60 p-6 rounded-2xl border border-[#ded9cb]/80 text-center space-y-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1e3328] text-[#c5a059] font-serif-luxury text-sm font-bold mx-auto flex items-center justify-center">
              2
            </div>
            <div className="font-serif-luxury text-base text-[#16251e]">กรอกข้อมูลส่วนตัว</div>
            <p className="text-xs text-[#55635c] font-light leading-relaxed">
              กรอกประวัติการศึกษา คะแนน GPAX และข้อมูลติดต่อ
            </p>
          </div>

          <div className="bg-[#ede7dc]/60 p-6 rounded-2xl border border-[#ded9cb]/80 text-center space-y-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1e3328] text-[#c5a059] font-serif-luxury text-sm font-bold mx-auto flex items-center justify-center">
              3
            </div>
            <div className="font-serif-luxury text-base text-[#16251e]">แนบหลักฐานเอกสาร</div>
            <p className="text-xs text-[#55635c] font-light leading-relaxed">
              อัปโหลดไฟล์ระเบียนผลการเรียน (ปพ.1) หรือแฟ้มสะสมงาน
            </p>
          </div>

          <div className="bg-[#ede7dc]/60 p-6 rounded-2xl border border-[#ded9cb]/80 text-center space-y-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1e3328] text-[#c5a059] font-serif-luxury text-sm font-bold mx-auto flex items-center justify-center">
              4
            </div>
            <div className="font-serif-luxury text-base text-[#16251e]">รอประกาศผล</div>
            <p className="text-xs text-[#55635c] font-light leading-relaxed">
              รับเลขที่ใบสมัครและติดตามผลการพิจารณาทางออนไลน์
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
