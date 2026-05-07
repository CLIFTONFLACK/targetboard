import { createContentStore } from "./contentStore.js";
import { createGoogleSheetsStore } from "./googleSheetsStore.js";

export function hasGoogleSheetsConfig(env = process.env) {
  return Boolean(env.GOOGLE_SHEET_ID && env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY);
}

export function createStoreFromEnv({ env = process.env, localOptions = {} } = {}) {
  if (hasGoogleSheetsConfig(env)) {
    const store = createGoogleSheetsStore({ env });
    store.kind = "google-sheets";
    return store;
  }

  const store = createContentStore(localOptions);
  store.kind = "local";
  return store;
}
