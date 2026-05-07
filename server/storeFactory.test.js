import { describe, expect, it } from "vitest";
import { createStoreFromEnv, hasGoogleSheetsConfig } from "./storeFactory.js";

describe("store factory", () => {
  it("uses local file storage when Google Sheets env vars are missing", () => {
    const store = createStoreFromEnv({
      env: {},
      localOptions: { filePath: "ignored.json" },
    });

    expect(store.kind).toBe("local");
  });

  it("detects complete Google Sheets service account config", () => {
    expect(
      hasGoogleSheetsConfig({
        GOOGLE_SHEET_ID: "sheet-id",
        GOOGLE_SERVICE_ACCOUNT_EMAIL: "svc@example.iam.gserviceaccount.com",
        GOOGLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n",
      }),
    ).toBe(true);
  });

  it("uses Google Sheets storage when all required env vars are present", () => {
    const store = createStoreFromEnv({
      env: {
        GOOGLE_SHEET_ID: "sheet-id",
        GOOGLE_SERVICE_ACCOUNT_EMAIL: "svc@example.iam.gserviceaccount.com",
        GOOGLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n",
      },
    });

    expect(store.kind).toBe("google-sheets");
  });
});
