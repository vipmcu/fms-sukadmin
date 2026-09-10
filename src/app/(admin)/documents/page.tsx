import { requirePermission, hasPermission } from "@/features/identity/server";
import { DOCUMENTS_P } from "@/features/documents";
import { listDocumentTypes, listDocumentRequests } from "@/features/documents/server";
import { DocumentsAdminClient } from "./_components/documents-admin-client";

export default async function AdminDocumentsPage() {
  const ctx = await requirePermission(DOCUMENTS_P.read);

  const types = await listDocumentTypes(ctx.tenantId);
  const requests = await listDocumentRequests(ctx.tenantId);

  return (
    <DocumentsAdminClient
      types={types}
      initialRequests={requests}
      canApprove={hasPermission(ctx, DOCUMENTS_P.approve)}
      canManage={hasPermission(ctx, DOCUMENTS_P.manage)}
      canCreate={hasPermission(ctx, DOCUMENTS_P.create)}
      currentUserId={ctx.userId}
    />
  );
}
