import { Suspense } from "react";
import { HelpdeskTrackingClient } from "./_components/helpdesk-tracking-client";

export const metadata = {
  title: "ติดตามสถานะงานแจ้งซ่อม | Helpdesk Portal",
  description: "ค้นหาและติดตามสถานะงานแจ้งซ่อมบำรุง ประเมินความพึงพอใจการบริการ",
};

export default function HelpdeskTrackingPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">กำลังโหลดระบบติดตามงานซ่อม...</div>}>
      <HelpdeskTrackingClient />
    </Suspense>
  );
}
