"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, UserCheck, Inbox, Settings2 } from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import { cn } from "@/shared/lib/utils";

interface ReservationsNavProps {
  canApprove?: boolean;
  canManage?: boolean;
}

export function ReservationsNav({ canApprove = false, canManage = false }: ReservationsNavProps) {
  const pathname = usePathname();
  const t = useT();

  const navItems = [
    {
      href: "/reservations/calendar",
      title: t("reservations.tab.calendar"),
      icon: Calendar,
      active: pathname.startsWith("/reservations/calendar"),
      visible: true,
    },
    {
      href: "/reservations/my",
      title: t("reservations.tab.my"),
      icon: UserCheck,
      active: pathname.startsWith("/reservations/my"),
      visible: true,
    },
    {
      href: "/reservations/inbox",
      title: t("reservations.tab.inbox"),
      icon: Inbox,
      active: pathname.startsWith("/reservations/inbox"),
      visible: canApprove,
    },
    {
      href: "/reservations/resources",
      title: t("reservations.tab.resources"),
      icon: Settings2,
      active: pathname.startsWith("/reservations/resources"),
      visible: canManage,
    },
  ].filter((item) => item.visible);

  return (
    <nav className="flex items-center gap-2 border-b border-border pb-3 mb-6 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              item.active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="size-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
