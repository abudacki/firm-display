import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
}

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const cleanName = safeName(filename);
  if (!cleanName || cleanName !== filename) {
    return NextResponse.json({ error: "Invalid upload path." }, { status: 400 });
  }

  const extension = path.extname(cleanName);
  const contentType = contentTypes[extension];
  if (!contentType) {
    return NextResponse.json({ error: "Unsupported upload type." }, { status: 404 });
  }

  try {
    const file = await fs.readFile(path.join(process.cwd(), "public", "uploads", cleanName));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType
      }
    });
  } catch {
    return NextResponse.json({ error: "Upload not found." }, { status: 404 });
  }
}
