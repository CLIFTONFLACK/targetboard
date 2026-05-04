// CRUD helpers over the Google Sheet. All Sheets reads/writes go through here —
// route handlers should never call googleapis directly.
//
// Row addressing: row 1 is headers, data starts at row 2. We expose `rowNumber`
// (the actual sheet row index) on every BlogRow so callers can update specific cells
// without re-reading the whole tab.

import { getSheetsClient, getSpreadsheetId } from "./client";
import {
  TABS,
  CONTENT_TRACKER_LAST_COL,
  CONTENT_TRACKER_COLUMNS,
  FIELD_TO_COL,
  rowArrayToBlogRow,
  blogRowToRowArray,
} from "./schema";
import type { BlogRow } from "@/types";

// ---- Content Tracker ----

export async function listRows(): Promise<BlogRow[]> {
  const sheets = getSheetsClient();
  const range = `${TABS.contentTracker}!A2:${CONTENT_TRACKER_LAST_COL}`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range,
  });
  const values = (res.data.values ?? []) as string[][];
  return values
    .map((row, i) => rowArrayToBlogRow(row, i + 2))
    .filter((r) => r.blogTitle || r.blogUrl); // drop fully-empty trailing rows
}

export async function getRow(rowNumber: number): Promise<BlogRow | null> {
  const sheets = getSheetsClient();
  const range = `${TABS.contentTracker}!A${rowNumber}:${CONTENT_TRACKER_LAST_COL}${rowNumber}`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range,
  });
  const row = res.data.values?.[0] as string[] | undefined;
  if (!row) return null;
  return rowArrayToBlogRow(row, rowNumber);
}

export async function appendRow(partial: Partial<BlogRow>): Promise<BlogRow> {
  const sheets = getSheetsClient();
  const values = blogRowToRowArray(partial);
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${TABS.contentTracker}!A:${CONTENT_TRACKER_LAST_COL}`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
  // Parse the appended range to extract the row number, e.g. "Content Tracker!A5:AH5"
  const updated = res.data.updates?.updatedRange ?? "";
  const m = updated.match(/!\D+(\d+):/);
  const rowNumber = m ? Number(m[1]) : -1;
  return rowArrayToBlogRow(values, rowNumber);
}

// Update a subset of cells on a specific row.
// Uses a batch update so multiple field changes are one Sheets API call.
export async function updateCells(
  rowNumber: number,
  partial: Partial<BlogRow>,
): Promise<void> {
  const data: { range: string; values: string[][] }[] = [];
  for (const [field, value] of Object.entries(partial)) {
    if (field === "rowNumber") continue;
    const col = FIELD_TO_COL[field as keyof BlogRow];
    if (!col) continue;
    data.push({
      range: `${TABS.contentTracker}!${col}${rowNumber}`,
      values: [[value === undefined || value === null ? "" : String(value)]],
    });
  }
  if (data.length === 0) return;
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: { valueInputOption: "USER_ENTERED", data },
  });
}

// Find a row by Blog URL (used for dedup on manual submission).
export async function findRowByUrl(blogUrl: string): Promise<BlogRow | null> {
  const rows = await listRows();
  return rows.find((r) => r.blogUrl === blogUrl) ?? null;
}

// ---- Activity Log ----

export async function logActivity(args: {
  postTitle: string;
  action: string;
  actor?: string;
  notes?: string;
}): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${TABS.activityLog}!A:E`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          new Date().toISOString(),
          args.postTitle,
          args.action,
          args.actor ?? "mvp-tester",
          args.notes ?? "",
        ],
      ],
    },
  });
}

// ---- Generic tab read (used by Settings UI in v1) ----

export async function readTab(tabName: string, range = "A:Z"): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${tabName}!${range}`,
  });
  return (res.data.values ?? []) as string[][];
}

// ---- Generic tab append (used for Scoring Log, Newsletter) ----

export async function appendToTab(tabName: string, row: string[]): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${tabName}!A:Z`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

// ---- Health check: verify Sheet has the right tabs and column headers ----

export async function verifySchema(): Promise<{ ok: boolean; problems: string[] }> {
  const problems: string[] = [];
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: getSpreadsheetId() });
  const tabs = (meta.data.sheets ?? []).map((s) => s.properties?.title);
  for (const required of Object.values(TABS)) {
    if (!tabs.includes(required)) problems.push(`Missing tab: ${required}`);
  }
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${TABS.contentTracker}!A1:${CONTENT_TRACKER_LAST_COL}1`,
  });
  const headers = (headerRes.data.values?.[0] ?? []) as string[];
  for (let i = 0; i < CONTENT_TRACKER_COLUMNS.length; i++) {
    const expected = CONTENT_TRACKER_COLUMNS[i]!.header;
    if (headers[i] !== expected) {
      problems.push(`Column ${CONTENT_TRACKER_COLUMNS[i]!.col} header is "${headers[i] ?? ""}" — expected "${expected}"`);
    }
  }
  return { ok: problems.length === 0, problems };
}
