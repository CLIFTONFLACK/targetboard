import { createSign } from "node:crypto";
import { reviewers as seedReviewers } from "../src/data/seedData.js";
import { getNextApprovalState } from "../src/utils/statusHelpers.js";
import { buildManualTitle, buildMockAgentOutput } from "./mockAgent.js";
import { ACTIVITY_HEADERS, SETTINGS_HEADERS, rowsToActivities, rowsToPosts, rowsToSettings, stateToSheets } from "./sheetsSchema.js";

export function createGoogleSheetsStore({ env = process.env, client, now = () => new Date() } = {}) {
  const sheetsClient = client || createGoogleSheetsClient(env);

  async function readState() {
    const [contentRows, settingsRows, activityRows] = await Promise.all([
      sheetsClient.read("Content Tracker"),
      sheetsClient.read("Settings"),
      sheetsClient.read("Activity Log"),
    ]);
    const settings = rowsToSettings(settingsRows);
    return {
      posts: rowsToPosts(contentRows),
      reviewers: settings.reviewers?.length ? settings.reviewers : seedReviewers,
      settings: withoutReviewers(settings),
      activities: rowsToActivities(activityRows),
    };
  }

  async function writeState(state) {
    const sheets = stateToSheets(state);
    await Promise.all(Object.entries(sheets).map(([sheetName, values]) => sheetsClient.replace(sheetName, values)));
    return state;
  }

  async function resetState() {
    const { createDefaultState } = await import("./contentStore.js");
    return writeState(createDefaultState());
  }

  async function addManualPost(url) {
    const state = await readState();
    const id = `manual-${now().getTime()}`;
    const title = buildManualTitle(url) || "Manual blog submission";
    const post = {
      id,
      title,
      url,
      publishDate: now().toISOString().slice(0, 10),
      category: "Manual",
      targetKeyword: "Pending extraction",
      audienceTag: "VP Engineering",
      status: "New",
      daysInStatus: 0,
      selectedAngle: "",
      suggestedAngles: [],
      execSummary: "Queued for content extraction.",
      takeaways: [],
      snippets: [],
      newsletterBlurb: "",
      cta: "",
      internalLinks: [],
      assets: [],
      approvals: state.reviewers.map((reviewer, index) => ({
        stage: index + 1,
        role: reviewer.role,
        reviewer: reviewer.name,
        status: "Locked",
        timestamp: "",
        note: "",
      })),
      publishMode: "Manual",
      scheduledDate: "",
      channel: "LinkedIn",
    };
    return writeState(withActivity({ ...state, posts: [post, ...state.posts] }, "Manual blog row created", "Operator", title, now));
  }

  async function runAgent(postId) {
    return updatePost(readState, writeState, postId, buildMockAgentOutput, (post, state) =>
      withActivity(state, "Ready for review", "Content Agent", post.title, now),
    );
  }

  async function approvePost(postId, { decision, note = "" }) {
    return updatePost(
      readState,
      writeState,
      postId,
      (post) => {
        const active = post.approvals.find((approval) => approval.status === "Pending");
        const next = getNextApprovalState(post, decision, note);
        return { ...post, approvals: next.approvals, status: next.status, daysInStatus: 0, lastActor: active?.role || "Reviewer" };
      },
      (post, state) => {
        const acted = post.approvals.find((approval) => approval.timestamp?.startsWith(now().toISOString().slice(0, 10)));
        return withActivity(
          state,
          decision === "Approved" ? `Stage ${acted?.stage || ""} approved` : `Stage ${acted?.stage || ""} ${decision.toLowerCase()}`,
          acted?.role || post.lastActor || "Reviewer",
          post.title,
          now,
        );
      },
    );
  }

  async function updateAsset(postId, { assetId, copy }) {
    return updatePost(
      readState,
      writeState,
      postId,
      (post) => ({ ...post, assets: post.assets.map((asset) => (asset.id === assetId ? { ...asset, copy } : asset)) }),
      (post, state) => withActivity(state, "Asset edited", "Reviewer", post.title, now),
    );
  }

  async function regenerateAsset(postId, { assetId, editNotes = "" }) {
    return updatePost(
      readState,
      writeState,
      postId,
      (post) => ({
        ...post,
        assets: post.assets.map((asset) =>
          asset.id === assetId
            ? {
                ...asset,
                score: Math.min(asset.score + 3, 95),
                recommendation: asset.score + 3 >= 80,
                recommendationReason: editNotes || "Regenerated with tighter operator-to-operator framing.",
                copy: `${asset.copy}\n\nRevision note: ${editNotes || "Tightened the hook and clarified the system-level insight."}`,
              }
            : asset,
        ),
      }),
      (post, state) => withActivity(state, "Asset regenerated", "Content Agent", post.title, now),
    );
  }

  async function schedulePost(postId, payload) {
    return updatePost(
      readState,
      writeState,
      postId,
      (post) => ({ ...post, ...payload, status: "Scheduled", daysInStatus: 0 }),
      (post, state) => withActivity(state, `Scheduled for ${post.channel}`, post.publishMode, post.title, now),
    );
  }

  return {
    addManualPost,
    approvePost,
    readState,
    regenerateAsset,
    resetState,
    runAgent,
    schedulePost,
    updateAsset,
    writeState,
  };
}

