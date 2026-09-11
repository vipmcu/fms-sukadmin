import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/infra/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Strip file extension if present (e.g. "a2fd246e-59d5-42f2-8ba0-7b189a4a603b.png" -> "a2fd246e-59d5-42f2-8ba0-7b189a4a603b")
    const fileId = id.replace(/\.[^/.]+$/, "");

    const file = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    return new Response(file.data, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": file.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
      },
    });
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function HEAD(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fileId = id.replace(/\.[^/.]+$/, "");

    const file = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
      select: { mimeType: true, size: true, filename: true },
    });

    if (!file) {
      return new NextResponse(null, { status: 404 });
    }

    return new Response(null, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": file.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
