// POST /api/sheets/append
// body: { fields: Partial<BlogRow> }  → append a new row to Content Tracker
//
// Used for manual blog URL submission from the Pipeline page.
// Dedups against existing rows by Blog URL.

import { NextResponse } from "next/server";
import { z } from "zod";
import { appendRow, findRowByUrl, logActivity } from "@/lib/sheets/tracker";
import { checkRateLimit, getRequestIp, LIMITS } from "@/lib/ratelimit";

const Body = z.object({
  fields: z.object({
    blogTitle: z.string().min(1).optional(),
    blogUrl: z.string().url(),
    publishDate: z.string().optional(),
    status: z.string().optional(),
  }).passthrough(),
  actor: z.string().optional(),
});

export async function POST(req: Request) {
  const rl = checkRateLimit(
    getRequestIp(req),
    "sheets.append",
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
    const existing = await findRowByUrl(body.fields.blogUrl);
    if (existing) {
      return NextResponse.json({ row: existing, deduped: true });
    }
    const created = await appendRow({
      ...body.fields,
      status: (body.fields.status as never) ?? "New",
      publishDate: body.fields.publishDate ?? new Date().toISOString().slice(0, 10),
    });
    await logActivity({
      postTitle: created.blogTitle || created.blogUrl,
      action: "Row created",
      actor: body.actor,
    });
    return NextResponse.json({ row: created, deduped: false });
  } catch (err) {
    console.error("[sheets/append]", err);
    const status = err instanceof z.ZodError ? 400 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status },
    );
  }
}
