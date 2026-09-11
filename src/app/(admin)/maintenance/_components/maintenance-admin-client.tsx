"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Wrench,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  UserCheck,
  MapPin,
  Kanban,
  Table as TableIcon,
  Star,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StatusPill,
  type StatusPillTone,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import {
  createServiceTicketAction,
  assignTicketAction,
  updateTicketProgressAction,
  resolveTicketAction,
} from "@/features/maintenance/actions";
import type {
  ServiceTicketDto,
  ServiceCategoryDto,
  MaintenanceStatsDto,
} from "@/features/maintenance";
import type { PersonnelProfileDto } from "@/features/personnel";
import { formatDate } from "@/shared/lib/format";

interface MaintenanceAdminClientProps {
  initialTickets: ServiceTicketDto[];
  categories: ServiceCategoryDto[];
  stats: MaintenanceStatsDto;
  personnel: PersonnelProfileDto[];
  canCreate: boolean;
  canAssign: boolean;
  canResolve: boolean;
  canManage: boolean;
}

export function MaintenanceAdminClient({
  initialTickets,
  categories,
  stats,
  personnel,
  canCreate,
  canAssign,
  canResolve,
  canManage: _canManage,
}: MaintenanceAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tickets, setTickets] = useState<ServiceTicketDto[]>(initialTickets);
  const [viewMode, setViewMode] = useState<"TABLE" | "KANBAN">("TABLE");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    categoryId: categories[0]?.id || "",
    title: "",
    description: "",
    location: "",
    priority: "MEDIUM" as ServiceTicketDto["priority"],
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
  });

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assigningTicket, setAssigningTicket] = useState<ServiceTicketDto | null>(null);
  const [assignForm, setAssignForm] = useState({
    technicianId: personnel[0]?.id || "",
    priority: "MEDIUM" as ServiceTicketDto["priority"],
  });

  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolvingTicket, setResolvingTicket] = useState<ServiceTicketDto | null>(null);
  const [resolveForm, setResolveForm] = useState({
    resolutionNotes: "",
    partsCost: "",
  });

  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressTicket, setProgressTicket] = useState<ServiceTicketDto | null>(null);
  const [progressForm, setProgressForm] = useState({
    status: "IN_PROGRESS" as ServiceTicketDto["status"],
    comment: "",
  });

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      search === "" ||
      t.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.requesterName.toLowerCase().includes(search.toLowerCase());

    const matchCategory = selectedCategory === "ALL" || t.categoryId === selectedCategory;
    const matchStatus = selectedStatus === "ALL" || t.status === selectedStatus;
    const matchPriority = selectedPriority === "ALL" || t.priority === selectedPriority;

    return matchSearch && matchCategory && matchStatus && matchPriority;
  });

  const getPriorityBadge = (priority: ServiceTicketDto["priority"]) => {
    switch (priority) {
      case "CRITICAL":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">วิกฤต (Critical)</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">สูง (High)</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">ปานกลาง</span>;
      case "LOW":
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">ต่ำ</span>;
      default:
        return priority;
    }
  };

  const getStatusTone = (status: ServiceTicketDto["status"]): StatusPillTone => {
    switch (status) {
      case "OPEN":
        return "warn";
      case "ASSIGNED":
        return "info";
      case "IN_PROGRESS":
        return "info";
      case "WAITING_PARTS":
        return "warn";
      case "RESOLVED":
        return "ok";
      case "CANCELLED":
        return "off";
      default:
        return "off";
    }
  };

  const getStatusLabel = (status: ServiceTicketDto["status"]) => {
    switch (status) {
      case "OPEN":
        return "รอดำเนินการ";
      case "ASSIGNED":
        return "มอบหมายช่างแล้ว";
      case "IN_PROGRESS":
        return "กำลังดำเนินการ";
      case "WAITING_PARTS":
        return "รออะไหล่";
      case "RESOLVED":
        return "แก้ไขเสร็จสิ้น";
      case "CANCELLED":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const handleOpenAssign = (ticket: ServiceTicketDto) => {
    setAssigningTicket(ticket);
    setAssignForm({
      technicianId: ticket.assignedTechnicianId || personnel[0]?.id || "",
      priority: ticket.priority,
    });
    setIsAssignOpen(true);
  };

  const handleSaveAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTicket) return;

    startTransition(async () => {
      try {
        const res = await assignTicketAction({
          id: assigningTicket.id,
          assignedTechnicianId: assignForm.technicianId,
          priority: assignForm.priority,
        });

        if (res.ok) {
          toast.success("จ่ายงานและมอบหมายช่างสำเร็จ");
          setTickets((prev) =>
            prev.map((t) => (t.id === assigningTicket.id ? res.data : t))
          );
          setIsAssignOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error assigning ticket");
      }
    });
  };

  const handleOpenProgress = (ticket: ServiceTicketDto) => {
    setProgressTicket(ticket);
    setProgressForm({
      status: ticket.status === "ASSIGNED" ? "IN_PROGRESS" : ticket.status,
      comment: "",
    });
    setIsProgressOpen(true);
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressTicket) return;

    startTransition(async () => {
      try {
        const res = await updateTicketProgressAction({
          id: progressTicket.id,
          status: progressForm.status,
          comment: progressForm.comment || null,
        });

        if (res.ok) {
          toast.success("อัปเดตความคืบหน้างานสำเร็จ");
          setTickets((prev) =>
            prev.map((t) => (t.id === progressTicket.id ? res.data : t))
          );
          setIsProgressOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error updating progress");
      }
    });
  };

  const handleOpenResolve = (ticket: ServiceTicketDto) => {
    setResolvingTicket(ticket);
    setResolveForm({
      resolutionNotes: "",
      partsCost: "",
    });
    setIsResolveOpen(true);
  };

  const handleSaveResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    startTransition(async () => {
      try {
        const res = await resolveTicketAction({
          id: resolvingTicket.id,
          resolutionNotes: resolveForm.resolutionNotes,
          partsCost: resolveForm.partsCost ? Number(resolveForm.partsCost) : null,
          completionPhotos: [],
        });

        if (res.ok) {
          toast.success("บันทึกการแก้ไขและปิดงานซ่อมสำเร็จ");
          setTickets((prev) =>
            prev.map((t) => (t.id === resolvingTicket.id ? res.data : t))
          );
          setIsResolveOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error resolving ticket");
      }
    });
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await createServiceTicketAction({
          categoryId: createForm.categoryId,
          title: createForm.title,
          description: createForm.description,
          location: createForm.location,
          priority: createForm.priority,
          photos: [],
          requesterName: createForm.requesterName,
          requesterEmail: createForm.requesterEmail,
          requesterPhone: createForm.requesterPhone,
        });

        if (res.ok) {
          toast.success("เปิดใบแจ้งซ่อมใหม่สำเร็จ");
          setTickets((prev) => [res.data, ...prev]);
          setIsCreateOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error creating ticket");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            ระบบแจ้งซ่อมและงานบริการทั่วไป
          </h1>
          <p className="text-sm text-muted-foreground">
            ศูนย์รับเรื่องและติดตามงานซ่อมบำรุง จ่ายงานช่าง ควบคุมมาตรฐาน SLA และประเมินความพึงพอใจ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-muted p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "TABLE" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              ตาราง
            </button>
            <button
              type="button"
              onClick={() => setViewMode("KANBAN")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "KANBAN" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              Kanban
            </button>
          </div>

          {canCreate && (
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              แจ้งซ่อมใหม่
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">งานซ่อมทั้งหมด</div>
            <div className="text-2xl font-bold text-foreground">
              {stats.total} <span className="text-sm font-normal text-muted-foreground">รายการ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">รอดำเนินการ / จ่ายงาน</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.open} <span className="text-sm font-normal text-muted-foreground">รายการ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">กำลังดำเนินการซ่อม</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.inProgress + stats.assigned} <span className="text-sm font-normal text-muted-foreground">รายการ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">อัตราปฏิบัติตาม SLA</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.slaCompliancePercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="ค้นหาด้วยเลขที่ Ticket, หัวข้อปัญหา, สถานที่, หรือชื่อผู้แจ้ง..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-[170px]">
            <LiyonSelect
              value={selectedCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">ทุกหมวดหมู่งาน</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameTh}
                </option>
              ))}
            </LiyonSelect>
          </div>

          <div className="w-[150px]">
            <LiyonSelect
              value={selectedPriority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPriority(e.target.value)}
            >
              <option value="ALL">ทุกความเร่งด่วน</option>
              <option value="CRITICAL">วิกฤต</option>
              <option value="HIGH">สูง</option>
              <option value="MEDIUM">ปานกลาง</option>
              <option value="LOW">ต่ำ</option>
            </LiyonSelect>
          </div>

          <div className="w-[150px]">
            <LiyonSelect
              value={selectedStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">ทุกสถานะ</option>
              <option value="OPEN">รอดำเนินการ</option>
              <option value="ASSIGNED">มอบหมายช่างแล้ว</option>
              <option value="IN_PROGRESS">กำลังซ่อม</option>
              <option value="WAITING_PARTS">รออะไหล่</option>
              <option value="RESOLVED">เสร็จสิ้น</option>
            </LiyonSelect>
          </div>
        </div>
      </div>

      {/* View 1: Table View */}
      {viewMode === "TABLE" && (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-card-foreground">
              <thead className="border-b bg-muted/50 text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">เลขที่ Ticket</th>
                  <th className="px-4 py-3">หัวข้องานซ่อม</th>
                  <th className="px-4 py-3">สถานที่</th>
                  <th className="px-4 py-3">ผู้แจ้ง / ติดต่อ</th>
                  <th className="px-4 py-3">ช่างผู้รับผิดชอบ</th>
                  <th className="px-4 py-3 text-center">ความเร่งด่วน</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                  <th className="px-4 py-3 text-center">SLA Deadline</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      <Wrench className="mx-auto h-8 w-8 opacity-40 mb-2" />
                      ไม่พบใบแจ้งซ่อมตามเงื่อนไขที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-primary">
                        {ticket.ticketNo}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">{ticket.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <span>{ticket.categoryNameTh}</span>
                          {ticket.assetCode && (
                            <span className="font-mono bg-muted px-1.5 py-0.2 rounded text-[11px]">
                              {ticket.assetCode}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <div className="flex items-center gap-1 text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[150px]">{ticket.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <div className="font-medium text-foreground">{ticket.requesterName}</div>
                        <div className="text-muted-foreground text-[11px] font-mono">{ticket.requesterPhone}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {ticket.assignedTechnicianName ? (
                          <div className="font-medium text-foreground flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                            {ticket.assignedTechnicianName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">ยังไม่มอบหมาย</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <StatusPill tone={getStatusTone(ticket.status)}>
                          {getStatusLabel(ticket.status)}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs">
                        {ticket.slaDeadline ? (
                          <div className={ticket.isBreached ? "text-destructive font-bold flex items-center justify-center gap-1" : "text-muted-foreground"}>
                            {ticket.isBreached && <ShieldAlert className="h-3.5 w-3.5" />}
                            {formatDate(ticket.slaDeadline, "th", { time: true })}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canAssign && ticket.status === "OPEN" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                              onClick={() => handleOpenAssign(ticket)}
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              จ่ายงาน
                            </Button>
                          )}
                          {canResolve && ticket.status !== "RESOLVED" && ticket.status !== "CANCELLED" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => handleOpenProgress(ticket)}
                                title="อัปเดตความคืบหน้า"
                              >
                                คืบหน้า
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                onClick={() => handleOpenResolve(ticket)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                ปิดงาน
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Kanban Board */}
      {viewMode === "KANBAN" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { key: "OPEN", title: "รอดำเนินการ (Open)", color: "border-amber-400" },
            { key: "ASSIGNED", title: "มอบหมายช่างแล้ว (Assigned)", color: "border-indigo-400" },
            { key: "IN_PROGRESS", title: "กำลังดำเนินการ (In Progress)", color: "border-blue-400" },
            { key: "RESOLVED", title: "แก้ไขเสร็จสิ้น (Resolved)", color: "border-emerald-400" },
          ].map((col) => {
            const colTickets = filteredTickets.filter((t) =>
              col.key === "IN_PROGRESS"
                ? t.status === "IN_PROGRESS" || t.status === "WAITING_PARTS"
                : t.status === col.key
            );

            return (
              <div key={col.key} className="flex flex-col rounded-xl border bg-muted/30 p-3">
                <div className={`border-t-4 ${col.color} pt-2 mb-3 flex items-center justify-between`}>
                  <span className="font-semibold text-xs text-foreground">{col.title}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
                    {colTickets.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                  {colTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-lg border bg-card p-3 shadow-sm space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary">{ticket.ticketNo}</span>
                        {getPriorityBadge(ticket.priority)}
                      </div>

                      <div className="font-semibold text-foreground line-clamp-2">
                        {ticket.title}
                      </div>

                      <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{ticket.location}</span>
                      </div>

                      <div className="text-muted-foreground flex items-center justify-between pt-1 border-t text-[11px]">
                        <span>ผู้แจ้ง: {ticket.requesterName}</span>
                        {ticket.rating && (
                          <div className="flex items-center text-amber-500 font-bold">
                            <Star className="h-3 w-3 fill-amber-500" />
                            {ticket.rating.score}
                          </div>
                        )}
                      </div>

                      {canAssign && ticket.status === "OPEN" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs mt-1"
                          onClick={() => handleOpenAssign(ticket)}
                        >
                          จ่ายงานช่าง
                        </Button>
                      )}

                      {canResolve && ticket.status !== "RESOLVED" && ticket.status !== "CANCELLED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs mt-1 text-emerald-600 border-emerald-200"
                          onClick={() => handleOpenResolve(ticket)}
                        >
                          บันทึกปิดงานซ่อม
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog 1: Assign Ticket */}
      <LiyonDialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <LiyonDialogHeader title="จ่ายงานและมอบหมายช่างผู้รับผิดชอบ" />
        <LiyonDialogCloseButton label="ปิด" />

        {assigningTicket && (
          <form onSubmit={handleSaveAssign}>
            <LiyonDialogBody>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-3">
                  <div className="font-semibold text-foreground">
                    {assigningTicket.ticketNo}: {assigningTicket.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    สถานที่: {assigningTicket.location} | หมวดหมู่: {assigningTicket.categoryNameTh}
                  </div>
                </div>

                <LiyonField label="ช่างผู้รับผิดชอบ / บุคลากร *">
                  <LiyonSelect
                    value={assignForm.technicianId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setAssignForm({ ...assignForm, technicianId: e.target.value })
                    }
                  >
                    {personnel.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullNameTh} ({p.departmentNameTh})
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label="ระดับความเร่งด่วน">
                  <LiyonSelect
                    value={assignForm.priority}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setAssignForm({
                        ...assignForm,
                        priority: e.target.value as ServiceTicketDto["priority"],
                      })
                    }
                  >
                    <option value="CRITICAL">วิกฤต (SLA 4 ชม.)</option>
                    <option value="HIGH">สูง (SLA 8 ชม.)</option>
                    <option value="MEDIUM">ปานกลาง (SLA 24 ชม.)</option>
                    <option value="LOW">ต่ำ (SLA 48 ชม.)</option>
                  </LiyonSelect>
                </LiyonField>
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAssignOpen(false)}
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "กำลังบันทึก..." : "ยืนยันการจ่ายงาน"}
              </Button>
            </LiyonDialogFooter>
          </form>
        )}
      </LiyonDialog>

      {/* Dialog 2: Update Progress */}
      <LiyonDialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <LiyonDialogHeader title="อัปเดตความคืบหน้างานซ่อม" />
        <LiyonDialogCloseButton label="ปิด" />

        {progressTicket && (
          <form onSubmit={handleSaveProgress}>
            <LiyonDialogBody>
              <div className="space-y-4">
                <LiyonField label="สถานะงาน *">
                  <LiyonSelect
                    value={progressForm.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setProgressForm({
                        ...progressForm,
                        status: e.target.value as ServiceTicketDto["status"],
                      })
                    }
                  >
                    <option value="IN_PROGRESS">กำลังดำเนินการซ่อม (In Progress)</option>
                    <option value="WAITING_PARTS">รออะไหล่ / รออุปกรณ์เสริม (Waiting Parts)</option>
                    <option value="ASSIGNED">มอบหมายช่างแล้ว (Assigned)</option>
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label="บันทึกข้อความความคืบหน้า">
                  <textarea
                    rows={3}
                    value={progressForm.comment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setProgressForm({ ...progressForm, comment: e.target.value })
                    }
                    placeholder="เช่น ช่างได้เข้าตรวจสอบแล้ว พบว่าเพาเวอร์ซัพพลายชำรุด อยู่ระหว่างเบิกอะไหล่"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProgressOpen(false)}
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "กำลังบันทึก..." : "บันทึกความคืบหน้า"}
              </Button>
            </LiyonDialogFooter>
          </form>
        )}
      </LiyonDialog>

      {/* Dialog 3: Resolve Ticket */}
      <LiyonDialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <LiyonDialogHeader title="บันทึกผลการซ่อมและปิดงาน (Resolve)" />
        <LiyonDialogCloseButton label="ปิด" />

        {resolvingTicket && (
          <form onSubmit={handleSaveResolve}>
            <LiyonDialogBody>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-3">
                  <div className="font-semibold text-foreground">
                    {resolvingTicket.ticketNo}: {resolvingTicket.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ผู้แจ้ง: {resolvingTicket.requesterName} ({resolvingTicket.requesterPhone})
                  </div>
                </div>

                <LiyonField label="สรุปผลการซ่อม / วิธีการแก้ไข (อย่างน้อย 5 ตัวอักษร) *">
                  <textarea
                    required
                    rows={4}
                    value={resolveForm.resolutionNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })
                    }
                    placeholder="เช่น ทำการเปลี่ยนอะไหล่พาวเวอร์ซัพพลายขนาด 500W และทดสอบเปิดเครื่องใช้งานได้ตามปกติแล้ว"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="ค่าใช้จ่ายอะไหล่ / อุปกรณ์ (บาท)">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={resolveForm.partsCost}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setResolveForm({ ...resolveForm, partsCost: e.target.value })
                    }
                    placeholder="เช่น 1200 (หากไม่มีให้เว้นว่าง)"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResolveOpen(false)}
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isPending ? "กำลังบันทึก..." : "ยืนยันการปิดงานซ่อม"}
              </Button>
            </LiyonDialogFooter>
          </form>
        )}
      </LiyonDialog>

      {/* Dialog 4: Create Ticket */}
      <LiyonDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} wide>
        <LiyonDialogHeader title="เปิดใบแจ้งซ่อม / ขอใช้บริการใหม่" />
        <LiyonDialogCloseButton label="ปิด" />

        <form onSubmit={handleSaveCreate}>
          <LiyonDialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label="หมวดหมู่งานบริการ *">
                  <LiyonSelect
                    value={createForm.categoryId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setCreateForm({ ...createForm, categoryId: e.target.value })
                    }
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameTh}
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label="ระดับความเร่งด่วน *">
                  <LiyonSelect
                    value={createForm.priority}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setCreateForm({
                        ...createForm,
                        priority: e.target.value as ServiceTicketDto["priority"],
                      })
                    }
                  >
                    <option value="CRITICAL">วิกฤต (ขัดข้องทั้งระบบ)</option>
                    <option value="HIGH">สูง (ส่งผลกระทบต่องานสอน/สอบ)</option>
                    <option value="MEDIUM">ปานกลาง (ใช้งานได้บางส่วน)</option>
                    <option value="LOW">ต่ำ (ทั่วไป)</option>
                  </LiyonSelect>
                </LiyonField>
              </div>

              <LiyonField label="หัวข้อปัญหา / รายการแจ้งซ่อม *">
                <input
                  required
                  value={createForm.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateForm({ ...createForm, title: e.target.value })
                  }
                  placeholder="เช่น โปรเจคเตอร์ห้อง 301 ไม่ติด หรือ แอร์มีน้ำหยด"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </LiyonField>

              <LiyonField label="สถานที่ / ห้องที่เกิดปัญหา *">
                <input
                  required
                  value={createForm.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateForm({ ...createForm, location: e.target.value })
                  }
                  placeholder="เช่น อาคารบริหาร ชั้น 3 ห้อง 301"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </LiyonField>

              <LiyonField label="รายละเอียดอาการเสียและสาเหตุ *">
                <textarea
                  required
                  rows={4}
                  value={createForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  placeholder="ระบุอาการผิดปกติ วันเวลาที่พบ หรือสภาพแวดล้อม..."
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </LiyonField>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
                <LiyonField label="ชื่อผู้แจ้ง *">
                  <input
                    required
                    value={createForm.requesterName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateForm({ ...createForm, requesterName: e.target.value })
                    }
                    placeholder="ชื่อ-นามสกุล"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="อีเมลผู้แจ้ง *">
                  <input
                    type="email"
                    required
                    value={createForm.requesterEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateForm({ ...createForm, requesterEmail: e.target.value })
                    }
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>

                <LiyonField label="เบอร์โทรศัพท์ติดต่อ *">
                  <input
                    required
                    value={createForm.requesterPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateForm({ ...createForm, requesterPhone: e.target.value })
                    }
                    placeholder="08X-XXX-XXXX"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </LiyonField>
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "ส่งใบแจ้งซ่อม"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
