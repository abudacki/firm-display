import { NextResponse } from "next/server";
import { z } from "zod";
import { updateSetting } from "@/lib/db";

const schema = z.object({
  firmName: z.string().min(1),
  defaultBackgroundImage: z.string().min(1),
  supportMessage: z.string().min(1)
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  updateSetting("firmName", body.firmName);
  updateSetting("defaultBackgroundImage", body.defaultBackgroundImage);
  updateSetting("supportMessage", body.supportMessage);
  return NextResponse.json({ ok: true });
}
