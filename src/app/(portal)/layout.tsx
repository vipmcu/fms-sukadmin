import Link from "next/link";
import {
  LogIn,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
  Building2,
  Wrench,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { auth, resolveTenantBranding } from "@/features/identity/server";
import { getLocale } from "@/i18n/server";
import { PortalNavClient } from "./_components/portal-nav-client";
import { PortalUserMenu } from "./_components/portal-user-menu";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const [session, branding, locale] = await Promise.all([
    auth().catch(() => null),
    resolveTenantBranding(),
    getLocale(),
  ]);
  const isEn = locale === "en";

  const brandName = locale === "en"
    ? (branding.nameEn || branding.nameTh || "ELEVATE • FMS")
    : (branding.nameTh || branding.nameEn || "ELEVATE • FMS");

  const brandTagline = locale === "en"
    ? (branding.nameTh && branding.nameTh !== branding.nameEn ? branding.nameTh : "Faculty & Campus Sanctuary")
    : (branding.nameEn && branding.nameEn !== branding.nameTh ? branding.nameEn : "Faculty & Campus Sanctuary");

  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : null;

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50/90 dark:bg-slate-950 text-foreground selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-200"
      suppressHydrationWarning
    >
      {/* Skip to Main Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {isEn ? "Skip to main content" : "ข้ามไปยังเนื้อหาหลัก"}
      </a>

      {/* Admin-styled Sticky Full-Width Header */}
      <header
        role="banner"
        aria-label={isEn ? "Site header" : "แถบนำทางส่วนหัวเว็บไซต์"}
        className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md shadow-xs text-foreground transition-colors"
        suppressHydrationWarning
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Monogram (Admin Style) */}
          <Link
            href="/"
            aria-label={isEn ? `${brandName} homepage` : `หน้าแรก ${brandName}`}
            className="flex items-center gap-3 group shrink-0 min-w-0 max-w-[220px] sm:max-w-[280px] xl:max-w-[320px]"
          >
            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden shrink-0 group-hover:opacity-90 transition-opacity">
              {branding.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.logoUrl} alt={brandName} className="w-full h-full object-contain" />
              ) : (
                branding.nameEn?.[0] || "F"
              )}
            </div>
            <div className="min-w-0">
              <b className="block text-sm sm:text-base font-bold tracking-tight text-foreground leading-tight truncate">
                {brandName}
              </b>
              <span className="block text-xs text-muted-foreground truncate">
                {brandTagline}
              </span>
            </div>
          </Link>

          {/* Centered Desktop & Mobile Navigation with Right Actions */}
          <PortalNavClient
            user={user}
            rightActions={
              <>
                <ThemeToggle />
                <LanguageSwitcher />

                {user ? (
                  <PortalUserMenu user={user} />
                ) : (
                  <Button asChild size="sm" className="gap-2 shrink-0 rounded-md">
                    <Link
                      href="/login?callbackUrl=/reservations/calendar"
                      aria-label={isEn ? "Sign in to system" : "เข้าสู่ระบบบุคลากร"}
                    >
                      <LogIn className="size-4" />
                      <span>{isEn ? "Sign In" : "เข้าสู่ระบบ"}</span>
                    </Link>
                  </Button>
                )}
              </>
            }
          />
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main
        id="main-content"
        role="main"
        aria-label={isEn ? "Main content" : "เนื้อหาหลัก"}
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none"
      >
        {children}
      </main>

      {/* 3. Modern Theme-Harmonized Footer */}
      <footer
        role="contentinfo"
        aria-label={isEn ? "Site footer" : "ข้อมูลส่วนท้ายเว็บไซต์"}
        className="mt-24 border-t border-border/80 bg-background/80 backdrop-blur-md text-foreground transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
          {/* Top Feature Highlight Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-6 rounded-2xl bg-card/60 border border-border/70 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {isEn ? "TCAS Admissions" : "รับสมัครนิสิตใหม่"}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isEn ? "Online applications & status tracking" : "ยื่นใบสมัครและติดตามผลออนไลน์"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Building2 className="size-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {isEn ? "Campus Facilities" : "สถานที่และยานพาหนะ"}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isEn ? "Room & vehicle reservation system" : "จองห้องสัมมนาและรถยนต์ส่วนกลาง"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Wrench className="size-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {isEn ? "SLA Helpdesk" : "ศูนย์แจ้งซ่อมออนไลน์"}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isEn ? "Fast maintenance with SLA guarantee" : "รับเรื่องและแก้ปัญหาตามกรอบ SLA"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {isEn ? "Data Protection" : "ความปลอดภัยและ PDPA"}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isEn ? "Privacy masking & secure systems" : "คุ้มครองข้อมูลส่วนบุคคลระดับมาตรฐาน"}
                </p>
              </div>
            </div>
          </div>

          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Col 1: Brand & Philosophy */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden shrink-0">
                  {branding.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={branding.logoUrl} alt={brandName} className="w-full h-full object-contain" />
                  ) : (
                    branding.nameEn?.[0] || "F"
                  )}
                </div>
                <div>
                  <span className="font-bold text-base tracking-tight text-foreground block">
                    {brandName}
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    {brandTagline}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                {isEn
                  ? "Center of academic excellence, management innovation, and integrated digital services for students, faculty, and the public."
                  : "ศูนย์กลางการศึกษา นวัตกรรมการบริหารจัดการ และสถาปัตยกรรมแห่งปัญญา ที่ผสานความทันสมัยเข้ากับการให้บริการดิจิทัลครบวงจร"}
              </p>

              {/* Status Indicator */}
              <div className="pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{isEn ? "All Systems Operational" : "ระบบให้บริการตามปกติ"}</span>
                </div>
              </div>
            </div>

            {/* Col 2: Academics */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {isEn ? "Academics & Admissions" : "การศึกษา & รับสมัคร"}
              </h4>
              <nav aria-label={isEn ? "Footer academic links" : "ลิงก์การศึกษาและรับสมัคร"}>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li>
                    <Link href="/admissions" className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5">
                      <ChevronRight className="size-3 text-muted-foreground/60" />
                      <span>{isEn ? "New Student Admissions (TCAS)" : "รับสมัครนิสิตใหม่ (TCAS)"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/admissions/tracking" className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5">
                      <ChevronRight className="size-3 text-muted-foreground/60" />
                      <span>{isEn ? "Track Application Status" : "ติดตามสถานะใบสมัครออนไลน์"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/programs" className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5">
                      <ChevronRight className="size-3 text-muted-foreground/60" />
                      <span>{isEn ? "Academic Programs" : "หลักสูตรระดับ ป.ตรี - โท - เอก"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/news" className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5">
                      <ChevronRight className="size-3 text-muted-foreground/60" />
                      <span>{isEn ? "News & Announcements" : "ข่าวสารและประกาศคณะ"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/personnel" className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5">
                      <ChevronRight className="size-3 text-muted-foreground/60" />
                      <span>{isEn ? "Faculty & Staff Directory" : "ทำเนียบคณาจารย์และบุคลากร"}</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Col 3: Services & Facilities */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {isEn ? "Campus Services" : "บริการและสถานที่"}
              </h4>
              <nav aria-label={isEn ? "Footer campus services" : "ลิงก์บริการและสถานที่"}>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li>
                    <Link href="/facilities" className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5">
                      <ChevronRight className="size-3 text-muted-foreground/60" />
                      <span>{isEn ? "Conference Rooms" : "ห้องประชุมและสัมมนา"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/facilities/schedule" className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5">
                      <ChevronRight className="size-3 text-muted-foreground/60" />
                      <span>{isEn ? "Reservation Calendar" : "ปฏิทินการใช้ห้องและรถ"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/helpdesk" className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5">
                      <ChevronRight className="size-3 text-muted-foreground/60" />
                      <span>{isEn ? "IT & Facility Helpdesk" : "แจ้งซ่อมบำรุงออนไลน์"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/helpdesk/tracking" className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5">
                      <ChevronRight className="size-3 text-muted-foreground/60" />
                      <span>{isEn ? "Track Service Ticket" : "ติดตามงานแจ้งซ่อม"}</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Col 4: Contact & Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {isEn ? "Contact & Support" : "ติดต่อและบริการด่วน"}
              </h4>
              <div className="space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{isEn ? "Building 1, Faculty of Management Sciences" : "อาคาร 1 คณะวิทยาการจัดการและสำนักงานบริหาร"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-primary shrink-0" />
                  <span>โทร 0-2xxx-xxxx ต่อ 1234, 5678</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-primary shrink-0" />
                  <span>contact@fms.ac.th</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-primary shrink-0" />
                  <span>{isEn ? "Mon - Fri: 08:30 - 16:30" : "จันทร์ - ศุกร์: 08:30 - 16:30 น."}</span>
                </div>

                {/* Quick Action Badges */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <Link
                    href="/admissions/tracking"
                    aria-label={isEn ? "Track TCAS admission application" : "ติดตามผลการสมัครนิสิต TCAS"}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-medium border border-primary/20 transition-all shadow-2xs"
                  >
                    <span>{isEn ? "Track TCAS" : "ติดตามใบสมัคร"}</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                  <Link
                    href="/helpdesk/tracking"
                    aria-label={isEn ? "Track maintenance service ticket" : "ติดตามสถานะงานแจ้งซ่อม"}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-medium border border-primary/20 transition-all shadow-2xs"
                  >
                    <span>{isEn ? "Track Helpdesk" : "ติดตามงานซ่อม"}</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                  <Link
                    href="/login?callbackUrl=/dashboard"
                    aria-label={isEn ? "Staff Console" : "ระบบเจ้าหน้าที่"}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-[11px] font-medium border border-border/80 transition-all shadow-2xs"
                  >
                    <LogIn className="size-3 text-muted-foreground" />
                    <span>{isEn ? "Staff Login" : "เข้าสู่ระบบ"}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Footer Divider & Copyright */}
          <div className="pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} {brandName}. {isEn ? "All rights reserved." : "สงวนลิขสิทธิ์ทั้งหมด"}
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
              <span className="hover:text-foreground cursor-pointer transition-colors">
                {isEn ? "Privacy Policy" : "นโยบายคุ้มครองข้อมูลส่วนบุคคล"}
              </span>
              <span>•</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">
                {isEn ? "Terms of Service" : "ข้อกำหนดการใช้งาน"}
              </span>
              <span>•</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">
                {isEn ? "Accessibility" : "การเข้าถึงข้อมูล (WCAG)"}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5">
              <Sparkles className="size-3 text-primary" />
              <span>Institutional Digital Platform • Powered by VibeCore</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
