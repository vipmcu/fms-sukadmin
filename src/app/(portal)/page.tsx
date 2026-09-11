import Link from "next/link";
import {
  GraduationCap,
  Building2,
  Wrench,
  Users,
  Search,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/shared/lib/format";
import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { listNewsArticles } from "@/features/news/server";
import type { NewsArticleDto } from "@/features/news";
import { listPrograms } from "@/features/curriculum/server";
import { listResources } from "@/features/reservations/server";
import { listAdmissionRounds } from "@/features/admissions/server";
import { SummitHero } from "./_components/summit-hero";

export const metadata = {
  title: "ELEVATE • FMS | คณะและสำนักงานบริหารส่วนกลาง",
  description:
    "สถาปัตยกรรมแห่งปัญญา การบริหารจัดการ และศูนย์บริการดิจิทัลระดับสากล สำหรับนิสิต คณาจารย์ และประชาชน",
};

export default async function PortalHomePage() {
  const tenantId = await getPortalTenantId();

  // Load live data across core modules in parallel
  const [newsItems, programs, resources, rounds] = await Promise.all([
    listNewsArticles(tenantId, { status: "PUBLISHED", limit: 3 }).catch(
      () => [] as NewsArticleDto[]
    ),
    listPrograms(tenantId, { isActive: true }).catch(() => []),
    listResources(tenantId, { isActive: true }).catch(() => []),
    listAdmissionRounds(tenantId, true).catch(() => []),
  ]);

  const latestNews = newsItems.slice(0, 3);
  const featuredPrograms = programs.slice(0, 3);
  const featuredResources = resources.slice(0, 3);
  const activeRounds = rounds.slice(0, 2);

  return (
    <div className="w-full">
      {/* ══════════════════════════════════════════════════════════════════
          1. Summit Hero Section (Full Bleed Edge-to-Edge with Ambient Video)
      ══════════════════════════════════════════════════════════════════ */}
      <SummitHero programsCount={featuredPrograms.length || 12} />

      {/* ══════════════════════════════════════════════════════════════════
          Page Content (Aligned to Max-W-7xl Grid)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-16">
        {/* ══════════════════════════════════════════════════════════════════
            2. Essential Digital Services (Lingua Bridge Service Pillars)
        ══════════════════════════════════════════════════════════════════ */}
        <section id="portal-services" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/80 pb-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 block">
              Campus Ecosystem & Services
            </span>
            <h2 className="text-3xl sm:text-4xl text-foreground font-bold tracking-tight">
              Seamless Access to Academic & Living
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md font-normal leading-relaxed">
            บริการดิจิทัลที่ออกแบบอย่างประณีต เพื่อให้นิสิต คณาจารย์
            และบุคคลภายนอกเข้าถึงได้อย่างรวดเร็วและปลอดภัย
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Admissions */}
          <Link
            href="/admissions"
            className="bg-card rounded-2xl p-7 border border-border/80 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-mono text-muted-foreground/40 font-medium">
                  01
                </span>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                  <GraduationCap className="size-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  รับสมัครนิสิตใหม่ (TCAS)
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 font-normal">
                  ตรวจสอบรอบการรับสมัคร เกณฑ์การคัดเลือก ยื่นใบสมัครออนไลน์
                  และตรวจสอบผลการคัดเลือกทุกรอบ
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-foreground pt-4 border-t border-border/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <span className="tracking-wide">สำรวจรอบรับสมัคร</span>
              <ArrowUpRight className="size-4 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Facilities */}
          <Link
            href="/facilities"
            className="bg-card rounded-2xl p-7 border border-border/80 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-mono text-muted-foreground/40 font-medium">
                  02
                </span>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                  <Building2 className="size-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  จองห้องสัมมนา & ยานพาหนะ
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 font-normal">
                  ค้นหาห้องบรรยาย Smart Classroom และยานพาหนะส่วนกลาง
                  พร้อมระบบตรวจสอบคิวว่างแบบ Real-time
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-foreground pt-4 border-t border-border/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <span className="tracking-wide">ตรวจสอบตารางว่าง</span>
              <ArrowUpRight className="size-4 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Helpdesk */}
          <Link
            href="/helpdesk"
            className="bg-card rounded-2xl p-7 border border-border/80 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-mono text-muted-foreground/40 font-medium">
                  03
                </span>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                  <Wrench className="size-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  แจ้งซ่อม & ศูนย์บริการออนไลน์
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 font-normal">
                  บริการโสตทัศนูปกรณ์ คอมพิวเตอร์ งานอาคารสถานที่
                  และติดตามสถานะงานตามเกณฑ์ SLA อย่างโปร่งใส
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-foreground pt-4 border-t border-border/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <span className="tracking-wide">ส่งคำขอแจ้งซ่อม</span>
              <ArrowUpRight className="size-4 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Programs */}
          <Link
            href="/programs"
            className="bg-card rounded-2xl p-7 border border-border/80 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-mono text-muted-foreground/40 font-medium">
                  04
                </span>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                  <FileCheck className="size-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  หลักสูตรการศึกษามาตรฐานสากล
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 font-normal">
                  หลักสูตรบริหารธุรกิจ บัญชี การตลาด การเงิน และโลจิสติกส์
                  ระดับปริญญาตรี ปริญญาโท และปริญญาเอก
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-foreground pt-4 border-t border-border/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <span className="tracking-wide">ดูหลักสูตรทั้งหมด</span>
              <ArrowUpRight className="size-4 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Personnel */}
          <Link
            href="/personnel"
            className="bg-card rounded-2xl p-7 border border-border/80 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-mono text-muted-foreground/40 font-medium">
                  05
                </span>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                  <Users className="size-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  ทำเนียบคณาจารย์ & ผู้เชี่ยวชาญ
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 font-normal">
                  ค้นหาอาจารย์ประจำสาขา ผลงานทางวิชาการ งานวิจัย
                  และช่องทางการติดต่อประสานงาน
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-foreground pt-4 border-t border-border/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <span className="tracking-wide">ค้นหาคณาจารย์</span>
              <ArrowUpRight className="size-4 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 6: Online Tracking */}
          <Link
            href="/admissions/tracking"
            className="bg-card rounded-2xl p-7 border border-border/80 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-mono text-muted-foreground/40 font-medium">
                  06
                </span>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs">
                  <Search className="size-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  ศูนย์ติดตามผลออนไลน์ 24/7
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 font-normal">
                  ตรวจสอบสถานะใบสมัครนิสิต และติดตามความคืบหน้ารายการแจ้งซ่อม
                  ผ่านระบบหมายเลขอ้างอิง
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-foreground pt-4 border-t border-border/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <span className="tracking-wide">ติดตามคำขอของคุณ</span>
              <ArrowUpRight className="size-4 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. Lingua Bridge Signature Indigo-Slate Academic Banner
             Curated Academic Pathways & Active Admissions Callout
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-indigo-500/25 shadow-2xl space-y-10 text-white">
        {/* Ambient Warm Glow Orbs */}
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-amber-400 block">
              Curated Academic Pathways
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Distinguished Programs of Study
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md font-light leading-relaxed">
            หลักสูตรบริหารจัดการระดับแนวหน้าที่ผสมผสานเทคโนโลยีดิจิทัล
            วิทยาการข้อมูล และภาวะผู้นำเพื่อตอบสนองต่อโลกยุคใหม่
          </p>
        </div>

        {/* Programs Grid + Admissions Card */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Featured Programs (8 Cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {featuredPrograms.map((prog) => (
              <Link
                key={prog.id}
                href={`/programs/${prog.id}`}
                className="bg-white/5 border border-white/10 hover:border-amber-400/50 rounded-2xl p-6 transition-all group backdrop-blur-sm flex flex-col justify-between space-y-6 hover:bg-white/10"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-amber-300 bg-amber-400/15 border border-amber-400/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {prog.degreeTh || prog.level}
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      {prog.totalCredits} cr
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {prog.nameTh}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1 font-light">
                      {prog.nameEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-amber-400 pt-4 border-t border-white/10">
                  <span className="font-light">ดูแผนการศึกษา</span>
                  <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Active Admissions Callout (4 Cols) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-indigo-900/80 to-slate-900/90 border border-amber-400/40 rounded-2xl p-6 sm:p-7 text-white flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden backdrop-blur-md">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-[10px] uppercase tracking-[0.2em] font-semibold text-amber-300">
                <Sparkles className="size-3 text-amber-400" />
                <span>Admissions Sanctuary</span>
              </div>

              <h3 className="text-xl sm:text-2xl text-white font-bold leading-snug">
                เปิดรับสมัครนิสิตใหม่
              </h3>

              {activeRounds.length === 0 ? (
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  ขณะนี้ยังไม่มีรอบการรับสมัครที่เปิดรับ
                  กรุณาติดตามประกาศกำหนดการอย่างเป็นทางการ
                </p>
              ) : (
                <div className="space-y-2.5">
                  {activeRounds.map((round) => (
                    <div
                      key={round.id}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white">
                          {round.roundName}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/15">
                          เปิดรับสมัคร
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-1.5 font-light">
                        <Calendar className="size-3 text-amber-400" />
                        <span>ปิดรับ: {formatDate(round.endDate, "th")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 relative z-10">
              <Link
                href="/admissions/apply"
                className="block text-center w-full py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-amber-500/25 active:scale-95"
              >
                ยื่นใบสมัครออนไลน์ทันที
              </Link>
              <Link
                href="/admissions/tracking"
                className="block text-center w-full py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-white text-xs font-medium transition-all"
              >
                ตรวจสอบสถานะใบสมัคร
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. Campus Spaces & Facilities (Lingua Bridge Style)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 block">
              Spatial Sanctuary
            </span>
            <h2 className="text-3xl sm:text-4xl text-foreground font-bold tracking-tight">
              Spaces Designed for Focus & Collaboration
            </h2>
          </div>
          <Link
            href="/facilities"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <span>ดูสถานที่ทั้งหมด</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredResources.map((res) => (
            <Link
              key={res.id}
              href={`/facilities/${res.id}`}
              className="bg-card rounded-2xl overflow-hidden border border-border/80 group hover:border-indigo-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              {/* Card Photo / Visual Area */}
              <div className="h-48 bg-slate-100 dark:bg-slate-800/80 relative overflow-hidden flex items-center justify-center border-b border-border/60">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent" />
                <div className="text-muted-foreground/40 flex flex-col items-center gap-2 group-hover:scale-105 transition-transform duration-500">
                  <Building2 className="size-10 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[11px] tracking-wider uppercase font-semibold text-muted-foreground">
                    {res.type === "ROOM" ? "Academic Room" : "Campus Vehicle"}
                  </span>
                </div>

                {/* Top Badge: Availability */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                    <span>พร้อมให้บริการ</span>
                  </span>
                </div>

                <div className="absolute bottom-3 right-4 font-mono text-[10px] text-muted-foreground bg-background/90 px-2 py-0.5 rounded border border-border/60">
                  CODE: {res.code}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                    {res.nameTh}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 font-normal">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{res.capacity} ที่นั่ง</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-amber-500" />
                      <span>{res.locationOrPlate}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  <span>สำรวจและจองใช้งาน</span>
                  <ArrowRight className="size-3.5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. Editorial Gazette: Latest News & Announcements
      ══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 block">
              Editorial & Highlights
            </span>
            <h2 className="text-3xl sm:text-4xl text-foreground font-bold tracking-tight">
              Stories, Insights & Campus Life
            </h2>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <span>ดูข่าวสารทั้งหมด</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {latestNews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground bg-muted/30">
            ยังไม่มีข่าวสารเผยแพร่ในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((article: NewsArticleDto) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="bg-card border border-border/80 rounded-2xl overflow-hidden group hover:border-indigo-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                {/* Article Cover */}
                <div className="h-48 bg-slate-100 dark:bg-slate-800/80 relative overflow-hidden">
                  {article.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.coverImageUrl}
                      alt={article.titleTh}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
                      <Sparkles className="size-8 text-amber-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider">ELEVATE JOURNAL</span>
                    </div>
                  )}

                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-50/95 dark:bg-indigo-950/95 text-indigo-700 dark:text-indigo-300 backdrop-blur-md border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs">
                    {article.categoryNameTh}
                  </span>
                </div>

                {/* Article Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                      {article.titleTh}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed font-normal">
                      {article.excerptTh || article.contentTh.slice(0, 120)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/60 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-normal">
                      <Clock className="size-3 text-amber-500" />
                      {formatDate(article.publishedAt || article.createdAt, "th")}
                    </span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 flex items-center gap-1 transition-colors">
                      อ่านต่อ <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. Campus Concierge & Information Hub (Lingua Bridge Contact)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-card rounded-2xl p-8 sm:p-12 border border-border/80 shadow-xs space-y-8">
        <div className="border-b border-border/60 pb-4">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 block">
            Campus Concierge
          </span>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            Faculty Reception & Information Hub
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          {/* Col 1 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <MapPin className="size-4" />
              <span className="text-base font-bold text-foreground">
                Location & Sanctuary
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-normal">
              อาคาร 1 ชั้น 2 คณะวิทยาการจัดการและสำนักงานบริหารส่วนกลาง
              <br />
              มหาวิทยาลัย • 123 ถนนมหาวิทยาลัย แขวง/ตำบล เขต/อำเภอ กรุงเทพมหานคร
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Clock className="size-4" />
              <span className="text-base font-bold text-foreground">
                Reception Hours
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-normal">
              วันจันทร์ – ศุกร์: 08:30 – 16:30 น.
              <br />
              (หยุดทำการวันเสาร์ – อาทิตย์ และวันหยุดนักขัตฤกษ์)
              <br />
              ระบบบริการออนไลน์และแจ้งซ่อมเปิดให้บริการตลอด 24 ชั่วโมง
            </p>
          </div>

          {/* Col 3 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Wrench className="size-4" />
              <span className="text-base font-bold text-foreground">
                Direct Assistance
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-normal">
              งานอาคารสถานที่และยานพาหนะ: โทรภายใน 1234
              <br />
              ศูนย์บริการสารสนเทศและแจ้งซ่อม IT: โทรภายใน 5678
              <br />
              อีเมลติดต่อ: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">contact@fms.ac.th</span>
            </p>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
