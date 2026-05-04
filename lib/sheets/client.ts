// googleapis client with service-account auth (per spec §15.10).
// Reuses a single auth instance across requests — service-account tokens
// are cached internally by the JWT client.

import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

let _sheets: sheets_v4.Sheets | null = null;

function getCredentials() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY must be set in env",
    );
  }
  // Vercel env vars store the private key with literal \n — normalise to real newlines.
  const privateKey = rawKey.replace(/\\n/g, "\n");
  return { client_email: email, private_key: privateKey };
}

function getAuth() {
  return new google.auth.JWT({
    email: getCredentials().client_email,
    key: getCredentials().private_key,
    scopes: SCOPES,
  });
}

export function getSheetsClient(): sheets_v4.Sheets {
  if (_sheets) return _sheets;
  _sheets = google.sheets({ version: "v4", auth: getAuth() });
  return _sheets;
}

export function getDriveClient() {
  return google.drive({ version: "v3", auth: getAuth() });
}

export function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID must be set in env");
  return id;
}
