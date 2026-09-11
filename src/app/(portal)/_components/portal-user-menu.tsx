"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/shared/lib/i18n/client";

export interface PortalUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface PortalUserMenuProps {
  user: PortalUser;
}

export function PortalUserMenu({ user }: PortalUserMenuProps) {
  const locale = useLocale();
  const isEn = locale === "en";

  const initials =
    (user.name ?? user.email ?? "?")
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-accent/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 border border-border/60"
          aria-label={isEn ? `User account menu for ${user.name || user.email || "staff"}` : `เมนูบัญชีผู้ใช้งาน ${user.name || user.email || "บุคลากร"}`}
        >
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center overflow-hidden shadow-xs shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? "Avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <span className="hidden md:inline-block text-xs font-semibold text-foreground max-w-[130px] truncate">
            {user.name || user.email}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 mt-1.5" sideOffset={6}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground truncate">
              {user.name || (isEn ? "Staff Member" : "บุคลากร")}
            </p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer flex items-center gap-2">
              <LayoutDashboard className="size-4 text-muted-foreground" />
              <span>{isEn ? "Staff Console" : "ระบบจัดการ (Staff Console)"}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/me" className="cursor-pointer flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span>{isEn ? "Profile" : "โปรไฟล์ของฉัน"}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer flex items-center gap-2">
              <Settings className="size-4 text-muted-foreground" />
              <span>{isEn ? "Organization Settings" : "ตั้งค่าองค์กร"}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2"
          onSelect={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="size-4" />
          <span>{isEn ? "Sign out" : "ออกจากระบบ"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
