import { notFound } from "next/navigation";
import Link from "next/link";
import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { getPersonnelById } from "@/features/personnel/server";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  GraduationCap,
  BookOpen,
  Award,
  BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EducationItem {
  degree?: string;
  title?: string;
  institution?: string;
  year?: string;
}

interface PublicationItem {
  title?: string;
  journal?: string;
  publisher?: string;
  year?: string;
}

interface PersonnelPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PersonnelPageProps) {
  const { id } = await params;
  const tenantId = await getPortalTenantId();

  const person = await getPersonnelById(tenantId, id);
  if (!person) return { title: "ไม่พบบุคลากร | คณะและสำนักงานบริหารส่วนกลาง" };

  return {
    title: `${person.fullNameTh} | คณะและสำนักงานบริหารส่วนกลาง`,
    description: `${person.fullNameTh} ${person.departmentNameTh}`,
  };
}

export default async function PublicPersonnelDetailPage({ params }: PersonnelPageProps) {
  const { id } = await params;
  const tenantId = await getPortalTenantId();

  const person = await getPersonnelById(tenantId, id);
  if (!person || !person.isActive) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/personnel">
            <ArrowLeft className="size-4" />
            ย้อนกลับไปทำเนียบบุคลากร
          </Link>
        </Button>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-muted flex items-center justify-center shrink-0 border-2 border-border shadow-sm">
          {person.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.avatarUrl}
              alt={person.fullNameTh}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-primary">
              {person.firstNameTh.slice(0, 1)}
            </span>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {person.type === "ACADEMIC" ? "บุคลากรสายวิชาการ" : "บุคลากรสายสนับสนุน"}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {person.fullNameTh}
          </h1>

          {person.fullNameEn && (
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              {person.fullNameEn}
            </p>
          )}

          <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Building className="size-4 text-primary" />
              <span>{person.departmentNameTh}</span>
            </div>

            {person.officeRoom && (
              <div className="flex items-center gap-1.5">
                <Award className="size-4 text-primary" />
                <span>ห้องทำงาน: {person.officeRoom}</span>
              </div>
            )}

            {person.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="size-4 text-primary" />
                <a href={`mailto:${person.email}`} className="text-primary hover:underline">
                  {person.email}
                </a>
              </div>
            )}

            {person.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="size-4 text-primary" />
                <span>{person.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expertise */}
      {person.expertise.length > 0 && (
        <section className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Award className="size-5 text-primary" />
            ความเชี่ยวชาญและสาขาที่สนใจ
          </h2>
          <div className="flex flex-wrap gap-2 pt-1">
            {person.expertise.map((exp, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold"
              >
                {exp}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {person.education.length > 0 && (
        <section className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            ประวัติการศึกษา
          </h2>
          <div className="space-y-3">
            {(person.education as EducationItem[]).map((edu, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-muted/20 text-xs"
              >
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <BookOpen className="size-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {edu.degree || edu.title}
                  </div>
                  <div className="text-muted-foreground mt-0.5">
                    {edu.institution} {edu.year ? `(${edu.year})` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Publications */}
      {person.publications.length > 0 && (
        <section className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookMarked className="size-5 text-primary" />
            ผลงานทางวิชาการและงานวิจัยที่ตีพิมพ์
          </h2>
          <div className="space-y-3">
            {(person.publications as PublicationItem[]).map((pub, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-muted/20 text-xs space-y-1"
              >
                <div className="font-semibold text-foreground text-sm leading-snug">
                  {pub.title}
                </div>
                <div className="text-muted-foreground">
                  {pub.journal || pub.publisher} {pub.year ? `• พ.ศ. ${pub.year}` : ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
