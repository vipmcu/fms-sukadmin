import Link from "next/link";
import {
  FileText,
  CalendarDays,
  Wrench,
  UserPlus,
  Package,
  AlertTriangle,
  Newspaper,
  Users,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { requireSession, getDashboardStats } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { LiyonCard } from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const ctx = await requireSession();
  const [t, stats] = await Promise.all([getT(), getDashboardStats(ctx.tenantId)]);

  // Workload Inboxes (Actions requiring attention)
  const pendingWorkloads = [
    {
      label: t("dash.pendingDocs"),
      value: stats.pendingDocs,
      href: "/documents",
      icon: FileText,
      color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
      actionText: t("dash.action.documents"),
    },
    {
      label: t("dash.pendingReservations"),
      value: stats.pendingReservations,
      href: "/reservations/inbox",
      icon: CalendarDays,
      color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
      actionText: t("dash.action.inbox"),
    },
    {
      label: t("dash.openTickets"),
      value: stats.openTickets,
      href: "/maintenance",
      icon: Wrench,
      color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
      actionText: t("dash.action.maintenance"),
    },
    {
      label: t("dash.pendingAdmissions"),
      value: stats.pendingAdmissions,
      href: "/admissions/manage",
      icon: UserPlus,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      actionText: t("dash.action.admissions"),
    },
    {
      label: t("dash.lowStockSupplies"),
      value: stats.lowStockSupplies,
      href: "/inventory/supplies",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-500/10 border-rose-500/20",
      actionText: "ตรวจสอบคลัง",
    },
  ];

  // Resource Overview Stats
  const resourceStats = [
    { label: t("dash.publishedNews"), value: stats.publishedNews, icon: Newspaper },
    { label: t("dash.activePersonnel"), value: stats.activePersonnel, icon: Users },
    { label: t("dash.activeAssets"), value: stats.activeAssets, icon: Package },
    { label: t("dash.activeUsers"), value: stats.activeUsers, icon: ShieldCheck },
    { label: t("dash.roles"), value: stats.roles, icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="ph">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <span>{t("dash.title")}</span>
        </h1>
        <p className="sub text-sm text-muted-foreground mt-1">
          {t("dash.welcome", { name: ctx.userName })} • ศูนย์บัญชาการและติดตามงานบริหารจัดการส่วนกลาง
        </p>
      </header>

      {/* 1. Urgent Workload Inboxes (Pending actions) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <span>{t("dash.attentionNeeded")}</span>
          </h2>
          <span className="text-xs text-muted-foreground">คลิกเพื่อเข้าสู่งานที่ต้องพิจารณา</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {pendingWorkloads.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group block rounded-2xl border border-border bg-card p-5 shadow-xs hover:shadow-md hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>

                <div className="mt-4 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground block line-clamp-1">
                    {item.label}
                  </span>
                  <div className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
                    {item.value}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] font-semibold text-primary">
                  <span>{item.actionText}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 2. Quick Action Workflow Launcher */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("dash.quickActions")}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button asChild variant="outline" className="h-auto py-3 px-4 flex flex-col items-center gap-2 justify-center text-xs font-semibold rounded-xl bg-card hover:bg-muted">
            <Link href="/reservations/inbox">
              <CalendarDays className="size-5 text-purple-600" />
              <span>อนุมัติการจอง</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-3 px-4 flex flex-col items-center gap-2 justify-center text-xs font-semibold rounded-xl bg-card hover:bg-muted">
            <Link href="/documents">
              <FileText className="size-5 text-blue-600" />
              <span>พิจารณาเอกสาร</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-3 px-4 flex flex-col items-center gap-2 justify-center text-xs font-semibold rounded-xl bg-card hover:bg-muted">
            <Link href="/maintenance">
              <Wrench className="size-5 text-amber-600" />
              <span>จ่ายงานช่าง</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-3 px-4 flex flex-col items-center gap-2 justify-center text-xs font-semibold rounded-xl bg-card hover:bg-muted">
            <Link href="/admissions/manage">
              <UserPlus className="size-5 text-emerald-600" />
              <span>ตรวจใบสมัคร</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-3 px-4 flex flex-col items-center gap-2 justify-center text-xs font-semibold rounded-xl bg-card hover:bg-muted">
            <Link href="/inventory/assets">
              <Package className="size-5 text-indigo-600" />
              <span>ทะเบียนพัสดุ</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-3 px-4 flex flex-col items-center gap-2 justify-center text-xs font-semibold rounded-xl bg-card hover:bg-muted">
            <Link href="/news/manage">
              <Newspaper className="size-5 text-sky-600" />
              <span>ลงข่าวประชาสัมพันธ์</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* 3. Resource Overview Stats */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("dash.resourceOverview")}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {resourceStats.map((c) => {
            const Icon = c.icon;
            return (
              <LiyonCard key={c.label} className="p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">{c.label}</span>
                  <Icon className="size-4 text-primary/70" />
                </div>
                <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {c.value}
                </div>
              </LiyonCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
