"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Newspaper,
  GraduationCap,
  Users,
  Building2,
  Calendar,
  UserPlus,
  Wrench,
  Search,
  LogIn,
  LayoutDashboard,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/shared/lib/i18n/client";

interface PortalNavClientProps {
  isLoggedIn: boolean;
}

interface NavItem {
  href: string;
  labelTh: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navLinks: NavItem[] = [
  { href: "/", labelTh: "หน้าแรก", labelEn: "Home", icon: Home },
  { href: "/news", labelTh: "ข่าวสาร", labelEn: "News", icon: Newspaper },
  { href: "/programs", labelTh: "หลักสูตร", labelEn: "Programs", icon: GraduationCap },
  { href: "/personnel", labelTh: "บุคลากร", labelEn: "Personnel", icon: Users },
  { href: "/facilities", labelTh: "สถานที่ & รถ", labelEn: "Facilities", icon: Building2 },
  { href: "/facilities/schedule", labelTh: "ตารางการใช้", labelEn: "Schedule", icon: Calendar },
  { href: "/admissions", labelTh: "รับสมัคร", labelEn: "Admissions", icon: UserPlus },
  { href: "/helpdesk", labelTh: "แจ้งซ่อม", labelEn: "Helpdesk", icon: Wrench },
];

export function PortalNavClient({ isLoggedIn }: PortalNavClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const isEn = locale === "en";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Navigation Links */}
      <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          const label = isEn ? link.labelEn : link.labelTh;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 xl:px-3 py-1.5 text-xs xl:text-[13px] font-medium transition-all relative whitespace-nowrap shrink-0 rounded-full ${
                isEn ? "tracking-wider uppercase text-[11px] xl:text-xs" : "tracking-normal"
              } ${
                active
                  ? "text-[#1e3328] font-bold bg-[#1e3328]/5"
                  : "text-[#55635c] hover:text-[#16251e] hover:bg-black/[0.04]"
              }`}
            >
              <span>{label}</span>
              {active && (
                <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-[#c5a059] rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden p-2 rounded-full text-[#55635c] hover:text-[#16251e] hover:bg-[#ded9cb]/50 focus:outline-none"
        aria-label={mobileOpen ? (isEn ? "Close menu" : "ปิดเมนู") : (isEn ? "Open menu" : "เปิดเมนู")}
      >
        {mobileOpen ? <X className="size-5 text-[#16251e]" /> : <Menu className="size-5" />}
      </button>

      {/* Mobile Slide-Down Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-4 top-20 z-50 glass-card-elevate rounded-3xl border border-[#ded9cb] p-6 shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <div className="space-y-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ded9cb]/60 pb-3">
              <span className="font-serif-luxury font-bold text-sm text-[#16251e]">
                {isEn ? "NAVIGATION • ELEVATE" : "เมนูนำทาง • ELEVATE"}
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-full text-[#55635c] hover:text-[#16251e]"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                const label = isEn ? link.labelEn : link.labelTh;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all ${
                      active
                        ? "bg-[#1e3328] text-white"
                        : "text-[#16251e] hover:bg-[#ded9cb]/40"
                    }`}
                  >
                    <Icon className={`size-4 ${active ? "text-[#c5a059]" : "text-[#55635c]"}`} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Tracking Services */}
            <div className="pt-3 border-t border-[#ded9cb]/60 space-y-2">
              <div className="text-[10px] font-semibold text-[#55635c] uppercase tracking-[0.2em] px-2">
                {isEn ? "Online Tracking Services" : "บริการติดตามผลออนไลน์"}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                <Link
                  href="/admissions/tracking"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-[#16251e] hover:bg-[#ded9cb]/40 border border-[#ded9cb]/60"
                >
                  <span className="flex items-center gap-2">
                    <Search className="size-3.5 text-[#c5a059]" />
                    <span>{isEn ? "Track TCAS Admission" : "ติดตามใบสมัคร TCAS"}</span>
                  </span>
                  <ArrowUpRight className="size-3 text-[#55635c]" />
                </Link>
                <Link
                  href="/helpdesk/tracking"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-[#16251e] hover:bg-[#ded9cb]/40 border border-[#ded9cb]/60"
                >
                  <span className="flex items-center gap-2">
                    <Search className="size-3.5 text-[#c5a059]" />
                    <span>{isEn ? "Track Service Ticket" : "ติดตามงานแจ้งซ่อม"}</span>
                  </span>
                  <ArrowUpRight className="size-3 text-[#55635c]" />
                </Link>
              </div>
            </div>

            {/* User Login Action in Drawer */}
            <div className="pt-2">
              {isLoggedIn ? (
                <Button asChild size="sm" className="w-full justify-center gap-2 rounded-full bg-[#1e3328] hover:bg-[#13221b] text-white">
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard className="size-4 text-[#c5a059]" />
                    <span>Admin Console</span>
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="w-full justify-center gap-2 rounded-full bg-[#1e3328] hover:bg-[#13221b] text-white">
                  <Link href="/login?callbackUrl=/reservations/calendar" onClick={() => setMobileOpen(false)}>
                    <LogIn className="size-4 text-[#c5a059]" />
                    <span>{isEn ? "Staff Sign In" : "เข้าสู่ระบบบุคลากร"}</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
