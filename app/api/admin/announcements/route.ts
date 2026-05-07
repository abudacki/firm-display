import { NextResponse } from "next/server";
import { z } from "zod";
import { addAnnouncement } from "@/lib/db";

const schema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  office: z.string().optional(),
  urgent: z.boolean().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional()
});

export async function POST(request: Request) {
  addAnnouncement(schema.parse(await request.json()));
  return NextResponse.json({ ok: true });
}
