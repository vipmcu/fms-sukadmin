"use client";

import { useState } from "react";
import Link from "next/link";
import { DoorOpen, Car, Users, MapPin, ArrowRight, ArrowUpRight, Calendar, Search, Sparkles } from "lucide-react";
import type { ReservationResourceDto } from "@/features/reservations";

interface FacilitiesCatalogClientProps {
  resources: ReservationResourceDto[];
}

export function FacilitiesCatalogClient({ resources }: FacilitiesCatalogClientProps) {
  const [filterType, setFilterType] = useState<"ALL" | "ROOM" | "VEHICLE">("ALL");
  const [search, setSearch] = useState("");

  const filtered = resources.filter((r) => {
    if (filterType !== "ALL" && r.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = r.nameTh.toLowerCase().includes(q) || r.nameEn.toLowerCase().includes(q);
      const matchCode = r.code.toLowerCase().includes(q);
      const matchLoc = r.locationOrPlate.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-12 pb-12">
      {/* 1. Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#f7f5ef] border border-[#c5a059]/40 text-[#16251e] text-[11px] font-semibold tracking-[0.2em] uppercase">
          <Sparkles className="size-3 text-[#c5a059]" />
          <span>Spatial Sanctuary & Mobility</span>
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl font-normal tracking-tight text-[#16251e]">
          ห้องประชุมและยานพาหนะส่วนกลาง
        </h1>
        <p className="text-[#55635c] text-xs sm:text-base font-light leading-relaxed">
          ให้บริการตรวจสอบข้อมูลสิ่งอำนวยความสะดวก ความพร้อมใช้งาน และปฏิทินตารางงาน
          สำหรับคณาจารย์ บุคลากร และนิสิต
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login?callbackUrl=/reservations/calendar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1e3328] hover:bg-[#13221b] text-white text-xs font-medium tracking-wide shadow-md transition-all"
          >
            <span>เข้าสู่ระบบเพื่อทำการจอง</span>
            <ArrowUpRight className="size-3.5 text-[#c5a059]" />
          </Link>
          <Link
            href="/facilities/schedule"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#c5a059] hover:bg-[#c5a059]/10 text-[#16251e] text-xs font-medium transition-all"
          >
            <Calendar className="size-3.5 text-[#1e3328]" />
            <span>ดูตารางการใช้งานประจำวัน</span>
          </Link>
        </div>
      </div>

      {/* 2. Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 glass-card-elevate border border-[#ded9cb] rounded-3xl shadow-xs">
        {/* Type Switcher */}
        <div role="group" aria-label="กรองประเภทสถานที่และยานพาหนะ (Filter facilities and vehicles)" className="flex items-center gap-1.5 p-1 bg-[#ede7dc]/80 rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            aria-pressed={filterType === "ALL"}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-xl transition-all ${
              filterType === "ALL"
                ? "bg-[#1e3328] text-white shadow-xs"
                : "text-[#55635c] hover:text-[#16251e]"
            }`}
          >
            ทั้งหมด ({resources.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("ROOM")}
            aria-pressed={filterType === "ROOM"}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-xl transition-all ${
              filterType === "ROOM"
                ? "bg-[#1e3328] text-white shadow-xs"
                : "text-[#55635c] hover:text-[#16251e]"
            }`}
          >
            ห้องประชุม ({resources.filter((r) => r.type === "ROOM").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("VEHICLE")}
            aria-pressed={filterType === "VEHICLE"}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-xl transition-all ${
              filterType === "VEHICLE"
                ? "bg-[#1e3328] text-white shadow-xs"
                : "text-[#55635c] hover:text-[#16251e]"
            }`}
          >
            ยานพาหนะ ({resources.filter((r) => r.type === "VEHICLE").length})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-80">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#55635c]" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัส, สถานที่..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="ค้นหาห้องประชุมหรือยานพาหนะ"
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-[#ded9cb] rounded-2xl bg-[#f7f5ef] text-[#16251e] placeholder:text-[#55635c]/60 focus:outline-none focus:ring-2 focus:ring-[#1e3328]/30"
          />
        </div>
      </div>

      {/* 3. Catalog Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-[#ded9cb] rounded-3xl glass-card-elevate">
          <p className="text-[#55635c] text-xs sm:text-sm font-light">ไม่พบข้อมูลห้องหรือยานพาหนะตามคำค้นหา</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((r) => {
            const isRoom = r.type === "ROOM";

            return (
              <div
                key={r.id}
                className="group p-7 glass-card-elevate border border-[#ded9cb] rounded-3xl shadow-xs hover:shadow-xl hover:border-[#c5a059]/60 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#1e3328]/10 text-[#1e3328] flex items-center justify-center shrink-0 group-hover:bg-[#1e3328] group-hover:text-white transition-all">
                        {isRoom ? <DoorOpen className="size-6" /> : <Car className="size-6" />}
                      </div>
                      <div>
                        <span className="font-mono text-[10px] font-semibold px-2 py-0.5 bg-[#ede7dc] text-[#55635c] rounded">
                          {r.code}
                        </span>
                        <h3 className="font-serif-luxury text-xl text-[#16251e] group-hover:text-[#1e3328] transition-colors mt-1 leading-snug">
                          {r.nameTh}
                        </h3>
                        <p className="text-xs text-[#55635c] font-light">{r.nameEn}</p>
                      </div>
                    </div>
                  </div>

                  {r.descriptionTh && (
                    <p className="text-xs text-[#55635c] line-clamp-2 leading-relaxed font-light">
                      {r.descriptionTh}
                    </p>
                  )}

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-[#55635c]">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#ede7dc]/60 border border-[#ded9cb]/60 font-light">
                      <Users className="size-3.5 text-[#c5a059] shrink-0" />
                      <span>ความจุ: <strong className="text-[#16251e] font-medium">{r.capacity}</strong> {isRoom ? "ที่นั่ง" : "คน"}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#ede7dc]/60 border border-[#ded9cb]/60 font-light">
                      <MapPin className="size-3.5 text-[#c5a059] shrink-0" />
                      <span className="truncate">{r.locationOrPlate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ded9cb]/60 flex items-center justify-between gap-3">
                  <Link
                    href={`/facilities/${r.id}`}
                    className="text-xs font-medium text-[#1e3328] hover:text-[#c5a059] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>ดูรายละเอียดสเปก</span>
                    <ArrowRight className="size-3" />
                  </Link>

                  <Link
                    href={`/facilities/${r.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#ded9cb] hover:border-[#c5a059] hover:bg-[#ede7dc] text-xs font-medium text-[#16251e] transition-all"
                  >
                    <span>สำรวจพื้นที่นี้</span>
                    <ArrowUpRight className="size-3 text-[#c5a059]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
