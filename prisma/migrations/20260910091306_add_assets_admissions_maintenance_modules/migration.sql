-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'IN_USE', 'UNDER_REPAIR', 'DAMAGED', 'DISPOSED');

-- CreateEnum
CREATE TYPE "RequisitionStatus" AS ENUM ('PENDING', 'APPROVED', 'DISPATCHED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'DOCS_APPROVED', 'DOCS_REJECTED', 'INTERVIEW_ELIGIBLE', 'PASSED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'RESOLVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "asset_categories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "depreciation_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "useful_life_years" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "asset_code" VARCHAR(100) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255),
    "brand_model" VARCHAR(255),
    "serial_number" VARCHAR(100),
    "acquired_date" DATE,
    "acquired_price" DECIMAL(12,2),
    "funding_source" VARCHAR(100),
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "location" VARCHAR(255),
    "department_id" UUID,
    "responsible_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "asset_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_transactions" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "action_type" VARCHAR(50) NOT NULL,
    "from_value" TEXT,
    "to_value" TEXT,
    "remarks" TEXT,
    "actor_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "min_stock" INTEGER NOT NULL DEFAULT 10,
    "unit_cost" DECIMAL(10,2),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "supply_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_rounds" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "academic_year" INTEGER NOT NULL,
    "round_name" VARCHAR(150) NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "announcement_date" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "admission_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_program_quotas" (
    "id" UUID NOT NULL,
    "round_id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "quota_seats" INTEGER NOT NULL,
    "tuition_fee" DECIMAL(10,2),
    "criteria_th" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_program_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_applications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "round_id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "application_no" VARCHAR(50) NOT NULL,
    "national_id" VARCHAR(20) NOT NULL,
    "title" VARCHAR(20),
    "applicant_name_th" VARCHAR(255) NOT NULL,
    "applicant_name_en" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "school_name" VARCHAR(255),
    "gpax" DOUBLE PRECISION,
    "form_data" JSONB NOT NULL DEFAULT '{}',
    "documents" JSONB NOT NULL DEFAULT '[]',
    "status" "AdmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "score" DOUBLE PRECISION,
    "reviewer_comment" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_categories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "default_sla_hours" INTEGER NOT NULL DEFAULT 24,
    "icon" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_tickets" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "ticket_no" VARCHAR(50) NOT NULL,
    "category_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "resource_id" UUID,
    "asset_id" UUID,
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "photos" JSONB NOT NULL DEFAULT '[]',
    "completion_photos" JSONB NOT NULL DEFAULT '[]',
    "requester_name" VARCHAR(255) NOT NULL,
    "requester_email" VARCHAR(255) NOT NULL,
    "requester_phone" VARCHAR(50) NOT NULL,
    "assigned_technician_id" UUID,
    "sla_deadline" TIMESTAMPTZ,
    "resolved_at" TIMESTAMPTZ,
    "resolution_notes" TEXT,
    "parts_cost" DECIMAL(10,2),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "service_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_comments" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "author_id" UUID,
    "author_name" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_ratings" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_categories_tenant_id_code_key" ON "asset_categories"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "asset_items_tenant_id_status_category_id_idx" ON "asset_items"("tenant_id", "status", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_items_tenant_id_asset_code_key" ON "asset_items"("tenant_id", "asset_code");

-- CreateIndex
CREATE INDEX "asset_transactions_asset_id_created_at_idx" ON "asset_transactions"("asset_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "supply_items_tenant_id_code_key" ON "supply_items"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "admission_program_quotas_round_id_program_id_key" ON "admission_program_quotas"("round_id", "program_id");

-- CreateIndex
CREATE INDEX "student_applications_tenant_id_round_id_program_id_status_idx" ON "student_applications"("tenant_id", "round_id", "program_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "student_applications_tenant_id_application_no_key" ON "student_applications"("tenant_id", "application_no");

-- CreateIndex
CREATE UNIQUE INDEX "student_applications_tenant_id_round_id_program_id_national_key" ON "student_applications"("tenant_id", "round_id", "program_id", "national_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_tenant_id_code_key" ON "service_categories"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "service_tickets_tenant_id_status_priority_category_id_idx" ON "service_tickets"("tenant_id", "status", "priority", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_tickets_tenant_id_ticket_no_key" ON "service_tickets"("tenant_id", "ticket_no");

-- CreateIndex
CREATE INDEX "ticket_comments_ticket_id_created_at_idx" ON "ticket_comments"("ticket_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_ratings_ticket_id_key" ON "ticket_ratings"("ticket_id");

-- AddForeignKey
ALTER TABLE "asset_categories" ADD CONSTRAINT "asset_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_items" ADD CONSTRAINT "asset_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_items" ADD CONSTRAINT "asset_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "asset_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_items" ADD CONSTRAINT "asset_items_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_items" ADD CONSTRAINT "asset_items_responsible_id_fkey" FOREIGN KEY ("responsible_id") REFERENCES "personnel_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_transactions" ADD CONSTRAINT "asset_transactions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_transactions" ADD CONSTRAINT "asset_transactions_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_items" ADD CONSTRAINT "supply_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_rounds" ADD CONSTRAINT "admission_rounds_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_program_quotas" ADD CONSTRAINT "admission_program_quotas_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "admission_rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_program_quotas" ADD CONSTRAINT "admission_program_quotas_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "academic_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "admission_rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "academic_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "reservation_resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_assigned_technician_id_fkey" FOREIGN KEY ("assigned_technician_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "service_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_ratings" ADD CONSTRAINT "ticket_ratings_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "service_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
