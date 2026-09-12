"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  FolderPlus,
  Eye,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/shared/lib/format";
import type { DocumentTypeDto, DocumentRequestDto } from "@/features/documents";
import {
  createDocumentRequestAction,
  approveDocumentStepAction,
  rejectDocumentStepAction,
  cancelDocumentRequestAction,
  createDocumentTypeAction,
  getDocumentRequestByIdAction,
} from "@/features/documents/actions";

interface DocumentsAdminClientProps {
  types: DocumentTypeDto[];
  initialRequests: DocumentRequestDto[];
  canApprove: boolean;
  canManage: boolean;
  canCreate: boolean;
  currentUserId: string;
}

export function DocumentsAdminClient({
  types,
  initialRequests,
  canApprove,
  canManage,
  canCreate,
  currentUserId,
}: DocumentsAdminClientProps) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"ALL" | "INBOX" | "MY" | "APPROVED" | "REJECTED">("ALL");
  const [search, setSearch] = useState("");

  // Create Request Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [typeId, setTypeId] = useState(types[0]?.id || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [totalSteps, setTotalSteps] = useState(2);
  const [currentApproverRole, setCurrentApproverRole] = useState("DEPT_HEAD");

  // Approval Dialog
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [targetRequest, setTargetRequest] = useState<DocumentRequestDto | null>(null);
  const [comment, setComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectMode, setRejectMode] = useState(false);

  // View Detail Dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<DocumentRequestDto | null>(null);

  // Type Dialog
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [typeCode, setTypeCode] = useState("");
  const [typeNameTh, setTypeNameTh] = useState("");
  const [typeNameEn, setTypeNameEn] = useState("");
  const [typeDescTh, setTypeDescTh] = useState("");

  const openCreateDialog = () => {
    setTypeId(types[0]?.id || "");
    setTitle("");
    setContent("");
    setTotalSteps(2);
    setCurrentApproverRole("DEPT_HEAD");
    setCreateDialogOpen(true);
  };

  const openApprovalDialog = (req: DocumentRequestDto) => {
    setTargetRequest(req);
    setComment("");
    setRejectionReason("");
    setRejectMode(false);
    setApprovalDialogOpen(true);
  };

  const openViewDialog = (req: DocumentRequestDto) => {
    setViewTarget(req);
    setViewDialogOpen(true);
    startTransition(async () => {
      const res = await getDocumentRequestByIdAction(req.id);
      if (res.ok) setViewTarget(res.data);
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createDocumentRequestAction({
        typeId,
        title,
        content,
        metadata: {},
        attachments: [],
        totalSteps: Number(totalSteps),
        currentApproverRole,
        approverRoles: Array.from({ length: Number(totalSteps) }, (_, i) =>
          i === 0 ? currentApproverRole : "DEAN"
        ),
      });
      if (res.ok) {
        toast.success(t("documents.msg.created"));
        setCreateDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error?.message || "เกิดข้อผิดพลาดในการยื่นคำร้อง");
      }
    });
  };

  const handleApprove = () => {
    if (!targetRequest) return;
    startTransition(async () => {
      const res = await approveDocumentStepAction({
        documentId: targetRequest.id,
        comment: comment || undefined,
      });
      if (res.ok) {
        toast.success(t("documents.msg.approved"));
        setApprovalDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error?.message || "เกิดข้อผิดพลาดในการอนุมัติ");
      }
    });
  };

  const handleReject = () => {
    if (!targetRequest) return;
    if (!rejectionReason.trim()) {
      toast.error("กรุณาระบุเหตุผลการปฏิเสธหรือตีกลับเอกสาร");
      return;
    }
    startTransition(async () => {
      const res = await rejectDocumentStepAction({
        documentId: targetRequest.id,
        rejectionReason,
      });
      if (res.ok) {
        toast.success(t("documents.msg.rejected"));
        setApprovalDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error?.message || "เกิดข้อผิดพลาดในการปฏิเสธ");
      }
    });
  };

  const handleCancelRequest = (id: string, docNo: string) => {
    if (!confirm(`ยืนยันการยกเลิกคำร้อง ${docNo}?`)) return;
    startTransition(async () => {
      const res = await cancelDocumentRequestAction(id);
      if (res.ok) {
        toast.success(t("documents.msg.cancelled"));
        router.refresh();
      } else {
        toast.error(res.error?.message || "ไม่สามารถยกเลิกคำร้องได้");
      }
    });
  };

  const handleCreateType = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createDocumentTypeAction({
        code: typeCode,
        nameTh: typeNameTh,
        nameEn: typeNameEn,
        descriptionTh: typeDescTh || undefined,
        requiredFields: [],
        isActive: true,
      });
      if (res.ok) {
        toast.success(t("documents.msg.typeCreated"));
        setTypeDialogOpen(false);
        setTypeCode("");
        setTypeNameTh("");
        setTypeNameEn("");
        setTypeDescTh("");
        router.refresh();
      } else {
        toast.error(res.error?.message || "เกิดข้อผิดพลาดในการสร้างประเภทเอกสาร");
      }
    });
  };

  const getStatusTone = (status: string): "ok" | "warn" | "bad" | "off" => {
    switch (status) {
      case "APPROVED":
        return "ok";
      case "SUBMITTED":
      case "IN_REVIEW":
        return "warn";
      case "REJECTED":
        return "bad";
      case "CANCELLED":
        return "off";
      default:
        return "warn";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "ฉบับร่าง";
      case "SUBMITTED":
        return "ยื่นคำร้องแล้ว";
      case "IN_REVIEW":
        return "กำลังพิจารณา";
      case "APPROVED":
        return "อนุมัติแล้ว";
      case "REJECTED":
        return "ปฏิเสธ / ตีกลับ";
      case "CANCELLED":
        return "ยกเลิกคำร้อง";
      default:
        return status;
    }
  };

  const filteredRequests = initialRequests.filter((r) => {
    if (activeTab === "INBOX" && r.status !== "SUBMITTED" && r.status !== "IN_REVIEW") {
      return false;
    }
    if (activeTab === "MY" && r.requesterId !== currentUserId) {
      return false;
    }
    if (activeTab === "APPROVED" && r.status !== "APPROVED") {
      return false;
    }
    if (activeTab === "REJECTED" && r.status !== "REJECTED") {
      return false;
    }

    const q = search.toLowerCase();
    return (
      !search ||
      r.documentNo.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.typeNameTh.toLowerCase().includes(q) ||
      r.requesterName.toLowerCase().includes(q)
    );
  });

  const inboxCount = initialRequests.filter(
    (r) => r.status === "SUBMITTED" || r.status === "IN_REVIEW"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="size-6 text-primary" />
            {t("documents.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("documents.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTypeDialogOpen(true)}
              className="flex items-center gap-1.5"
            >
              <FolderPlus className="size-4" />
              ประเภทเอกสาร ({types.length})
            </Button>
          )}

          {canCreate && (
            <Button
              size="sm"
              onClick={openCreateDialog}
              className="flex items-center gap-1.5"
            >
              <Plus className="size-4" />
              {t("documents.btn.create")}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            variant={activeTab === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("ALL")}
            className="text-xs h-8"
          >
            ทั้งหมด ({initialRequests.length})
          </Button>

          <Button
            variant={activeTab === "INBOX" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("INBOX")}
            className="text-xs h-8 relative"
          >
            กล่องรออนุมัติ ({inboxCount})
          </Button>

          <Button
            variant={activeTab === "MY" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("MY")}
            className="text-xs h-8"
          >
            คำร้องของฉัน
          </Button>

          <Button
            variant={activeTab === "APPROVED" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("APPROVED")}
            className="text-xs h-8"
          >
            อนุมัติแล้ว
          </Button>

          <Button
            variant={activeTab === "REJECTED" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("REJECTED")}
            className="text-xs h-8"
          >
            ถูกปฏิเสธ / ตีกลับ
          </Button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่, เรื่อง, ผู้ยื่น..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Documents List */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card">
          <FileText className="size-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-semibold text-foreground">ไม่พบรายการเอกสาร</h3>
          <p className="text-xs text-muted-foreground mt-1">
            ยังไม่มีเอกสารในหมวดหมู่นี้ หรือลองปรับคำค้นหา
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((r) => {
            const isPendingApproval = r.status === "SUBMITTED" || r.status === "IN_REVIEW";
            const isMine = r.requesterId === currentUserId;

            return (
              <div
                key={r.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border shadow-xs hover:border-primary/40 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-muted rounded text-foreground">
                      {r.documentNo}
                    </span>
                    <span className="text-xs font-medium text-primary px-2 py-0.5 bg-primary/10 rounded">
                      {r.typeNameTh}
                    </span>
                    <StatusPill tone={getStatusTone(r.status)}>
                      {getStatusLabel(r.status)}
                    </StatusPill>
                  </div>

                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {r.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>ผู้ยื่น: {r.requesterName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatDate(r.createdAt, "th", { time: true })}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-foreground">
                      ขั้นตอนที่ {r.currentStep} / {r.totalSteps}
                      {r.currentApproverRole ? ` (รอ ${r.currentApproverRole})` : ""}
                    </span>
                  </div>

                  {r.rejectionReason && (
                    <p className="text-xs text-destructive bg-destructive/10 px-2.5 py-1 rounded">
                      เหตุผลที่ตีกลับ: {r.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openViewDialog(r)}
                    className="flex items-center gap-1 h-8 text-xs"
                  >
                    <Eye className="size-3.5" />
                    ดูรายละเอียด
                  </Button>

                  {canApprove && isPendingApproval && (
                    <Button
                      size="sm"
                      onClick={() => openApprovalDialog(r)}
                      className="flex items-center gap-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="size-3.5" />
                      พิจารณาลงนาม
                    </Button>
                  )}

                  {isMine && (r.status === "DRAFT" || r.status === "SUBMITTED") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelRequest(r.id, r.documentNo)}
                      className="h-8 text-xs text-muted-foreground hover:text-destructive"
                    >
                      ยกเลิก
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Dialog */}
      <LiyonDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} wide>
        {viewTarget && (
          <div>
            <LiyonDialogCloseButton label={t("btn.close")} />
            <LiyonDialogHeader
              title={`${viewTarget.documentNo} - ${viewTarget.title}`}
              description={`ประเภทเอกสาร: ${viewTarget.typeNameTh} | ผู้ยื่น: ${viewTarget.requesterName}`}
            />

            <LiyonDialogBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/40 rounded-lg text-xs">
                  <div>
                    <span className="text-muted-foreground block">สถานะ:</span>
                    <span className="font-semibold text-foreground">
                      {getStatusLabel(viewTarget.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">ขั้นตอนปัจจุบัน:</span>
                    <span className="font-semibold text-foreground">
                      {viewTarget.currentStep} / {viewTarget.totalSteps}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">วันที่ยื่น:</span>
                    <span className="font-semibold text-foreground">
                      {formatDate(viewTarget.createdAt, "th")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">ผู้รอลงนาม:</span>
                    <span className="font-semibold text-foreground">
                      {viewTarget.currentApproverRole || "-"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    เนื้อหาคำร้อง / วัตถุประสงค์
                  </h4>
                  <div className="p-3.5 rounded-lg border border-border bg-card text-sm leading-relaxed whitespace-pre-wrap">
                    {viewTarget.content}
                  </div>
                </div>

                {/* Metadata details if any */}
                {Object.keys(viewTarget.metadata).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      ข้อมูลประกอบเพิ่มเติม
                    </h4>
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border border-border bg-card text-xs">
                      {Object.entries(viewTarget.metadata).map(([key, val]) => (
                        <div key={key}>
                          <span className="text-muted-foreground">{key}: </span>
                          <span className="font-medium text-foreground">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approval Timeline */}
                {viewTarget.approvalSteps && viewTarget.approvalSteps.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      บันทึกเส้นทางการอนุมัติ
                    </h4>
                    <div className="space-y-2">
                      {viewTarget.approvalSteps.map((step) => (
                        <div
                          key={step.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card text-xs"
                        >
                          <div className="mt-0.5">
                            {step.status === "APPROVED" ? (
                              <CheckCircle2 className="size-4 text-emerald-600" />
                            ) : (
                              <XCircle className="size-4 text-destructive" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">
                                ขั้นตอนที่ {step.stepNumber}: {step.approverRole}
                              </span>
                              {step.actionAt && (
                                <span className="text-muted-foreground text-[11px]">
                                  {formatDate(step.actionAt, "th", { time: true })}
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground mt-0.5">
                              ผู้ลงนาม: {step.approverName || "-"}
                            </p>
                            {step.comment && (
                              <p className="text-foreground mt-1 bg-muted p-2 rounded">
                                ความเห็น: {step.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                {t("btn.close")}
              </Button>
            </LiyonDialogFooter>
          </div>
        )}
      </LiyonDialog>

      {/* Approval / Rejection Modal */}
      <LiyonDialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        {targetRequest && (
          <div>
            <LiyonDialogCloseButton label={t("btn.cancel")} />
            <LiyonDialogHeader
              title={`พิจารณาลงนามเอกสาร ${targetRequest.documentNo}`}
              description={`เรื่อง: ${targetRequest.title}`}
            />

            <LiyonDialogBody>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
                  <div>
                    <span className="text-muted-foreground">ประเภท: </span>
                    <span className="font-medium text-foreground">{targetRequest.typeNameTh}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ผู้ยื่นคำร้อง: </span>
                    <span className="font-medium text-foreground">{targetRequest.requesterName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ขั้นตอน: </span>
                    <span className="font-medium text-foreground">
                      ขั้นตอนที่ {targetRequest.currentStep} จาก {targetRequest.totalSteps}
                    </span>
                  </div>
                </div>

                {!rejectMode ? (
                  <LiyonField label="ข้อความ / ความเห็นการลงนาม (ไม่บังคับ)">
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="เห็นควรอนุมัติตามเสนอ..."
                    />
                  </LiyonField>
                ) : (
                  <LiyonField label="เหตุผลในการปฏิเสธหรือตีกลับเอกสาร (จำเป็นต้องระบุ)">
                    <textarea
                      required
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-destructive rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-destructive"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="ระบุเหตุผลความจำเป็นที่ไม่อนุมัติหรือเอกสารไม่ครบถ้วน..."
                    />
                  </LiyonField>
                )}
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setApprovalDialogOpen(false)}
              >
                {t("btn.cancel")}
              </Button>

              {!rejectMode ? (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setRejectMode(true)}
                  >
                    ตีกลับ / ปฏิเสธ
                  </Button>
                  <Button
                    type="button"
                    disabled={pending}
                    onClick={handleApprove}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {pending ? t("btn.saving") : "อนุมัติและลงนาม"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setRejectMode(false)}
                  >
                    ย้อนกลับ
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pending}
                    onClick={handleReject}
                  >
                    {pending ? t("btn.saving") : "ยืนยันการปฏิเสธ"}
                  </Button>
                </>
              )}
            </LiyonDialogFooter>
          </div>
        )}
      </LiyonDialog>

      {/* Create Request Dialog */}
      <LiyonDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} wide>
        <form onSubmit={handleCreateSubmit}>
          <LiyonDialogCloseButton label={t("btn.cancel")} />
          <LiyonDialogHeader
            title="ยื่นคำร้องและส่งเอกสารใหม่"
            description="กรอกข้อมูลเอกสารเพื่อเข้าสู่กระบวนการพิจารณาและลงนามอิเล็กทรอนิกส์"
          />

          <LiyonDialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="ประเภทแบบฟอร์ม / เอกสาร">
                  <LiyonSelect
                    value={typeId}
                    onChange={(e) => setTypeId(e.target.value)}
                  >
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameTh}
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label="จำนวนขั้นตอนการอนุมัติ">
                  <LiyonSelect
                    value={totalSteps}
                    onChange={(e) => setTotalSteps(Number(e.target.value))}
                  >
                    <option value={1}>1 ขั้นตอน (หัวหน้างาน/ภาควิชา)</option>
                    <option value={2}>2 ขั้นตอน (หัวหน้าภาควิชา & คณบดี)</option>
                    <option value={3}>3 ขั้นตอน (หัวหน้างาน, รองคณบดี, คณบดี)</option>
                  </LiyonSelect>
                </LiyonField>
              </div>

              <LiyonField label="เรื่อง / วัตถุประสงค์">
                <input
                  required
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ขออนุมัติเดินทางไปราชการ หรือ ขอลาพักผ่อน"
                />
              </LiyonField>

              <LiyonField label="รายละเอียดและเหตุผลความจำเป็น">
                <textarea
                  required
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="ระบุรายละเอียดข้อความคำร้อง กำหนดการ สถานที่ หรือเหตุผลความจำเป็น..."
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              {t("btn.cancel")}
            </Button>
            <Button type="submit" disabled={pending} className="flex items-center gap-1.5">
              <Send className="size-4" />
              {pending ? t("btn.saving") : "ยื่นคำร้องทันที"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Create Document Type Dialog */}
      <LiyonDialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
        <form onSubmit={handleCreateType}>
          <LiyonDialogCloseButton label={t("btn.close")} />
          <LiyonDialogHeader
            title="เพิ่มประเภทเอกสารใหม่"
            description="กำหนดแบบฟอร์มคำร้องและรหัสเอกสารของคณะ"
          />

          <LiyonDialogBody>
            <div className="space-y-4">
              <LiyonField label="รหัสแบบฟอร์ม (เช่น DOC-REQ-PROCUREMENT)">
                <input
                  required
                  className="w-full px-3 py-2 text-sm font-mono border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={typeCode}
                  onChange={(e) => setTypeCode(e.target.value)}
                  placeholder="DOC-REQ-..."
                />
              </LiyonField>

              <LiyonField label="ชื่อแบบฟอร์ม (ภาษาไทย)">
                <input
                  required
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={typeNameTh}
                  onChange={(e) => setTypeNameTh(e.target.value)}
                  placeholder="เช่น แบบขอจัดซื้อจัดจ้างพัสดุ"
                />
              </LiyonField>

              <LiyonField label="ชื่อแบบฟอร์ม (ภาษาอังกฤษ)">
                <input
                  required
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={typeNameEn}
                  onChange={(e) => setTypeNameEn(e.target.value)}
                  placeholder="e.g. Procurement Request Form"
                />
              </LiyonField>

              <LiyonField label="คำอธิบายแบบฟอร์ม">
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={typeDescTh}
                  onChange={(e) => setTypeDescTh(e.target.value)}
                  placeholder="คำชี้แจงสำหรับผู้ยื่นคำร้อง..."
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTypeDialogOpen(false)}
            >
              {t("btn.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("btn.saving") : "เพิ่มประเภทเอกสาร"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
