import { notFound } from "next/navigation";
import Link from "next/link";
import { getPortalTenantId } from "@/shared/lib/portal-tenant";
import { getProgramById } from "@/features/curriculum/server";
import {
  ArrowLeft,
  GraduationCap,
  Clock,
  Coins,
  BookOpen,
  Briefcase,
  FileText,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgramPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProgramPageProps) {
  const { id } = await params;
  const tenantId = await getPortalTenantId();

  const program = await getProgramById(tenantId, id);
  if (!program) return { title: "ไม่พบหลักสูตร | คณะและสำนักงานบริหารส่วนกลาง" };

  return {
    title: `${program.nameTh} (${program.code}) | คณะและสำนักงานบริหารส่วนกลาง`,
    description: program.descriptionTh || program.nameTh,
  };
}

export default async function PublicProgramDetailPage({ params }: ProgramPageProps) {
  const { id } = await params;
  const tenantId = await getPortalTenantId();

  const program = await getProgramById(tenantId, id);
  if (!program || !program.isActive) {
    notFound();
  }

  // Group courses by Year & Semester
  const coursesByYearSemester: Record<string, typeof program.courses> = {};
  if (program.courses) {
    for (const c of program.courses) {
      const key = `ปีที่ ${c.year} ภาคการศึกษาที่ ${c.semester}`;
      if (!coursesByYearSemester[key]) coursesByYearSemester[key] = [];
      coursesByYearSemester[key].push(c);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href="/programs">
            <ArrowLeft className="size-4" />
            ย้อนกลับไปหน้ารวมหลักสูตร
          </Link>
        </Button>
      </div>

      {/* Program Header */}
      <header className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-1 bg-muted rounded-md text-foreground">
            {program.code}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
            {program.level === "BACHELOR"
              ? "ปริญญาตรี"
              : program.level === "MASTER"
              ? "ปริญญาโท"
              : "ปริญญาเอก"}
          </span>

          {program.isAcceptingApplications && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="size-3.5" />
              เปิดรับสมัครบุคคลเข้าศึกษา
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {program.nameTh}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground font-medium">
          {program.nameEn}
        </p>

        <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
          <div>
            <span className="text-muted-foreground">ชื่อปริญญา (ไทย): </span>
            <span className="font-semibold text-foreground">{program.degreeTh}</span>
          </div>
          <div>
            <span className="text-muted-foreground">ชื่อปริญญา (อังกฤษ): </span>
            <span className="font-semibold text-foreground">{program.degreeEn}</span>
          </div>
          {program.departmentNameTh && (
            <div>
              <span className="text-muted-foreground">ภาควิชาผู้รับผิดชอบ: </span>
              <span className="font-semibold text-foreground">{program.departmentNameTh}</span>
            </div>
          )}
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">จำนวนหน่วยกิตรวม</div>
              <div className="text-lg font-bold text-foreground">{program.totalCredits} หน่วยกิต</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Clock className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">ระยะเวลาการศึกษา</div>
              <div className="text-lg font-bold text-foreground">{program.durationYears} ปี</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Coins className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">ค่าธรรมเนียมการศึกษา</div>
              <div className="text-lg font-bold text-foreground">
                {program.tuitionFeePerTerm
                  ? `฿${program.tuitionFeePerTerm.toLocaleString()}/ภาค`
                  : "ตามประกาศมหาวิทยาลัย"}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Bar */}
        {(program.isAcceptingApplications || program.curriculumPdfUrl) && (
          <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-border">
            {program.isAcceptingApplications && program.applicationLink && (
              <Button asChild size="default" className="gap-2">
                <a href={program.applicationLink} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  ยื่นใบสมัครออนไลน์
                </a>
              </Button>
            )}

            {program.curriculumPdfUrl && (
              <Button asChild variant="outline" size="default" className="gap-2">
                <a href={program.curriculumPdfUrl} target="_blank" rel="noreferrer">
                  <FileText className="size-4" />
                  ดาวน์โหลดเล่มหลักสูตร มคอ.2 (PDF)
                </a>
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Description */}
      {program.descriptionTh && (
        <section className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-xs space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            จุดเด่นและวัตถุประสงค์ของหลักสูตร
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {program.descriptionTh}
          </p>
        </section>
      )}

      {/* Career Opportunities */}
      {program.careerOpportunities.length > 0 && (
        <section className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Briefcase className="size-5 text-primary" />
            แนวทางการประกอบอาชีพหลังสำเร็จการศึกษา
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {program.careerOpportunities.map((job, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 text-sm font-medium text-foreground"
              >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>{job}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Course Structure by Year / Semester */}
      <section className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            โครงสร้างแผนการเรียนและรายวิชา
          </h2>
          <span className="text-xs text-muted-foreground">
            {program.courses ? `${program.courses.length} รายวิชาตัวอย่าง` : ""}
          </span>
        </div>

        {Object.keys(coursesByYearSemester).length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            กำลังปรับปรุงข้อมูลแผนการศึกษาและรายวิชา
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(coursesByYearSemester).map(([term, courses]) => (
              <div key={term} className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-lg inline-block">
                  {term}
                </h3>
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                  {courses?.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                            {c.code}
                          </span>
                          <span className="font-semibold text-foreground text-sm">
                            {c.nameTh}
                          </span>
                        </div>
                        <div className="text-muted-foreground pl-1">{c.nameEn}</div>
                      </div>
                      <span className="font-semibold text-primary px-2.5 py-1 bg-primary/10 rounded-md shrink-0 self-start sm:self-center">
                        {c.credits} หน่วยกิต
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
