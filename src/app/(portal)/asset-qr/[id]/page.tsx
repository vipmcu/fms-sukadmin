import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Package,
  MapPin,
  Building,
  Wrench,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill, type StatusPillTone } from "@/shared/components/liyon";
import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { getAssetById } from "@/features/assets/server";

interface AssetQrPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "ข้อมูลครุภัณฑ์ | ระบบตรวจสอบทรัพย์สิน",
  description: "รายละเอียดครุภัณฑ์ สถานที่จัดวาง และแจ้งปัญหาชำรุด",
};

export default async function AssetQrPage({ params }: AssetQrPageProps) {
  const { id } = await params;
  const tenantId = await getPortalTenantId();
  const asset = await getAssetById(tenantId, id);

  if (!asset) {
    notFound();
  }

  const getStatusTone = (status: string): StatusPillTone => {
    switch (status) {
      case "ACTIVE":
        return "ok";
      case "IN_USE":
        return "info";
      case "UNDER_REPAIR":
        return "warn";
      case "DAMAGED":
        return "bad";
      case "DISPOSED":
        return "off";
      default:
        return "off";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "พร้อมใช้งาน (Active)";
      case "IN_USE":
        return "กำลังใช้งาน (In Use)";
      case "UNDER_REPAIR":
        return "อยู่ระหว่างส่งซ่อม (Under Repair)";
      case "DAMAGED":
        return "ชำรุดเสียหาย (Damaged)";
      case "DISPOSED":
        return "แทงจำหน่ายแล้ว (Disposed)";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <div className="rounded-3xl border bg-card shadow-lg overflow-hidden text-card-foreground">
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-primary/95 to-primary p-6 text-primary-foreground text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center backdrop-blur-md">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div className="text-xs font-semibold tracking-wider uppercase opacity-80">
            ระบบตรวจสอบครุภัณฑ์ประจำคณะ
          </div>
          <div className="font-mono text-xl font-bold tracking-tight">
            {asset.assetCode}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-foreground">
              {asset.nameTh}
            </h1>
            {asset.brandModel && (
              <p className="text-sm text-muted-foreground">{asset.brandModel}</p>
            )}
            <div className="pt-2">
              <StatusPill tone={getStatusTone(asset.status)}>
                {getStatusLabel(asset.status)}
              </StatusPill>
            </div>
          </div>

          <div className="divide-y rounded-2xl border bg-muted/20 text-xs">
            <div className="p-3.5 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                หมวดหมู่:
              </span>
              <span className="font-medium text-foreground">{asset.categoryNameTh}</span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                สถานที่จัดวาง:
              </span>
              <span className="font-medium text-foreground text-right">{asset.location || "ไม่ระบุ"}</span>
            </div>

            {asset.departmentNameTh && (
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-primary" />
                  หน่วยงานสังกัด:
                </span>
                <span className="font-medium text-foreground text-right">{asset.departmentNameTh}</span>
              </div>
            )}

            {asset.serialNumber && (
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-muted-foreground">Serial Number:</span>
                <span className="font-mono text-foreground">{asset.serialNumber}</span>
              </div>
            )}
          </div>

          {/* Action to report repair */}
          <div className="space-y-3 pt-2">
            <Button asChild size="lg" className="w-full gap-2 font-bold shadow-md">
              <Link
                href={`/helpdesk?assetId=${asset.id}&location=${encodeURIComponent(
                  asset.location || ""
                )}`}
              >
                <Wrench className="h-4 w-4" />
                แจ้งซ่อม / แจ้งปัญหาครุภัณฑ์ชิ้นนี้
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              หากพบปัญหาการใช้งาน โทรติดต่อศูนย์บริการเทคโนโลยีสารสนเทศ โทร 1234
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
