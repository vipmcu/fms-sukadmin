-- CreateTable
CREATE TABLE "supply_requisitions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "requisition_no" VARCHAR(50) NOT NULL,
    "requester_id" UUID NOT NULL,
    "status" "RequisitionStatus" NOT NULL DEFAULT 'PENDING',
    "purpose" TEXT,
    "rejection_reason" TEXT,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMPTZ,
    "dispatched_by_id" UUID,
    "dispatched_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "supply_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_requisition_items" (
    "id" UUID NOT NULL,
    "requisition_id" UUID NOT NULL,
    "supply_item_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "supply_requisition_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "supply_requisitions_tenant_id_status_requester_id_idx" ON "supply_requisitions"("tenant_id", "status", "requester_id");

-- CreateIndex
CREATE UNIQUE INDEX "supply_requisitions_tenant_id_requisition_no_key" ON "supply_requisitions"("tenant_id", "requisition_no");

-- CreateIndex
CREATE UNIQUE INDEX "supply_requisition_items_requisition_id_supply_item_id_key" ON "supply_requisition_items"("requisition_id", "supply_item_id");

-- AddForeignKey
ALTER TABLE "supply_requisitions" ADD CONSTRAINT "supply_requisitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_requisitions" ADD CONSTRAINT "supply_requisitions_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_requisitions" ADD CONSTRAINT "supply_requisitions_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_requisitions" ADD CONSTRAINT "supply_requisitions_dispatched_by_id_fkey" FOREIGN KEY ("dispatched_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_requisition_items" ADD CONSTRAINT "supply_requisition_items_requisition_id_fkey" FOREIGN KEY ("requisition_id") REFERENCES "supply_requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_requisition_items" ADD CONSTRAINT "supply_requisition_items_supply_item_id_fkey" FOREIGN KEY ("supply_item_id") REFERENCES "supply_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
