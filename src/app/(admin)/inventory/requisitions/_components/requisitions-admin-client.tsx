"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, ClipboardList, Trash2 } from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";
import {
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import { formatDate } from "@/shared/lib/format";
import {
  createSupplyRequisitionAction,
  approveSupplyRequisitionAction,
  rejectSupplyRequisitionAction,
  cancelSupplyRequisitionAction,
  dispatchSupplyRequisitionAction,
} from "@/features/assets/actions";
import type { SupplyItemDto, SupplyRequisitionDto } from "@/features/assets";
import type { RequisitionStatus } from "@/generated/prisma";

interface Props {
  initialRequisitions: SupplyRequisitionDto[];
  supplies: SupplyItemDto[];
  canCreate: boolean;
  canApprove: boolean;
  canDispatch: boolean;
  currentUserId: string;
}

type LineDraft = { supplyItemId: string; quantity: number };

function statusTone(status: RequisitionStatus): "ok" | "warn" | "bad" | "info" | "off" {
  switch (status) {
    case "PENDING":
      return "warn";
    case "APPROVED":
      return "info";
    case "DISPATCHED":
      return "ok";
    case "REJECTED":
      return "bad";
    case "CANCELLED":
      return "off";
    default:
      return "off";
  }
}

export function RequisitionsAdminClient({
  initialRequisitions,
  supplies,
  canCreate,
  canApprove,
  canDispatch,
  currentUserId,
}: Props) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState(initialRequisitions);

  const [createOpen, setCreateOpen] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([{ supplyItemId: supplies[0]?.id ?? "", quantity: 1 }]);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<SupplyRequisitionDto | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const statusLabel = (status: RequisitionStatus) =>
    t(`assets.req.status.${status.toLowerCase()}` as Parameters<typeof t>[0]);

  const openCreate = () => {
    setPurpose("");
    setLines([{ supplyItemId: supplies[0]?.id ?? "", quantity: 1 }]);
    setCreateOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createSupplyRequisitionAction({
        purpose: purpose || null,
        items: lines.filter((l) => l.supplyItemId && l.quantity > 0),
      });
      if (res.ok) {
        toast.success(t("assets.req.msg.created"));
        setRows((prev) => [res.data, ...prev]);
        setCreateOpen(false);
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveSupplyRequisitionAction(id);
      if (res.ok) {
        toast.success(t("assets.req.msg.approved"));
        setRows((prev) => prev.map((r) => (r.id === id ? res.data : r)));
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const openReject = (req: SupplyRequisitionDto) => {
    setRejectTarget(req);
    setRejectionReason("");
    setRejectOpen(true);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    startTransition(async () => {
      const res = await rejectSupplyRequisitionAction({
        id: rejectTarget.id,
        rejectionReason,
      });
      if (res.ok) {
        toast.success(t("assets.req.msg.rejected"));
        setRows((prev) => prev.map((r) => (r.id === rejectTarget.id ? res.data : r)));
        setRejectOpen(false);
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleCancel = (id: string) => {
    if (!confirm(t("assets.req.btn.cancel"))) return;
    startTransition(async () => {
      const res = await cancelSupplyRequisitionAction(id);
      if (res.ok) {
        toast.success(t("assets.req.msg.cancelled"));
        setRows((prev) => prev.map((r) => (r.id === id ? res.data : r)));
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleDispatch = (id: string) => {
    startTransition(async () => {
      const res = await dispatchSupplyRequisitionAction(id);
      if (res.ok) {
        toast.success(t("assets.req.msg.dispatched"));
        setRows((prev) => prev.map((r) => (r.id === id ? res.data : r)));
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("assets.req.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("assets.req.subtitle")}</p>
        </div>
        {canCreate && supplies.length > 0 && (
          <Button onClick={openCreate} className="gap-2" disabled={pending}>
            <Plus className="h-4 w-4" />
            {t("assets.req.btn.create")}
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          <ClipboardList className="mx-auto mb-3 h-8 w-8 opacity-50" />
          {t("assets.req.msg.empty")}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((req) => (
            <div key={req.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{req.requisitionNo}</span>
                    <StatusPill tone={statusTone(req.status)}>{statusLabel(req.status)}</StatusPill>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("assets.req.requester")}: {req.requesterName} · {formatDate(req.createdAt, "th")}
                  </p>
                  {req.purpose && <p className="text-sm">{req.purpose}</p>}
                  {req.rejectionReason && (
                    <p className="text-sm text-destructive">
                      {t("assets.req.rejectionReason")}: {req.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {canApprove && req.status === "PENDING" && (
                    <>
                      <Button size="sm" disabled={pending} onClick={() => handleApprove(req.id)}>
                        {t("assets.req.btn.approve")}
                      </Button>
                      <Button size="sm" variant="outline" disabled={pending} onClick={() => openReject(req)}>
                        {t("assets.req.btn.reject")}
                      </Button>
                    </>
                  )}
                  {canCreate && req.requesterId === currentUserId && req.status === "PENDING" && (
                    <Button size="sm" variant="ghost" disabled={pending} onClick={() => handleCancel(req.id)}>
                      {t("assets.req.btn.cancel")}
                    </Button>
                  )}
                  {canDispatch && req.status === "APPROVED" && (
                    <Button size="sm" disabled={pending} onClick={() => handleDispatch(req.id)}>
                      {t("assets.req.btn.dispatch")}
                    </Button>
                  )}
                </div>
              </div>
              <ul className="mt-3 space-y-1 border-t pt-3 text-sm">
                {req.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4">
                    <span>
                      {item.supplyCode} — {item.supplyNameTh}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {item.quantity} {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <LiyonDialog open={createOpen} onOpenChange={setCreateOpen} wide>
        <form onSubmit={handleCreate}>
          <LiyonDialogHeader title={t("assets.req.btn.create")} />
          <LiyonDialogBody className="space-y-4">
            <LiyonField label={t("assets.req.purpose")}>
              <textarea
                className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </LiyonField>
            <div className="space-y-3">
              <div className="text-sm font-medium">{t("assets.req.items")}</div>
              {lines.map((line, idx) => (
                <div key={idx} className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[12rem] flex-1">
                    <LiyonSelect
                      value={line.supplyItemId}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((l, i) => (i === idx ? { ...l, supplyItemId: e.target.value } : l))
                        )
                      }
                    >
                      {supplies.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} — {s.nameTh} ({s.currentStock} {s.unit})
                        </option>
                      ))}
                    </LiyonSelect>
                  </div>
                  <LiyonField label={t("assets.req.quantity")}>
                    <input
                      type="number"
                      min={1}
                      className="w-24 rounded-md border bg-background px-3 py-2 text-sm"
                      value={line.quantity}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((l, i) =>
                            i === idx ? { ...l, quantity: Number(e.target.value) || 1 } : l
                          )
                        )
                      }
                    />
                  </LiyonField>
                  {lines.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setLines((prev) => [...prev, { supplyItemId: supplies[0]?.id ?? "", quantity: 1 }])
                }
              >
                {t("assets.req.btn.addLine")}
              </Button>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {t("assets.btn.save")}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      <LiyonDialog open={rejectOpen} onOpenChange={setRejectOpen} danger>
        <form onSubmit={handleReject}>
          <LiyonDialogHeader title={t("assets.req.btn.reject")} />
          <LiyonDialogBody>
            <LiyonField label={t("assets.req.rejectionReason")}>
              <textarea
                required
                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </LiyonField>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {t("assets.req.btn.reject")}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
