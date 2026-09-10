-- CreateEnum
CREATE TYPE "resource_types" AS ENUM ('ROOM', 'VEHICLE');

-- CreateEnum
CREATE TYPE "reservation_statuses" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "sample_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sample_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_resources" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "type" "resource_types" NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "location_or_plate" VARCHAR(150) NOT NULL,
    "amenities" JSONB NOT NULL DEFAULT '{}',
    "image_url" VARCHAR(500),
    "description_th" TEXT,
    "description_en" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reservation_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "booking_no" VARCHAR(50) NOT NULL,
    "resource_id" UUID NOT NULL,
    "requester_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "purpose" TEXT NOT NULL,
    "attendees_count" INTEGER NOT NULL DEFAULT 1,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "status" "reservation_statuses" NOT NULL DEFAULT 'PENDING',
    "destination" VARCHAR(255),
    "driver_name" VARCHAR(150),
    "driver_phone" VARCHAR(50),
    "assigned_vehicle_plate" VARCHAR(50),
    "approver_id" UUID,
    "approval_note" TEXT,
    "approved_at" TIMESTAMPTZ,
    "cancelled_at" TIMESTAMPTZ,
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_blackouts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "reason" TEXT,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_blackouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sample_items_tenant_id_idx" ON "sample_items"("tenant_id");

-- CreateIndex
CREATE INDEX "reservation_resources_tenant_id_type_is_active_idx" ON "reservation_resources"("tenant_id", "type", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_resources_tenant_id_code_key" ON "reservation_resources"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "reservations_tenant_id_resource_id_start_time_end_time_stat_idx" ON "reservations"("tenant_id", "resource_id", "start_time", "end_time", "status");

-- CreateIndex
CREATE INDEX "reservations_tenant_id_requester_id_idx" ON "reservations"("tenant_id", "requester_id");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_tenant_id_booking_no_key" ON "reservations"("tenant_id", "booking_no");

-- CreateIndex
CREATE INDEX "resource_blackouts_tenant_id_resource_id_start_time_end_tim_idx" ON "resource_blackouts"("tenant_id", "resource_id", "start_time", "end_time");

-- AddForeignKey
ALTER TABLE "sample_items" ADD CONSTRAINT "sample_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_resources" ADD CONSTRAINT "reservation_resources_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "reservation_resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_blackouts" ADD CONSTRAINT "resource_blackouts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_blackouts" ADD CONSTRAINT "resource_blackouts_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "reservation_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
