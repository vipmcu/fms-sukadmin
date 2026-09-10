import { Suspense } from "react";
import { TrackingClient } from "./_components/tracking-client";

export const metadata = {
  title: "ติดตามสถานะใบสมัคร | ระบบรับสมัครนิสิตใหม่",
  description: "ค้นหาและตรวจสอบสถานะผลการพิจารณาใบสมัครออนไลน์",
};

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">กำลังโหลดระบบติดตามผล...</div>}>
      <TrackingClient />
    </Suspense>
  );
}
