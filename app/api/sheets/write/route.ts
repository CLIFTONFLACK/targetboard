// POST /api/sheets/write
// body: { rowNumber: number, fields: Partial<BlogRow>, actor?: string, action?: string }
//
// Updates the cells indicated by `fields` on `rowNumber` in the Content Tracker.
// If `action` is supplied, also writes an Activity Log entry.

import { NextResponse } from "next/server";
import { z } from "zod";
import { updateCells, logActivity, getRow } from "@/lib/sheets/tracker";
import { checkRateLimit, getRequestIp, LIMITS } from "@/lib/ratelimit";

const Body = z.object({
  rowNumber: z.number().int().positive(),
  fields: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
  actor: z.string().optional(),
  action: z.string().optional(),
});

export async function POST(req: Request) {
  const rl = checkRateLimit(
    getRequestIp(req),
    "sheets.write",
    LIMITS.sheetsWrite.limit,
    LIMITS.sheetsWrite.windowMs,
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limited", resetAt: rl.resetAt },
      { status: 429 },
    );
  }

  try {
    const body = Body.parse(await req.json());
    await updateCells(body.rowNumber, body.fields as Record<string, never>);
    if (body.action) {
      const r = await getRow(body.rowNumber);
      await logActivity({
        postTitle: r?.blogTitle ?? `row ${body.rowNumber}`,
        action: body.action,
        actor: body.actor,
        notes: Object.keys(body.fields).join(", "),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[sheets/write]", err);
    const status = err instanceof z.ZodError ? 400 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status },
    );
  }
}
