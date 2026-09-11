import { resolveTenantBranding } from "@/features/identity/server";
import { AdminLayoutClient } from "./_components/admin-layout-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const branding = await resolveTenantBranding();
  return <AdminLayoutClient branding={branding}>{children}</AdminLayoutClient>;
}

