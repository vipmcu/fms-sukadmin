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
import { cn } from "@/shared/lib/utils";

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
      {/* Desktop Navigation Links (Admin Style) */}
      <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          const label = isEn ? link.labelEn : link.labelTh;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 text-xs xl:text-sm font-medium transition-colors rounded-md whitespace-nowrap shrink-0",
                active
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
            >
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Hamburger Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden text-muted-foreground hover:text-foreground"
        aria-label={mobileOpen ? (isEn ? "Close menu" : "ปิดเมนู") : (isEn ? "Open menu" : "เปิดเมนู")}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Mobile Slide-Down Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-4 top-18 z-50 rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-sm text-foreground">
                {isEn ? "Navigation" : "เมนูนำทาง"}
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
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
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className={cn("size-4", active ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Tracking Services */}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                {isEn ? "Online Tracking Services" : "บริการติดตามผลออนไลน์"}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                <Link
                  href="/admissions/tracking"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-foreground hover:bg-accent border border-border"
                >
                  <span className="flex items-center gap-2">
                    <Search className="size-3.5 text-muted-foreground" />
                    <span>{isEn ? "Track TCAS Admission" : "ติดตามใบสมัคร TCAS"}</span>
                  </span>
                  <ArrowUpRight className="size-3 text-muted-foreground" />
                </Link>
                <Link
                  href="/helpdesk/tracking"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-foreground hover:bg-accent border border-border"
                >
                  <span className="flex items-center gap-2">
                    <Search className="size-3.5 text-muted-foreground" />
                    <span>{isEn ? "Track Service Ticket" : "ติดตามงานแจ้งซ่อม"}</span>
                  </span>
                  <ArrowUpRight className="size-3 text-muted-foreground" />
                </Link>
              </div>
            </div>

            {/* User Login Action in Drawer */}
            <div className="pt-2">
              {isLoggedIn ? (
                <Button asChild size="sm" className="w-full justify-center gap-2 rounded-lg">
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard className="size-4" />
                    <span>Admin Console</span>
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="w-full justify-center gap-2 rounded-lg">
                  <Link href="/login?callbackUrl=/reservations/calendar" onClick={() => setMobileOpen(false)}>
                    <LogIn className="size-4" />
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
