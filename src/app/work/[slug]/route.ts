import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filePath = path.join(
    process.cwd(),
    `public/sites/shader-se/work/${slug}.html`
  );

  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, "utf-8");
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  const fallbackPath = path.join(
    process.cwd(),
    "public/sites/shader-se/work/ehealth-arena.html"
  );
  if (fs.existsSync(fallbackPath)) {
    const html = fs.readFileSync(fallbackPath, "utf-8");
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  return new NextResponse("Not Found", { status: 404 });
}
