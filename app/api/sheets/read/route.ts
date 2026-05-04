// GET /api/sheets/read?tab=Content%20Tracker  → list all rows as BlogRow[]
// GET /api/sheets/read?tab=Content%20Tracker&row=5  → single row
// GET /api/sheets/read?tab=<other>&range=A:Z  → raw 2D array for any other tab

import { NextResponse } from "next/server";
import { listRows, getRow, readTab, verifySchema } from "@/lib/sheets/tracker";
import { TABS } from "@/lib/sheets/schema";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tab = url.searchParams.get("tab") ?? TABS.contentTracker;
    const row = url.searchParams.get("row");
    const verify = url.searchParams.get("verify");

    if (verify === "1") {
      const result = await verifySchema();
      return NextResponse.json(result);
    }

    if (tab === TABS.contentTracker) {
      if (row) {
        const r = await getRow(Number(row));
        return NextResponse.json({ row: r });
      }
      const rows = await listRows();
      return NextResponse.json({ rows });
    }

    const range = url.searchParams.get("range") ?? "A:Z";
    const values = await readTab(tab, range);
    return NextResponse.json({ values });
  } catch (err) {
    console.error("[sheets/read]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
