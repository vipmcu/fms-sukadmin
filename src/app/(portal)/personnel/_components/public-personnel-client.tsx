"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Mail, Building, UserCheck, ArrowRight, Award } from "lucide-react";
import type { DepartmentDto, PersonnelProfileDto } from "@/features/personnel";

interface PublicPersonnelClientProps {
  departments: DepartmentDto[];
  personnel: PersonnelProfileDto[];
}

export function PublicPersonnelClient({
  departments,
  personnel,
}: PublicPersonnelClientProps) {
  const [search, setSearch] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const filtered = personnel.filter((p) => {
    const matchDept = selectedDeptId === "ALL" || p.departmentId === selectedDeptId;
    const matchType = selectedType === "ALL" || p.type === selectedType;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      p.fullNameTh.toLowerCase().includes(q) ||
      (p.fullNameEn && p.fullNameEn.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      p.expertise.some((e) => e.toLowerCase().includes(q));
    return matchDept && matchType && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <UserCheck className="size-3.5" />
          ทำเนียบบุคลากรคณะ
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          คณาจารย์และบุคลากร
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
          ค้นหาข้อมูลคณาจารย์ผู้ทรงคุณวุฒิ นักวิจัย และบุคลากรสายสนับสนุนประจำภาควิชาและสำนักงาน
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, ความเชี่ยวชาญ, อีเมล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="ค้นหาบุคลากร"
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Department filter */}
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            aria-label="เลือกภาควิชาหรือหน่วยงาน"
            className="text-xs px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">ทุกภาควิชา / หน่วยงาน ({personnel.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameTh}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <div role="group" aria-label="กรองประเภทบุคลากร (Filter by Personnel Type)" className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
            <button
              type="button"
              onClick={() => setSelectedType("ALL")}
              aria-pressed={selectedType === "ALL"}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                selectedType === "ALL"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("ACADEMIC")}
              aria-pressed={selectedType === "ACADEMIC"}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                selectedType === "ACADEMIC"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              สายวิชาการ
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("SUPPORT")}
              aria-pressed={selectedType === "SUPPORT"}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                selectedType === "SUPPORT"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              สายสนับสนุน
            </button>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-border bg-card">
          <UserCheck className="size-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="text-lg font-semibold text-foreground">ไม่พบบุคลากรตามเงื่อนไข</h3>
          <p className="text-sm text-muted-foreground mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือเลือกสังกัดอื่น
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between p-6 bg-card rounded-2xl border border-border shadow-xs hover:shadow-md hover:border-primary/50 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border shadow-xs">
                    {p.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.avatarUrl}
                        alt={p.fullNameTh}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        {p.firstNameTh.slice(0, 1)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                      {p.type === "ACADEMIC" ? "อาจารย์ประจำ" : "เจ้าหน้าที่"}
                    </span>

                    <h2 className="font-bold text-base text-foreground mt-1.5 truncate group-hover:text-primary transition-colors">
                      {p.fullNameTh}
                    </h2>
                    {p.fullNameEn && (
                      <p className="text-xs text-muted-foreground truncate">{p.fullNameEn}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-3 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <Building className="size-3.5 shrink-0 text-primary/70" />
                    <span className="truncate">{p.departmentNameTh}</span>
                  </div>

                  {p.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="size-3.5 shrink-0 text-primary/70" />
                      <a
                        href={`mailto:${p.email}`}
                        className="truncate hover:text-primary hover:underline"
                      >
                        {p.email}
                      </a>
                    </div>
                  )}

                  {p.officeRoom && (
                    <div className="flex items-center gap-2">
                      <Award className="size-3.5 shrink-0 text-primary/70" />
                      <span>{p.officeRoom}</span>
                    </div>
                  )}
                </div>

                {p.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.expertise.slice(0, 3).map((exp, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium"
                      >
                        {exp}
                      </span>
                    ))}
                    {p.expertise.length > 3 && (
                      <span className="text-[11px] px-1.5 py-0.5 text-muted-foreground">
                        +{p.expertise.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
                <Link
                  href={`/personnel/${p.id}`}
                  className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  ดูประวัติและผลงานวิจัย
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
