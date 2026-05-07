import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertProfile } from "@/lib/db";

const schema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mode: z.enum(["morning", "attorneys", "room", "announcements"]),
  calendarIds: z.array(z.string()),
  officeIds: z.array(z.string()),
  rotationSeconds: z.number().int().min(10),
  privacySafe: z.number().int().min(0).max(1),
  roomMailbox: z.string().nullable()
});

export async function POST(request: Request) {
  upsertProfile(schema.parse(await request.json()));
  return NextResponse.json({ ok: true });
}
