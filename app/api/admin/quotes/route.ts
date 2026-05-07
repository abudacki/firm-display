import { NextResponse } from "next/server";
import { z } from "zod";
import { addQuote } from "@/lib/db";

const schema = z.object({
  text: z.string().min(1),
  attribution: z.string().optional(),
  backgroundImage: z.string().optional()
});

export async function POST(request: Request) {
  addQuote(schema.parse(await request.json()));
  return NextResponse.json({ ok: true });
}
