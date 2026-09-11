-- CreateTable
CREATE TABLE "uploaded_files" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "filename" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "uploaded_files_tenant_id_idx" ON "uploaded_files"("tenant_id");
