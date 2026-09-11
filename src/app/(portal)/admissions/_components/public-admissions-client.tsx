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
import { formatDate } from "@/shared/lib/format";
import { useLocale } from "@/shared/lib/i18n/client";

interface PublicAdmissionsClientProps {
  rounds: AdmissionRoundDto[];
  programs: AcademicProgramDto[];
}

export function PublicAdmissionsClient({
  rounds,
  programs: _programs,
}: PublicAdmissionsClientProps) {
  const locale = useLocale();
  const activeRounds = rounds.filter((r) => r.isActive);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Sanctuary Banner */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-14 relative overflow-hidden border border-indigo-500/20 shadow-2xl space-y-6">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-300">
            <Sparkles className="size-3 text-amber-400" />
            <span>Admissions Portal • TCAS 2568</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            ก้าวสู่อนาคตวิชาชีพที่มั่นคง <br className="hidden sm:inline" />
            ร่วมเป็นส่วนหนึ่งของครอบครัวเรา
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            เลือกเรียนในหลักสูตรที่ได้รับการรับรองมาตรฐานสากล
            พร้อมโอกาสฝึกงานในองค์กรชั้นนำทั้งในและต่างประเทศ
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/admissions/apply"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20"
            >
              <span>สมัครเรียนออนไลน์ทันที</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link
              href="/admissions/tracking"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 text-white text-xs font-medium transition-all"
            >
              <Search className="size-3.5 text-amber-300" />
              <span>ตรวจสอบสถานะใบสมัคร</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Rounds Catalog */}
      <section className="space-y-8">
        <div className="border-b border-border/80 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 block">
              Enrollment Schedule
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              รอบการรับสมัครที่เปิดรับ
            </h2>
          </div>
          <p className="text-xs text-muted-foreground font-light">
            กำหนดการและรายละเอียดจำนวนที่นั่งโควตาประจำแต่ละรอบ
          </p>
        </div>

        {activeRounds.length === 0 ? (
          <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground space-y-2">
            <Calendar className="mx-auto h-10 w-10 text-amber-500/60" />
            <div className="text-lg font-bold text-foreground">ขณะนี้ยังไม่มีรอบรับสมัครที่เปิดทำการ</div>
            <p className="text-xs font-normal">โปรดติดตามประกาศกำหนดการเปิดรับสมัครในเร็วๆ นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeRounds.map((round) => (
              <div
                key={round.id}
                className="bg-card flex flex-col justify-between rounded-2xl border border-border/80 p-7 hover:border-indigo-500/50 hover:shadow-lg transition-all relative overflow-hidden space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-wider px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                      ปีการศึกษา {round.academicYear}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        round.isOpen
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground"
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

                  <h3 className="text-2xl font-bold text-foreground leading-snug">
                    {round.roundName}
                  </h3>

                  {/* Schedule dates */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-muted/40 border border-border/60 p-4 rounded-xl">
                    <div>
                      <div className="text-muted-foreground text-[11px]">เริ่มรับสมัคร:</div>
                      <div className="font-semibold text-foreground mt-0.5">
                        {formatDate(round.startDate, locale)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-[11px]">สิ้นสุดรับสมัคร:</div>
                      <div className="font-semibold text-foreground mt-0.5">
                        {formatDate(round.endDate, locale)}
                      </div>
                    </div>
                    {round.announcementDate && (
                      <div className="col-span-2 pt-2 border-t border-border/60 mt-1">
                        <span className="text-muted-foreground text-[11px]">ประกาศผลคัดเลือก: </span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {formatDate(round.announcementDate, locale)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Program Quota table */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      สาขาวิชาและจำนวนที่เปิดรับ:
                    </div>
                    <div className="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden text-xs bg-background">
                      {round.quotas.map((q) => (
                        <div key={q.id} className="p-3 flex items-center justify-between">
                          <div className="font-medium text-foreground">
                            {q.programNameTh}
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{q.quotaSeats}</span>{" "}
                            <span className="text-muted-foreground text-[11px]">ที่นั่ง</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    จำนวนที่นั่งรวม:{" "}
                    <strong className="text-foreground font-mono text-base font-bold">
                      {round.quotas.reduce((sum, q) => sum + q.quotaSeats, 0)}
                    </strong>{" "}
                    ที่นั่ง
                  </div>
                  {round.isOpen && (
                    <Link
                      href={`/admissions/apply?roundId=${round.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold tracking-wide transition-all shadow-xs active:scale-95"
                    >
                      <span>สมัครรอบนี้</span>
                      <ArrowUpRight className="size-3.5 text-slate-950" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Steps to Apply */}
      <section className="bg-card rounded-2xl border border-border/80 p-8 sm:p-12 space-y-8 shadow-xs">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 block">
            Admissions Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            ขั้นตอนการสมัครเรียนออนไลน์ 4 ขั้นตอน
          </h2>
          <p className="text-xs text-muted-foreground font-normal">
            สมัครได้สะดวกทุกที่ทุกเวลา พร้อมระบบตรวจสอบสถานะแบบเรียลไทม์
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-muted/40 p-6 rounded-2xl border border-border/60 text-center space-y-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-sm font-bold mx-auto flex items-center justify-center">
              1
            </div>
            <div className="text-base font-bold text-foreground">เลือกรอบและสาขา</div>
            <p className="text-xs text-muted-foreground font-normal leading-relaxed">
              ศึกษารอบรับสมัครและคุณสมบัติเฉพาะของสาขาที่สนใจ
            </p>
          </div>

          <div className="bg-muted/40 p-6 rounded-2xl border border-border/60 text-center space-y-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-sm font-bold mx-auto flex items-center justify-center">
              2
            </div>
            <div className="text-base font-bold text-foreground">กรอกข้อมูลส่วนตัว</div>
            <p className="text-xs text-muted-foreground font-normal leading-relaxed">
              กรอกประวัติการศึกษา คะแนน GPAX และข้อมูลติดต่อ
            </p>
          </div>

          <div className="bg-muted/40 p-6 rounded-2xl border border-border/60 text-center space-y-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-sm font-bold mx-auto flex items-center justify-center">
              3
            </div>
            <div className="text-base font-bold text-foreground">แนบหลักฐานเอกสาร</div>
            <p className="text-xs text-muted-foreground font-normal leading-relaxed">
              อัปโหลดไฟล์ระเบียนผลการเรียน (ปพ.1) หรือแฟ้มสะสมงาน
            </p>
          </div>

          <div className="bg-muted/40 p-6 rounded-2xl border border-border/60 text-center space-y-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-sm font-bold mx-auto flex items-center justify-center">
              4
            </div>
            <div className="text-base font-bold text-foreground">รอประกาศผล</div>
            <p className="text-xs text-muted-foreground font-normal leading-relaxed">
              รับเลขที่ใบสมัครและติดตามผลการพิจารณาทางออนไลน์
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
