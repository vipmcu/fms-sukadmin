import Link from "next/link";
import { LogIn, LayoutDashboard, Sparkles, ArrowUpRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { auth } from "@/features/identity/server";
import { PortalNavClient } from "./_components/portal-nav-client";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth().catch(() => null);

  return (
    <div
      className="min-h-screen flex flex-col bg-[#ede7dc] text-[#16251e] selection:bg-[#c5a059]/30 selection:text-[#16251e]"
      suppressHydrationWarning
    >
      {/* 1. Floating Elevate Pill Header */}
      <header className="sticky top-3 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full" suppressHydrationWarning>
        <div className="glass-nav-elevate rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs border border-[#ded9cb]/80">
          {/* Brand Logo & Monogram */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-[#1e3328] text-[#c5a059] flex items-center justify-center font-serif-luxury text-sm font-bold shadow-xs group-hover:scale-105 transition-transform">
              E
            </div>
            <div>
              <span className="font-serif-luxury font-bold text-sm sm:text-base tracking-tight block text-[#16251e] leading-tight group-hover:text-[#1e3328] transition-colors">
                ELEVATE • FMS
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#55635c] block">
                Faculty & Campus Sanctuary
              </span>
            </div>
          </Link>

          {/* Centered Desktop & Mobile Navigation */}
          <PortalNavClient isLoggedIn={!!session?.user} />

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {session?.user ? (
              <Button asChild size="sm" className="gap-2 rounded-full bg-[#1e3328] hover:bg-[#13221b] text-white text-xs font-semibold uppercase tracking-wider px-4">
                <Link href="/dashboard">
                  <LayoutDashboard className="size-3.5 text-[#c5a059]" />
                  <span className="hidden sm:inline">Admin Console</span>
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="gap-2 rounded-full bg-[#1e3328] hover:bg-[#13221b] text-white text-xs font-semibold uppercase tracking-wider px-5">
                <Link href="/login?callbackUrl=/reservations/calendar">
                  <LogIn className="size-3.5 text-[#c5a059]" />
                  <span>เข้าสู่ระบบ</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* 3. Elevate Signature Dark Emerald Footer (#121c17) */}
      <footer className="dark-emerald-elevate pt-16 pb-12 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Col 1: Brand & Philosophy */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 text-[#c5a059] flex items-center justify-center font-serif-luxury text-lg font-bold border border-white/10">
                  E
                </div>
                <div>
                  <span className="font-serif-luxury font-bold text-lg tracking-tight text-white block">
                    ELEVATE LIVING & LEARNING
                  </span>
                  <span className="text-[10px] tracking-[0.22em] uppercase font-semibold text-[#a0b0a7] block">
                    Faculty of Management Sciences
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#a0b0a7] leading-relaxed max-w-sm">
                ศูนย์กลางการศึกษา นวัตกรรมการบริหารจัดการ และสถาปัตยกรรมแห่งปัญญา
                ที่ผสานความเรียบหรูระดับสากลเข้ากับการให้บริการดิจิทัลครบวงจร
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs text-[#dfbe80]">
                <Sparkles className="size-3.5" />
                <span>Quiet Luxury • Architectural Precision • Academic Excellence</span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#dfbe80]">
                บริการหลัก
              </h4>
              <ul className="space-y-2 text-xs text-[#a0b0a7]">
                <li>
                  <Link href="/admissions" className="hover:text-white transition-colors">
                    รับสมัครนิสิตใหม่ (TCAS)
                  </Link>
                </li>
                <li>
                  <Link href="/facilities" className="hover:text-white transition-colors">
                    ห้องสัมมนา & ยานพาหนะ
                  </Link>
                </li>
                <li>
                  <Link href="/programs" className="hover:text-white transition-colors">
                    หลักสูตร ป.ตรี - โท - เอก
                  </Link>
                </li>
                <li>
                  <Link href="/helpdesk" className="hover:text-white transition-colors">
                    แจ้งซ่อม & ศูนย์บริการ IT
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Online Tracking */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#dfbe80]">
                การติดตามผล & ติดต่อคณะ
              </h4>
              <div className="space-y-2 text-xs text-[#a0b0a7]">
                <p>อาคาร 1 คณะวิทยาการจัดการและสำนักงานบริหารส่วนกลาง</p>
                <p>โทรศัพท์ภายใน: 1234, 5678 • อีเมล: contact@fms.ac.th</p>
                <div className="pt-3 flex items-center gap-3">
                  <Link
                    href="/admissions/tracking"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[11px] transition-all"
                  >
                    <span>ติดตามใบสมัคร</span>
                    <ArrowUpRight className="size-3 text-[#c5a059]" />
                  </Link>
                  <Link
                    href="/helpdesk/tracking"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[11px] transition-all"
                  >
                    <span>ติดตามงานแจ้งซ่อม</span>
                    <ArrowUpRight className="size-3 text-[#c5a059]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#a0b0a7]/80">
            <p>&copy; {new Date().getFullYear()} Faculty of Management Sciences. All rights reserved.</p>
            <p>Elevate Template Aesthetic • Powered by VibeCore</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
