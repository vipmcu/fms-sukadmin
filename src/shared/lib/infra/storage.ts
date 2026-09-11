import { prisma } from "@/shared/lib/infra/prisma";

export interface UploadFileOptions {
  tenantId?: string | null;
  file: File;
  folder?: string;
}

export interface UploadFileResult {
  url: string;
}

/**
 * Universal file storage adapter:
 * 1. Uses Vercel Blob if BLOB_READ_WRITE_TOKEN is configured.
 * 2. Falls back to PostgreSQL database storage (Prisma `uploadedFile` + `/api/files/[id]`)
 *    which works reliably across Vercel Serverless, Docker, and Localhost with zero extra configuration.
 */
export async function uploadFile({
  tenantId,
  file,
  folder = "logos",
}: UploadFileOptions): Promise<UploadFileResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";

  // 1. Vercel Blob (if token exists)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const filename = `${folder}/${tenantId ?? "common"}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const blob = await put(filename, file, { access: "public" });
      return { url: blob.url };
    } catch (err) {
      console.warn("Vercel Blob upload failed, falling back to database storage:", err);
    }
  }

  // 2. Database Storage (PostgreSQL ByteA via Prisma)
  const buffer = Buffer.from(await file.arrayBuffer());
  const record = await prisma.uploadedFile.create({
    data: {
      tenantId: tenantId ?? null,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      data: buffer,
    },
  });

  return { url: `/api/files/${record.id}.${ext}` };
}
