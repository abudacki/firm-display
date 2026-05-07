import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Upload a JPG, PNG, WebP, or SVG image." }, { status: 400 });
  }

  const filename = `${Date.now()}-${safeName(file.name)}`;
  const destination = path.join(process.cwd(), "public", "uploads", filename);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ ok: true, path: `/uploads/${filename}` });
}
