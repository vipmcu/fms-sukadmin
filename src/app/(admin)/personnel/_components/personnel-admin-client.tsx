"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Mail,
  Phone,
  Building,
  GraduationCap,
  FolderPlus,
  UserCheck,
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
  LiyonSwitch,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { DepartmentDto, PersonnelProfileDto } from "@/features/personnel";
import {
  createDepartmentAction,
  createPersonnelAction,
  updatePersonnelAction,
  deletePersonnelAction,
} from "@/features/personnel/actions";

interface PersonnelAdminClientProps {
  departments: DepartmentDto[];
  initialPersonnel: PersonnelProfileDto[];
  canManage: boolean;
  canCreate: boolean;
}

export function PersonnelAdminClient({
  departments,
  initialPersonnel,
  canManage,
  canCreate,
}: PersonnelAdminClientProps) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Personnel Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PersonnelProfileDto | null>(null);

  const [departmentId, setDepartmentId] = useState(departments[0]?.id || "");
  const [type, setType] = useState<"ACADEMIC" | "SUPPORT">("ACADEMIC");
  const [academicPosition, setAcademicPosition] = useState<
    "NONE" | "LECTURER" | "ASST_PROF" | "ASSOC_PROF" | "PROF"
  >("NONE");
  const [prefixTh, setPrefixTh] = useState("ดร.");
  const [prefixEn, setPrefixEn] = useState("Dr.");
  const [firstNameTh, setFirstNameTh] = useState("");
  const [lastNameTh, setLastNameTh] = useState("");
  const [firstNameEn, setFirstNameEn] = useState("");
  const [lastNameEn, setLastNameEn] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [officeRoom, setOfficeRoom] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Department Dialog State
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [deptCode, setDeptCode] = useState("");
  const [deptNameTh, setDeptNameTh] = useState("");
  const [deptNameEn, setDeptNameEn] = useState("");

  const openCreatePersonnel = () => {
    setEditTarget(null);
    setDepartmentId(departments[0]?.id || "");
    setType("ACADEMIC");
    setAcademicPosition("LECTURER");
    setPrefixTh("อ.ดร.");
    setPrefixEn("Dr.");
    setFirstNameTh("");
    setLastNameTh("");
    setFirstNameEn("");
    setLastNameEn("");
    setEmail("");
    setPhone("");
    setOfficeRoom("");
    setAvatarUrl("");
    setExpertiseInput("");
    setOrder(initialPersonnel.length + 1);
    setIsActive(true);
    setDialogOpen(true);
  };

  const openEditPersonnel = (p: PersonnelProfileDto) => {
    setEditTarget(p);
    setDepartmentId(p.departmentId);
    setType(p.type);
    setAcademicPosition(p.academicPosition);
    setPrefixTh(p.prefixTh);
    setPrefixEn(p.prefixEn || "");
    setFirstNameTh(p.firstNameTh);
    setLastNameTh(p.lastNameTh);
    setFirstNameEn(p.firstNameEn || "");
    setLastNameEn(p.lastNameEn || "");
    setEmail(p.email || "");
    setPhone(p.phone || "");
    setOfficeRoom(p.officeRoom || "");
    setAvatarUrl(p.avatarUrl || "");
    setExpertiseInput(p.expertise.join(", "));
    setOrder(p.order);
    setIsActive(p.isActive);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expertiseArray = expertiseInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      if (editTarget) {
        const res = await updatePersonnelAction({
          id: editTarget.id,
          departmentId,
          type,
          academicPosition,
          prefixTh,
          prefixEn: prefixEn || undefined,
          firstNameTh,
          lastNameTh,
          firstNameEn: firstNameEn || undefined,
          lastNameEn: lastNameEn || undefined,
          email: email || undefined,
          phone: phone || undefined,
          officeRoom: officeRoom || undefined,
          avatarUrl: avatarUrl || undefined,
          expertise: expertiseArray,
          order: Number(order),
          isActive,
        });
        if (res.ok) {
          toast.success(t("personnel.msg.updated"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error?.message || "เกิดข้อผิดพลาดในการแก้ไข");
        }
      } else {
        const res = await createPersonnelAction({
          departmentId,
          type,
          academicPosition,
          prefixTh,
          prefixEn: prefixEn || undefined,
          firstNameTh,
          lastNameTh,
          firstNameEn: firstNameEn || undefined,
          lastNameEn: lastNameEn || undefined,
          email: email || undefined,
          phone: phone || undefined,
          officeRoom: officeRoom || undefined,
          avatarUrl: avatarUrl || undefined,
          expertise: expertiseArray,
          order: Number(order),
          isActive,
        });
        if (res.ok) {
          toast.success(t("personnel.msg.created"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error?.message || "เกิดข้อผิดพลาดในการเพิ่มบุคลากร");
        }
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`ต้องการลบข้อมูลบุคลากร "${name}" ออกจากระบบหรือไม่?`)) return;
    startTransition(async () => {
      const res = await deletePersonnelAction(id);
      if (res.ok) {
        toast.success(t("personnel.msg.deleted"));
        router.refresh();
      } else {
        toast.error(res.error?.message || "ไม่สามารถลบข้อมูลได้");
      }
    });
  };

  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createDepartmentAction({
        code: deptCode,
        nameTh: deptNameTh,
        nameEn: deptNameEn,
        order: departments.length + 1,
      });
      if (res.ok) {
        toast.success("เพิ่มภาควิชา/หน่วยงานเรียบร้อยแล้ว");
        setDeptDialogOpen(false);
        setDeptCode("");
        setDeptNameTh("");
        setDeptNameEn("");
        router.refresh();
      } else {
        toast.error(res.error?.message || "เกิดข้อผิดพลาดในการสร้างหน่วยงาน");
      }
    });
  };

  const filtered = initialPersonnel.filter((p) => {
    const matchDept = selectedDeptId === "ALL" || p.departmentId === selectedDeptId;
    const matchType = selectedType === "ALL" || p.type === selectedType;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      p.fullNameTh.toLowerCase().includes(q) ||
      (p.fullNameEn && p.fullNameEn.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.officeRoom && p.officeRoom.toLowerCase().includes(q));
    return matchDept && matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="size-6 text-primary" />
            {t("personnel.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("personnel.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeptDialogOpen(true)}
              className="flex items-center gap-1.5"
            >
              <FolderPlus className="size-4" />
              ภาควิชา/หน่วยงาน ({departments.length})
            </Button>
          )}

          {canCreate && (
            <Button
              size="sm"
              onClick={openCreatePersonnel}
              className="flex items-center gap-1.5"
            >
              <Plus className="size-4" />
              {t("personnel.btn.create")}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, อีเมล, ห้องทำงาน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Dept filter */}
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">ทุกภาควิชา/หน่วยงาน</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameTh}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">ทุกสายงาน</option>
            <option value="ACADEMIC">{t("personnel.type.academic")}</option>
            <option value="SUPPORT">{t("personnel.type.support")}</option>
          </select>
        </div>
      </div>

      {/* Personnel Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card">
          <UserCheck className="size-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-semibold text-foreground">ไม่พบบุคลากรตามเงื่อนไข</h3>
          <p className="text-xs text-muted-foreground mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่มเพิ่มบุคลากรใหม่
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between p-4 bg-card rounded-xl border border-border shadow-xs hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border">
                    {p.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.avatarUrl}
                        alt={p.fullNameTh}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-bold text-muted-foreground">
                        {p.firstNameTh.slice(0, 1)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {p.type === "ACADEMIC" ? "สายวิชาการ" : "สายสนับสนุน"}
                      </span>
                      <StatusPill tone={p.isActive ? "ok" : "off"}>
                        {p.isActive ? "ปฏิบัติงาน" : "ระงับ"}
                      </StatusPill>
                    </div>

                    <h3 className="font-semibold text-foreground text-sm mt-1 truncate">
                      {p.fullNameTh}
                    </h3>
                    {p.fullNameEn && (
                      <p className="text-xs text-muted-foreground truncate">{p.fullNameEn}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="size-3.5 shrink-0" />
                    <span className="truncate">{p.departmentNameTh}</span>
                  </div>

                  {p.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="size-3.5 shrink-0" />
                      <a
                        href={`mailto:${p.email}`}
                        className="hover:text-primary hover:underline truncate"
                      >
                        {p.email}
                      </a>
                    </div>
                  )}

                  {p.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3.5 shrink-0" />
                      <span>{p.phone}</span>
                    </div>
                  )}

                  {p.officeRoom && (
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="size-3.5 shrink-0" />
                      <span>{p.officeRoom}</span>
                    </div>
                  )}
                </div>

                {p.expertise.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {p.expertise.slice(0, 3).map((exp, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {exp}
                      </span>
                    ))}
                    {p.expertise.length > 3 && (
                      <span className="text-[10px] px-1 py-0.5 text-muted-foreground">
                        +{p.expertise.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-border flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditPersonnel(p)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="size-3.5" />
                </Button>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(p.id, p.fullNameTh)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Personnel Form Dialog */}
      <LiyonDialog open={dialogOpen} onOpenChange={setDialogOpen} wide>
        <form onSubmit={handleSubmit}>
          <LiyonDialogCloseButton label={t("btn.cancel")} />
          <LiyonDialogHeader
            title={editTarget ? `แก้ไข ${editTarget.fullNameTh}` : "เพิ่มบุคลากรใหม่"}
            description="ระบุข้อมูลส่วนตัว ตำแหน่งทางวิชาการ สังกัด และช่องทางติดต่อ"
          />

          <LiyonDialogBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiyonField label="ภาควิชา / หน่วยงานสังกัด">
                  <LiyonSelect
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameTh}
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>

                <div className="grid grid-cols-2 gap-2">
                  <LiyonField label="สายงาน">
                    <LiyonSelect
                      value={type}
                      onChange={(e) => setType(e.target.value as "ACADEMIC" | "SUPPORT")}
                    >
                      <option value="ACADEMIC">{t("personnel.type.academic")}</option>
                      <option value="SUPPORT">{t("personnel.type.support")}</option>
                    </LiyonSelect>
                  </LiyonField>

                  <LiyonField label="ตำแหน่งวิชาการ">
                    <LiyonSelect
                      value={academicPosition}
                      onChange={(e) =>
                        setAcademicPosition(
                          e.target.value as
                            | "NONE"
                            | "LECTURER"
                            | "ASST_PROF"
                            | "ASSOC_PROF"
                            | "PROF"
                        )
                      }
                    >
                      <option value="NONE">{t("personnel.pos.none")}</option>
                      <option value="LECTURER">{t("personnel.pos.lecturer")}</option>
                      <option value="ASST_PROF">{t("personnel.pos.asstProf")}</option>
                      <option value="ASSOC_PROF">{t("personnel.pos.assocProf")}</option>
                      <option value="PROF">{t("personnel.pos.prof")}</option>
                    </LiyonSelect>
                  </LiyonField>
                </div>
              </div>

              {/* Thai Name */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <LiyonField label="คำนำหน้า (ไทย)">
                  <input
                    required
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={prefixTh}
                    onChange={(e) => setPrefixTh(e.target.value)}
                    placeholder="เช่น ผศ.ดร."
                  />
                </LiyonField>

                <div className="md:col-span-2">
                  <LiyonField label="ชื่อ (ไทย)">
                    <input
                      required
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={firstNameTh}
                      onChange={(e) => setFirstNameTh(e.target.value)}
                      placeholder="ชื่อจริงภาษาไทย"
                    />
                  </LiyonField>
                </div>

                <LiyonField label="นามสกุล (ไทย)">
                  <input
                    required
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={lastNameTh}
                    onChange={(e) => setLastNameTh(e.target.value)}
                    placeholder="นามสกุลภาษาไทย"
                  />
                </LiyonField>
              </div>

              {/* English Name */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <LiyonField label="Prefix (En)">
                  <input
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={prefixEn}
                    onChange={(e) => setPrefixEn(e.target.value)}
                    placeholder="e.g. Asst. Prof. Dr."
                  />
                </LiyonField>

                <div className="md:col-span-2">
                  <LiyonField label="First Name (En)">
                    <input
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={firstNameEn}
                      onChange={(e) => setFirstNameEn(e.target.value)}
                      placeholder="English First Name"
                    />
                  </LiyonField>
                </div>

                <LiyonField label="Last Name (En)">
                  <input
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={lastNameEn}
                    onChange={(e) => setLastNameEn(e.target.value)}
                    placeholder="English Last Name"
                  />
                </LiyonField>
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <LiyonField label="อีเมล">
                  <input
                    type="email"
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@university.ac.th"
                  />
                </LiyonField>

                <LiyonField label="เบอร์โทรศัพท์">
                  <input
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="02-xxx-xxxx ต่อ xx"
                  />
                </LiyonField>

                <LiyonField label="ห้องทำงาน">
                  <input
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={officeRoom}
                    onChange={(e) => setOfficeRoom(e.target.value)}
                    placeholder="อาคาร 2 ห้อง 2405"
                  />
                </LiyonField>
              </div>

              <LiyonField label="URL รูปภาพโปรไฟล์ (Avatar URL)">
                <input
                  type="url"
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </LiyonField>

              <LiyonField label="ความเชี่ยวชาญ / สาขาวิจัย (คั่นด้วยจุลภาค)">
                <input
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  placeholder="Artificial Intelligence, Machine Learning, Cloud Computing"
                />
              </LiyonField>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <LiyonSwitch checked={isActive} onCheckedChange={setIsActive} />
                  <div>
                    <div className="text-sm font-medium text-foreground">สถานะการปฏิบัติงาน</div>
                    <div className="text-xs text-muted-foreground">เปิดให้แสดงข้อมูลในทำเนียบบุคลากรบนเว็บไซต์</div>
                  </div>
                </label>

                <div className="w-24">
                  <LiyonField label="ลำดับแสดงผล">
                    <input
                      type="number"
                      className="w-full px-3 py-1.5 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                    />
                  </LiyonField>
                </div>
              </div>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              {t("btn.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("btn.saving") : editTarget ? t("btn.save") : t("personnel.btn.create")}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Department Dialog */}
      <LiyonDialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
        <form onSubmit={handleDeptSubmit}>
          <LiyonDialogCloseButton label={t("btn.close")} />
          <LiyonDialogHeader
            title="เพิ่มภาควิชา / หน่วยงานใหม่"
            description="กำหนดรหัสและชื่อภาควิชาเพื่อจัดหมวดหมู่บุคลากรและหลักสูตร"
          />

          <LiyonDialogBody>
            <div className="space-y-4">
              <LiyonField label="รหัสหน่วยงาน (เช่น DEPT-CS)">
                <input
                  required
                  className="w-full px-3 py-2 text-sm font-mono border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="DEPT-NEW"
                />
              </LiyonField>

              <LiyonField label="ชื่อภาควิชา / หน่วยงาน (ภาษาไทย)">
                <input
                  required
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={deptNameTh}
                  onChange={(e) => setDeptNameTh(e.target.value)}
                  placeholder="ภาควิชา..."
                />
              </LiyonField>

              <LiyonField label="ชื่อภาควิชา / หน่วยงาน (ภาษาอังกฤษ)">
                <input
                  required
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={deptNameEn}
                  onChange={(e) => setDeptNameEn(e.target.value)}
                  placeholder="Department of..."
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeptDialogOpen(false)}
            >
              {t("btn.cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("btn.saving") : "เพิ่มภาควิชา"}
            </Button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>
    </div>
  );
}
