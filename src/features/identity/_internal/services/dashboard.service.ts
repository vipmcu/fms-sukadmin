import { prisma } from "@/shared/lib/infra/prisma";

export interface DashboardStatsDto {
  users: number;
  activeUsers: number;
  roles: number;
  pendingDocs: number;
  pendingReservations: number;
  openTickets: number;
  pendingAdmissions: number;
  activeAssets: number;
  lowStockSupplies: number;
  publishedNews: number;
  activePersonnel: number;
}

export async function getDashboardStats(tenantId: string): Promise<DashboardStatsDto> {
  const [
    users,
    activeUsers,
    roles,
    pendingDocs,
    pendingReservations,
    openTickets,
    pendingAdmissions,
    activeAssets,
    lowStockSupplies,
    publishedNews,
    activePersonnel,
  ] = await Promise.all([
    prisma.userTenant.count({ where: { tenantId } }).catch(() => 0),
    prisma.userTenant.count({ where: { tenantId, isActive: true, user: { isActive: true } } }).catch(() => 0),
    prisma.role.count({ where: { tenantId } }).catch(() => 0),
    prisma.documentRequest.count({ where: { tenantId, status: { in: ["SUBMITTED", "IN_REVIEW"] } } }).catch(() => 0),
    prisma.reservation.count({ where: { tenantId, status: "PENDING" } }).catch(() => 0),
    prisma.serviceTicket.count({ where: { tenantId, status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] } } }).catch(() => 0),
    prisma.studentApplication.count({ where: { tenantId, status: { in: ["SUBMITTED", "DOCS_APPROVED", "INTERVIEW_ELIGIBLE"] } } }).catch(() => 0),
    prisma.assetItem.count({ where: { tenantId, status: "ACTIVE" } }).catch(() => 0),
    prisma.supplyItem.count({ where: { tenantId, currentStock: { lte: 10 } } }).catch(() => 0),
    prisma.newsArticle.count({ where: { tenantId, status: "PUBLISHED" } }).catch(() => 0),
    prisma.personnelProfile.count({ where: { tenantId, isActive: true } }).catch(() => 0),
  ]);

  return {
    users,
    activeUsers,
    roles,
    pendingDocs,
    pendingReservations,
    openTickets,
    pendingAdmissions,
    activeAssets,
    lowStockSupplies,
    publishedNews,
    activePersonnel,
  };
}
