import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface RouteParams {
  params: Promise<{
    playbackId: string;
    filename: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { playbackId, filename } = await params;

  const targetPath = path.join(
    process.cwd(),
    "public",
    "sites",
    "shader-se",
    "api",
    "mux-image",
    playbackId,
    filename
  );

  if (fs.existsSync(targetPath)) {
    const fileBuffer = fs.readFileSync(targetPath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Fallback to thumb_fallback.png
  const fallbackPath = path.join(
    process.cwd(),
    "public",
    "sites",
    "shader-se",
    "textures",
    "thumb_fallback.png"
  );

  if (fs.existsSync(fallbackPath)) {
    const fallbackBuffer = fs.readFileSync(fallbackPath);
    return new NextResponse(fallbackBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  }

  return new NextResponse("Image not found", { status: 404 });
}