export function createGoogleSheetsClient(env = process.env) {
  const sheetId = env.GOOGLE_SHEET_ID;
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = normalizePrivateKey(env.GOOGLE_PRIVATE_KEY);
  let tokenCache = null;

  async function request(path, options = {}) {
    const token = await getAccessToken({ email, privateKey, tokenCache, setTokenCache: (token) => { tokenCache = token; } });
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    if (!response.ok) throw new Error(`Google Sheets API ${response.status}: ${await response.text()}`);
    return response.json();
  }

  return {
    async read(sheetName) {
      const data = await request(`/values/${encodeURIComponent(sheetName)}`);
      return data.values || headerForSheet(sheetName);
    },
    async replace(sheetName, values) {
      await request(`/values/${encodeURIComponent(sheetName)}:clear`, { method: "POST", body: "{}" });
      return request(`/values/${encodeURIComponent(sheetName)}!A1:append?valueInputOption=RAW`, {
        method: "POST",
        body: JSON.stringify({ values }),
      });
    },
  };
}

async function updatePost(readState, writeState, postId, updater, afterUpdate) {
  const state = await readState();
  let updatedPost = null;
  const posts = state.posts.map((post) => {
    if (post.id !== postId) return post;
    updatedPost = updater(post);
    return updatedPost;
  });
  if (!updatedPost) {
    const error = new Error(`Post not found: ${postId}`);
    error.status = 404;
    throw error;
  }
  const nextState = afterUpdate(updatedPost, { ...state, posts });
  return writeState(nextState);
}

function withoutReviewers(settings) {
  const { reviewers, ...rest } = settings;
  return rest;
}

function withActivity(state, action, actor, title, now) {
  return {
    ...state,
    activities: [
      {
        id: `act-${now().getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: now().toISOString(),
        title,
        action,
        actor,
      },
      ...state.activities,
    ],
  };
}

function headerForSheet(sheetName) {
  if (sheetName === "Settings") return [SETTINGS_HEADERS];
  if (sheetName === "Activity Log") return [ACTIVITY_HEADERS];
  return [[]];
}

function normalizePrivateKey(value = "") {
  return value.replace(/\\n/g, "\n");
}

async function getAccessToken({ email, privateKey, tokenCache, setTokenCache }) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.expiresAt - 60 > nowSeconds) return tokenCache.accessToken;

  const assertion = signJwt(
    {
      alg: "RS256",
      typ: "JWT",
    },
    {
      iss: email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: nowSeconds,
      exp: nowSeconds + 3600,
    },
    privateKey,
  );

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error(`Google OAuth ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  const nextToken = {
    accessToken: payload.access_token,
    expiresAt: nowSeconds + Number(payload.expires_in || 3600),
  };
  setTokenCache(nextToken);
  return nextToken.accessToken;
}

function signJwt(header, payload, privateKey) {
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(privateKey);
  return `${signingInput}.${base64Url(signature)}`;
}

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
