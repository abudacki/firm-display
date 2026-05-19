import { NextResponse } from "next/server";
import { z } from "zod";
import { updateSetting } from "@/lib/db";

const schema = z.object({
  firmName: z.string().min(1),
  defaultBackgroundImage: z.string().min(1),
  morningBackgroundImage: z.string().optional(),
  attorneysBackgroundImage: z.string().optional(),
  roomsBackgroundImage: z.string().optional(),
  announcementsBackgroundImage: z.string().optional(),
  logoImage: z.string().optional(),
  supportMessage: z.string().min(1)
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  updateSetting("firmName", body.firmName);
  updateSetting("defaultBackgroundImage", body.defaultBackgroundImage);
  updateSetting("morningBackgroundImage", body.morningBackgroundImage ?? "");
  updateSetting("attorneysBackgroundImage", body.attorneysBackgroundImage ?? "");
  updateSetting("roomsBackgroundImage", body.roomsBackgroundImage ?? "");
  updateSetting("announcementsBackgroundImage", body.announcementsBackgroundImage ?? "");
  updateSetting("logoImage", body.logoImage ?? "");
  updateSetting("supportMessage", body.supportMessage);
  return NextResponse.json({ ok: true });
}
