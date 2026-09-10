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
    <div className="space-y-24 py-4">
      {/* ══════════════════════════════════════════════════════════════════
          1. Hero Architectural Sanctuary & Floating Specs Dock
      ══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-8 pt-4 sm:pt-8">
        {/* Top Header Group */}
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Elevate Kicker Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f7f5ef] border border-[#c5a059]/40 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase text-[#16251e]">
              Elevating Academic Excellence & Campus Sanctuary
            </span>
          </div>

          {/* Large Editorial Serif Headline */}
          <h1 className="font-serif-luxury text-4xl sm:text-6xl lg:text-7xl font-normal text-[#16251e] tracking-tight leading-[1.08]">
            Architectural Sanctuary of Learning & Digital Innovation
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#55635c] max-w-2xl mx-auto font-light leading-relaxed">
            ศูนย์กลางการศึกษา วิจัย นวัตกรรมการบริหารจัดการ และการให้บริการดิจิทัลครบวงจร
            ผสานสุนทรียภาพแห่งความสงบเข้ากับมาตรฐานการบริการระดับสากล
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#1e3328] hover:bg-[#13221b] text-white text-xs sm:text-sm font-medium tracking-wide shadow-md transition-all hover:scale-[1.02]"
            >
              <GraduationCap className="size-4 text-[#c5a059]" />
              <span>สมัครเข้าศึกษา (TCAS)</span>
              <ArrowUpRight className="size-3.5 text-[#c5a059]" />
            </Link>

            <Link
              href="/facilities"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-[#c5a059] hover:bg-[#c5a059]/10 text-[#16251e] text-xs sm:text-sm font-medium tracking-wide transition-all"
            >
              <Building2 className="size-4 text-[#1e3328]" />
              <span>จองห้องและยานพาหนะ</span>
            </Link>

            <Link
              href="/helpdesk"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-medium text-[#55635c] hover:text-[#16251e] hover:bg-[#ded9cb]/50 transition-all"
            >
              <Wrench className="size-3.5 text-[#c5a059]" />
              <span>แจ้งซ่อม/บริการออนไลน์</span>
            </Link>
          </div>
        </div>

        {/* Cinematic Architectural Frame */}
        <div className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden border border-[#ded9cb] shadow-2xl bg-[#16251e] aspect-[16/9] sm:aspect-[21/9] max-h-[520px]">
          {/* Architectural Background Photography */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop"
            alt="Faculty Campus Architecture"
            className="w-full h-full object-cover object-center opacity-90 transition-transform duration-1000 hover:scale-105"
          />

          {/* Sophisticated Dark Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121c17]/90 via-[#121c17]/30 to-transparent" />

          {/* Top Left Floating Tag */}
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
            <span className="glass-nav-elevate px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase font-semibold text-[#16251e] shadow-xs">
              BANGKOK CAMPUS • SANCTUARY OF WISDOM
            </span>
          </div>

          {/* Bottom Caption */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#dfbe80]">
                FACULTY OF MANAGEMENT SCIENCES
              </p>
              <h2 className="font-serif-luxury text-xl sm:text-3xl font-normal text-[#ede7dc]">
                Smart Hybrid Learning & Governance
              </h2>
            </div>
            <div className="text-xs text-[#a0b0a7] font-light hidden sm:block">
              มาตรฐานสิ่งแวดล้อมเพื่อการเรียนรู้ระดับนานาชาติ
            </div>
          </div>
        </div>

        {/* Elevate Signature Floating Specs Dock */}
        <div className="glass-card-elevate rounded-3xl p-6 sm:p-8 border border-[#ded9cb] grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#ded9cb]/60 -mt-6 relative z-10">
          {/* 01: Campus Scale */}
          <div className="space-y-1.5 pt-2 sm:pt-0">
            <span className="text-[10px] tracking-[0.2em] font-semibold text-[#c5a059] uppercase block">
              01 / Campus Scale
            </span>
            <div className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#16251e]">
              45,000 <span className="text-xs font-sans font-normal text-[#55635c]">SQ.M.</span>
            </div>
            <p className="text-xs text-[#55635c] font-light leading-relaxed">
              พื้นที่การเรียนรู้ วิจัย และพื้นที่สีเขียวเพื่อสุขภาวะ
            </p>
          </div>

          {/* 02: Digital Infra */}
          <div className="space-y-1.5 pt-2 sm:pt-0 sm:pl-6 lg:pl-8">
            <span className="text-[10px] tracking-[0.2em] font-semibold text-[#c5a059] uppercase block">
              02 / Digital Infra
            </span>
            <div className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#16251e]">
              100% <span className="text-xs font-sans font-normal text-[#55635c]">SMART HYBRID</span>
            </div>
            <p className="text-xs text-[#55635c] font-light leading-relaxed">
              ห้องเรียนอัจฉริยะ จองสถานที่ออนไลน์ และติดตามงาน SLA
            </p>
          </div>

          {/* 03: Faculty Talent */}
          <div className="space-y-1.5 pt-4 sm:pt-0 sm:pl-6 lg:pl-8">
            <span className="text-[10px] tracking-[0.2em] font-semibold text-[#c5a059] uppercase block">
              03 / Faculty Talent
            </span>
            <div className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#16251e]">
              120+ <span className="text-xs font-sans font-normal text-[#55635c]">RESEARCHERS</span>
            </div>
            <p className="text-xs text-[#55635c] font-light leading-relaxed">
              คณาจารย์ผู้ทรงคุณวุฒิระดับสากลและผู้เชี่ยวชาญ
            </p>
          </div>

          {/* 04: Graduate Career */}
          <div className="space-y-1.5 pt-4 sm:pt-0 sm:pl-6 lg:pl-8">
            <span className="text-[10px] tracking-[0.2em] font-semibold text-[#c5a059] uppercase block">
              04 / Graduate Career
            </span>
            <div className="font-serif-luxury text-2xl sm:text-3xl font-normal text-[#16251e]">
              98.4% <span className="text-xs font-sans font-normal text-[#55635c]">EMPLOYMENT</span>
            </div>
            <p className="text-xs text-[#55635c] font-light leading-relaxed">
              อัตราการได้งานทำและความพร้อมในระดับนานาชาติ
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. Essential Digital Services (Spatial & Service Pillars)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#ded9cb] pb-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#c5a059] block">
              Campus Ecosystem & Services
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#16251e] font-normal tracking-tight">
              Seamless Access to Academic & Living
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#55635c] max-w-md font-light leading-relaxed">
            บริการดิจิทัลที่ออกแบบอย่างประณีต เพื่อให้นิสิต คณาจารย์
            และบุคคลภายนอกเข้าถึงได้อย่างรวดเร็วและปลอดภัย
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Admissions */}
          <Link
            href="/admissions"
            className="glass-card-elevate rounded-3xl p-8 border border-[#ded9cb] hover:border-[#c5a059]/60 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif-luxury text-2xl text-[#c5a059]/70 font-light">
                  01
                </span>
                <div className="w-10 h-10 rounded-full bg-[#1e3328]/10 text-[#1e3328] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1e3328] group-hover:text-white transition-all">
                  <GraduationCap className="size-5" />
                </div>
              </div>
              <div>
                <h3 className="font-serif-luxury text-xl text-[#16251e] group-hover:text-[#1e3328] transition-colors">
                  รับสมัครนิสิตใหม่ (TCAS)
                </h3>
                <p className="text-xs text-[#55635c] leading-relaxed mt-2 font-light">
                  ตรวจสอบรอบการรับสมัคร เกณฑ์การคัดเลือก ยื่นใบสมัครออนไลน์
                  และตรวจสอบผลการคัดเลือกทุกรอบ
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-[#1e3328] pt-4 border-t border-[#ded9cb]/60">
              <span className="tracking-wide">สำรวจรอบรับสมัคร</span>
              <ArrowUpRight className="size-4 text-[#c5a059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Facilities */}
          <Link
            href="/facilities"
            className="glass-card-elevate rounded-3xl p-8 border border-[#ded9cb] hover:border-[#c5a059]/60 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif-luxury text-2xl text-[#c5a059]/70 font-light">
                  02
                </span>
                <div className="w-10 h-10 rounded-full bg-[#1e3328]/10 text-[#1e3328] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1e3328] group-hover:text-white transition-all">
                  <Building2 className="size-5" />
                </div>
              </div>
              <div>
                <h3 className="font-serif-luxury text-xl text-[#16251e] group-hover:text-[#1e3328] transition-colors">
                  จองห้องสัมมนา & ยานพาหนะ
                </h3>
                <p className="text-xs text-[#55635c] leading-relaxed mt-2 font-light">
                  ค้นหาห้องบรรยาย Smart Classroom และยานพาหนะส่วนกลาง
                  พร้อมระบบตรวจสอบคิวว่างแบบ Real-time
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-[#1e3328] pt-4 border-t border-[#ded9cb]/60">
              <span className="tracking-wide">ตรวจสอบตารางว่าง</span>
              <ArrowUpRight className="size-4 text-[#c5a059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Helpdesk */}
          <Link
            href="/helpdesk"
            className="glass-card-elevate rounded-3xl p-8 border border-[#ded9cb] hover:border-[#c5a059]/60 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif-luxury text-2xl text-[#c5a059]/70 font-light">
                  03
                </span>
                <div className="w-10 h-10 rounded-full bg-[#1e3328]/10 text-[#1e3328] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1e3328] group-hover:text-white transition-all">
                  <Wrench className="size-5" />
                </div>
              </div>
              <div>
                <h3 className="font-serif-luxury text-xl text-[#16251e] group-hover:text-[#1e3328] transition-colors">
                  แจ้งซ่อม & ศูนย์บริการออนไลน์
                </h3>
                <p className="text-xs text-[#55635c] leading-relaxed mt-2 font-light">
                  บริการโสตทัศนูปกรณ์ คอมพิวเตอร์ งานอาคารสถานที่
                  และติดตามสถานะงานตามเกณฑ์ SLA อย่างโปร่งใส
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-[#1e3328] pt-4 border-t border-[#ded9cb]/60">
              <span className="tracking-wide">ส่งคำขอแจ้งซ่อม</span>
              <ArrowUpRight className="size-4 text-[#c5a059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Programs */}
          <Link
            href="/programs"
            className="glass-card-elevate rounded-3xl p-8 border border-[#ded9cb] hover:border-[#c5a059]/60 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif-luxury text-2xl text-[#c5a059]/70 font-light">
                  04
                </span>
                <div className="w-10 h-10 rounded-full bg-[#1e3328]/10 text-[#1e3328] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1e3328] group-hover:text-white transition-all">
                  <FileCheck className="size-5" />
                </div>
              </div>
              <div>
                <h3 className="font-serif-luxury text-xl text-[#16251e] group-hover:text-[#1e3328] transition-colors">
                  หลักสูตรการศึกษามาตรฐานสากล
                </h3>
                <p className="text-xs text-[#55635c] leading-relaxed mt-2 font-light">
                  หลักสูตรบริหารธุรกิจ บัญชี การตลาด การเงิน และโลจิสติกส์
                  ระดับปริญญาตรี ปริญญาโท และปริญญาเอก
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-[#1e3328] pt-4 border-t border-[#ded9cb]/60">
              <span className="tracking-wide">ดูหลักสูตรทั้งหมด</span>
              <ArrowUpRight className="size-4 text-[#c5a059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Personnel */}
          <Link
            href="/personnel"
            className="glass-card-elevate rounded-3xl p-8 border border-[#ded9cb] hover:border-[#c5a059]/60 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif-luxury text-2xl text-[#c5a059]/70 font-light">
                  05
                </span>
                <div className="w-10 h-10 rounded-full bg-[#1e3328]/10 text-[#1e3328] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1e3328] group-hover:text-white transition-all">
                  <Users className="size-5" />
                </div>
              </div>
              <div>
                <h3 className="font-serif-luxury text-xl text-[#16251e] group-hover:text-[#1e3328] transition-colors">
                  ทำเนียบคณาจารย์ & ผู้เชี่ยวชาญ
                </h3>
                <p className="text-xs text-[#55635c] leading-relaxed mt-2 font-light">
                  ค้นหาอาจารย์ประจำสาขา ผลงานทางวิชาการ งานวิจัย
                  และช่องทางการติดต่อประสานงาน
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-[#1e3328] pt-4 border-t border-[#ded9cb]/60">
              <span className="tracking-wide">ค้นหาคณาจารย์</span>
              <ArrowUpRight className="size-4 text-[#c5a059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 6: Online Tracking */}
          <Link
            href="/admissions/tracking"
            className="glass-card-elevate rounded-3xl p-8 border border-[#ded9cb] hover:border-[#c5a059]/60 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif-luxury text-2xl text-[#c5a059]/70 font-light">
                  06
                </span>
                <div className="w-10 h-10 rounded-full bg-[#1e3328]/10 text-[#1e3328] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1e3328] group-hover:text-white transition-all">
                  <Search className="size-5" />
                </div>
              </div>
              <div>
                <h3 className="font-serif-luxury text-xl text-[#16251e] group-hover:text-[#1e3328] transition-colors">
                  ศูนย์ติดตามผลออนไลน์ 24/7
                </h3>
                <p className="text-xs text-[#55635c] leading-relaxed mt-2 font-light">
                  ตรวจสอบสถานะใบสมัครนิสิต และติดตามความคืบหน้ารายการแจ้งซ่อม
                  ผ่านระบบหมายเลขอ้างอิง
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-[#1e3328] pt-4 border-t border-[#ded9cb]/60">
              <span className="tracking-wide">ติดตามคำขอของคุณ</span>
              <ArrowUpRight className="size-4 text-[#c5a059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. Elevate Signature Dark Emerald Section (#121c17)
             Curated Academic Pathways & Active Admissions Callout
      ══════════════════════════════════════════════════════════════════ */}
      <section className="dark-emerald-elevate rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-[#c5a059]/25 shadow-2xl space-y-10">
        {/* Subtle Ambient Golden Glow Orbs */}
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-[#1e3328]/40 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#dfbe80] block">
              Curated Academic Pathways
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-normal text-white tracking-tight">
              Distinguished Programs of Study
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#a0b0a7] max-w-md font-light leading-relaxed">
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
                className="bg-white/5 border border-white/10 hover:border-[#c5a059]/50 rounded-2xl p-6 transition-all group backdrop-blur-sm flex flex-col justify-between space-y-6 hover:bg-white/10"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#dfbe80] bg-[#c5a059]/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {prog.degreeTh || prog.level}
                    </span>
                    <span className="text-xs text-[#a0b0a7] font-mono">
                      {prog.totalCredits} cr
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif-luxury text-lg text-white group-hover:text-[#dfbe80] transition-colors leading-snug">
                      {prog.nameTh}
                    </h3>
                    <p className="text-xs text-[#a0b0a7] line-clamp-2 mt-1 font-light">
                      {prog.nameEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#dfbe80] pt-4 border-t border-white/10">
                  <span className="font-light">ดูแผนการศึกษา</span>
                  <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Active Admissions Callout (4 Cols) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-[#1e3328] to-[#121c17] border border-[#c5a059]/40 rounded-2xl p-6 sm:p-7 text-white flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/30 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#dfbe80]">
                <Sparkles className="size-3 text-[#c5a059]" />
                <span>Admissions Sanctuary</span>
              </div>

              <h3 className="font-serif-luxury text-xl sm:text-2xl text-white font-normal leading-snug">
                เปิดรับสมัครนิสิตใหม่
              </h3>

              {activeRounds.length === 0 ? (
                <p className="text-xs text-[#a0b0a7] font-light leading-relaxed">
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
                        <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10">
                          เปิดรับสมัคร
                        </span>
                      </div>
                      <div className="text-[11px] text-[#a0b0a7] flex items-center gap-1.5 font-light">
                        <Calendar className="size-3 text-[#c5a059]" />
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
                className="block text-center w-full py-3 rounded-full bg-[#c5a059] hover:bg-[#dfbe80] text-[#121c17] text-xs font-semibold uppercase tracking-wider transition-all shadow-md"
              >
                ยื่นใบสมัครออนไลน์ทันที
              </Link>
              <Link
                href="/admissions/tracking"
                className="block text-center w-full py-2.5 rounded-full border border-white/20 hover:bg-white/5 text-white text-xs font-medium transition-all"
              >
                ตรวจสอบสถานะใบสมัคร
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. Architectural Spaces & Campus Facilities
      ══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#ded9cb] pb-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#c5a059] block">
              Spatial Sanctuary
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#16251e] font-normal tracking-tight">
              Spaces Designed for Focus & Collaboration
            </h2>
          </div>
          <Link
            href="/facilities"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] font-medium text-[#1e3328] hover:text-[#c5a059] transition-colors"
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
              className="glass-card-elevate rounded-3xl overflow-hidden border border-[#ded9cb] group hover:border-[#c5a059]/60 hover:shadow-xl transition-all flex flex-col justify-between"
            >
              {/* Card Photo / Aesthetic Visual Area */}
              <div className="h-48 bg-[#ede7dc] relative overflow-hidden flex items-center justify-center border-b border-[#ded9cb]/60">
                {/* Clean minimalist architectural icon background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1e3328]/10 to-transparent" />
                <div className="text-[#1e3328]/40 flex flex-col items-center gap-2 group-hover:scale-105 transition-transform duration-500">
                  <Building2 className="size-10 text-[#c5a059]" />
                  <span className="text-[11px] font-serif-luxury tracking-wider uppercase text-[#16251e]/60">
                    {res.type === "ROOM" ? "Academic Room" : "Campus Vehicle"}
                  </span>
                </div>

                {/* Top Badge: Availability */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#f7f5ef]/90 text-[#1e3328] backdrop-blur-md border border-[#ded9cb] shadow-xs flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    <span>พร้อมให้บริการ</span>
                  </span>
                </div>

                <div className="absolute bottom-3 right-4 font-mono text-[10px] text-[#55635c] bg-[#ede7dc]/80 px-2 py-0.5 rounded">
                  CODE: {res.code}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif-luxury text-lg text-[#16251e] group-hover:text-[#1e3328] transition-colors leading-snug">
                    {res.nameTh}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-[#55635c] pt-3 font-light">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-[#c5a059]" />
                      <span>{res.capacity} ที่นั่ง</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-[#c5a059]" />
                      <span>{res.locationOrPlate}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#ded9cb]/60 text-xs font-medium text-[#1e3328]">
                  <span>สำรวจและจองใช้งาน</span>
                  <ArrowRight className="size-3.5 text-[#c5a059] group-hover:translate-x-1 transition-transform" />
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#ded9cb] pb-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#c5a059] block">
              Editorial & Highlights
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#16251e] font-normal tracking-tight">
              Stories, Insights & Campus Life
            </h2>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] font-medium text-[#1e3328] hover:text-[#c5a059] transition-colors"
          >
            <span>ดูข่าวสารทั้งหมด</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {latestNews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#ded9cb] p-12 text-center text-sm text-[#55635c] bg-[#f7f5ef]">
            ยังไม่มีข่าวสารเผยแพร่ในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((article: NewsArticleDto) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="bg-[#f7f5ef] border border-[#ded9cb] rounded-3xl overflow-hidden group hover:border-[#c5a059]/50 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                {/* Article Cover */}
                <div className="h-48 bg-[#ede7dc] relative overflow-hidden">
                  {article.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.coverImageUrl}
                      alt={article.titleTh}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#55635c]/50 gap-2">
                      <Sparkles className="size-8 text-[#c5a059]" />
                      <span className="text-xs font-serif-luxury">ELEVATE JOURNAL</span>
                    </div>
                  )}

                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#f7f5ef]/95 text-[#1e3328] backdrop-blur-md border border-[#ded9cb] shadow-xs">
                    {article.categoryNameTh}
                  </span>
                </div>

                {/* Article Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif-luxury text-lg sm:text-xl text-[#16251e] group-hover:text-[#1e3328] transition-colors line-clamp-2 leading-snug">
                      {article.titleTh}
                    </h3>
                    <p className="text-xs text-[#55635c] line-clamp-2 mt-2 leading-relaxed font-light">
                      {article.excerptTh || article.contentTh.slice(0, 120)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#ded9cb]/60 text-[11px] text-[#55635c]">
                    <span className="flex items-center gap-1.5 font-light">
                      <Clock className="size-3 text-[#c5a059]" />
                      {formatDate(article.publishedAt || article.createdAt, "th")}
                    </span>
                    <span className="font-medium text-[#1e3328] group-hover:text-[#c5a059] flex items-center gap-1 transition-colors">
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
          6. Campus Concierge & Quiet Luxury Contact Card
      ══════════════════════════════════════════════════════════════════ */}
      <section className="glass-card-elevate rounded-3xl p-8 sm:p-12 border border-[#ded9cb] space-y-8">
        <div className="border-b border-[#ded9cb]/60 pb-4">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#c5a059] block">
            Campus Concierge
          </span>
          <h3 className="font-serif-luxury text-2xl text-[#16251e] font-normal mt-1">
            Faculty Reception & Information Hub
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          {/* Col 1 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[#1e3328]">
              <MapPin className="size-4 text-[#c5a059]" />
              <span className="font-serif-luxury text-base text-[#16251e]">
                Location & Sanctuary
              </span>
            </div>
            <p className="text-xs text-[#55635c] leading-relaxed font-light">
              อาคาร 1 ชั้น 2 คณะวิทยาการจัดการและสำนักงานบริหารส่วนกลาง
              <br />
              มหาวิทยาลัย • 123 ถนนมหาวิทยาลัย แขวง/ตำบล เขต/อำเภอ กรุงเทพมหานคร
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[#1e3328]">
              <Clock className="size-4 text-[#c5a059]" />
              <span className="font-serif-luxury text-base text-[#16251e]">
                Reception Hours
              </span>
            </div>
            <p className="text-xs text-[#55635c] leading-relaxed font-light">
              วันจันทร์ – ศุกร์: 08:30 – 16:30 น.
              <br />
              (หยุดทำการวันเสาร์ – อาทิตย์ และวันหยุดนักขัตฤกษ์)
              <br />
              ระบบบริการออนไลน์และแจ้งซ่อมเปิดให้บริการตลอด 24 ชั่วโมง
            </p>
          </div>

          {/* Col 3 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[#1e3328]">
              <Wrench className="size-4 text-[#c5a059]" />
              <span className="font-serif-luxury text-base text-[#16251e]">
                Direct Assistance
              </span>
            </div>
            <p className="text-xs text-[#55635c] leading-relaxed font-light">
              งานอาคารสถานที่และยานพาหนะ: โทรภายใน 1234
              <br />
              ศูนย์บริการสารสนเทศและแจ้งซ่อม IT: โทรภายใน 5678
              <br />
              อีเมลติดต่อ: <span className="font-mono text-[#1e3328]">contact@fms.ac.th</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
