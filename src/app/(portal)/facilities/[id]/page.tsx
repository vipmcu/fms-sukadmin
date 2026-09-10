import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/infra/prisma";
import { auth } from "@/features/identity/server";
import { getResourceById } from "@/features/reservations/server";
import { FacilityDetailClient } from "./_components/facility-detail-client";

interface FacilityDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: FacilityDetailPageProps) {
  const { id } = await params;
  const tenant = await prisma.tenant.findFirst({ where: { isActive: true } });
  if (!tenant) return { title: "ไม่พบข้อมูล | ระบบจองห้องและยานพาหนะ" };

  const resource = await getResourceById(tenant.id, id);
  if (!resource) return { title: "ไม่พบข้อมูล | ระบบจองห้องและยานพาหนะ" };

  return {
    title: `${resource.nameTh} (${resource.code}) | คณะวิทยาการจัดการ`,
    description: resource.descriptionTh || resource.nameEn,
  };
}

export default async function FacilityDetailPage({ params }: FacilityDetailPageProps) {
  const { id } = await params;
  const tenant = await prisma.tenant.findFirst({ where: { isActive: true } });
  if (!tenant) {
    notFound();
  }

  const [resource, session] = await Promise.all([
    getResourceById(tenant.id, id),
    auth().catch(() => null),
  ]);

  if (!resource) {
    notFound();
  }

  return <FacilityDetailClient resource={resource} isLoggedIn={!!session?.user} />;
}
