// One-shot script to create the TargetBoard Content Manager Agent Google Sheet
// with all 6 tabs and the column headers defined in spec v1.3 §6.2.
//
// Usage:
//   1. Fill GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY in .env.local
//   2. Optionally set SHEET_OWNER_EMAIL to share the new Sheet with your Google account
//   3. npm run bootstrap-sheet
//   4. Copy the printed Sheet ID into .env.local as GOOGLE_SHEET_ID

import "dotenv/config";
import { google } from "googleapis";
import {
  TABS,
  CONTENT_TRACKER_HEADERS,
  NEWSLETTER_HEADERS,
  CAROUSEL_LOG_HEADERS,
  SCORING_LOG_HEADERS,
  SETTINGS_HEADERS,
  SETTINGS_SEED_ROWS,
  ACTIVITY_LOG_HEADERS,
} from "../lib/sheets/schema";

async function main() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    console.error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in .env.local",
    );
    process.exit(1);
  }
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });

  console.log("Creating spreadsheet …");
  const created = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: "TargetBoard Content Manager Agent" },
      sheets: [
        { properties: { title: TABS.contentTracker, gridProperties: { frozenRowCount: 1, frozenColumnCount: 4 } } },
        { properties: { title: TABS.newsletter, gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: TABS.carouselLog, gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: TABS.scoringLog, gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: TABS.settings, gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: TABS.activityLog, gridProperties: { frozenRowCount: 1 } } },
      ],
    },
  });
  const spreadsheetId = created.data.spreadsheetId!;
  const spreadsheetUrl = created.data.spreadsheetUrl!;
  console.log("Created:", spreadsheetUrl);

  // Helper for writing header rows + seed data
  const writes: Array<{ range: string; values: string[][] }> = [
    { range: `${TABS.contentTracker}!A1`, values: [CONTENT_TRACKER_HEADERS] },
    { range: `${TABS.newsletter}!A1`, values: [NEWSLETTER_HEADERS] },
    { range: `${TABS.carouselLog}!A1`, values: [CAROUSEL_LOG_HEADERS] },
    { range: `${TABS.scoringLog}!A1`, values: [SCORING_LOG_HEADERS] },
    { range: `${TABS.settings}!A1`, values: [SETTINGS_HEADERS, ...SETTINGS_SEED_ROWS] },
    { range: `${TABS.activityLog}!A1`, values: [ACTIVITY_LOG_HEADERS] },
  ];

  console.log("Writing headers + seed rows …");
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "USER_ENTERED", data: writes },
  });

  // Bold the header rows
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const formatRequests = (meta.data.sheets ?? []).map((s) => ({
    repeatCell: {
      range: { sheetId: s.properties!.sheetId!, startRowIndex: 0, endRowIndex: 1 },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true },
          backgroundColor: { red: 0.94, green: 0.94, blue: 0.96 },
        },
      },
      fields: "userEnteredFormat(textFormat,backgroundColor)",
    },
  }));
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests: formatRequests } });

  // Optionally share with the human owner so they can open it
  const ownerEmail = process.env.SHEET_OWNER_EMAIL;
  if (ownerEmail) {
    console.log(`Sharing with ${ownerEmail} as Editor …`);
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: { type: "user", role: "writer", emailAddress: ownerEmail },
      sendNotificationEmail: false,
    });
  }

  console.log("\n✓ Done.\n");
  console.log("  Sheet ID:", spreadsheetId);
  console.log("  URL:     ", spreadsheetUrl);
  console.log("\nPaste the Sheet ID into .env.local as GOOGLE_SHEET_ID, then commit (NOT the .env.local file) and you're ready for Phase 3.\n");
}

main().catch((err) => {
  console.error("Bootstrap failed:", err?.message ?? err);
  if (err?.errors) console.error(JSON.stringify(err.errors, null, 2));
  process.exit(1);
});
