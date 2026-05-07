import { createStoreFromEnv } from "../server/storeFactory.js";

const store = createStoreFromEnv({
  localOptions: {
    filePath: process.env.VERCEL ? "/tmp/content-agent-store.json" : undefined,
  },
});

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    const method = req.method || "GET";
    const pathname = url.pathname;

    if (method === "GET" && pathname === "/api/app-state") {
      return sendJson(res, 200, await store.readState());
    }

    if (method === "POST" && pathname === "/api/app-state/reset") {
      return sendJson(res, 200, await store.resetState());
    }

    if (method === "POST" && pathname === "/api/posts/manual") {
      return sendJson(res, 200, await store.addManualPost(req.body?.url));
    }

    const postMatch = pathname.match(/^\/api\/posts\/([^/]+)(?:\/(.+))?$/);
    if (postMatch && method === "POST") {
      const postId = decodeURIComponent(postMatch[1]);
      const action = postMatch[2] || "";

      if (action === "run-agent") return sendJson(res, 200, await store.runAgent(postId));
      if (action === "approval") return sendJson(res, 200, await store.approvePost(postId, req.body || {}));
      if (action === "schedule") return sendJson(res, 200, await store.schedulePost(postId, req.body || {}));

      const assetMatch = action.match(/^assets\/([^/]+)(?:\/(.+))?$/);
      if (assetMatch) {
        const assetId = decodeURIComponent(assetMatch[1]);
        const assetAction = assetMatch[2] || "";
        if (assetAction === "regenerate") {
          return sendJson(res, 200, await store.regenerateAsset(postId, { assetId, ...(req.body || {}) }));
        }
        return sendJson(res, 200, await store.updateAsset(postId, { assetId, ...(req.body || {}) }));
      }
    }

    if (method === "GET" && pathname === "/api/sheets/read") {
      const sheet = url.searchParams.get("sheet");
      return sendJson(res, 200, readSheet(await store.readState(), sheet));
    }

    if (method === "POST" && pathname === "/api/sheets/write") {
      return sendJson(res, 200, await writeSheet(store, req.body || {}));
    }

    if (method === "POST" && pathname === "/api/sheets/append") {
      if (req.body?.sheet === "Content Tracker") {
        return sendJson(res, 200, await store.addManualPost(req.body.values?.url || req.body.values?.URL || ""));
      }
    }

    return sendJson(res, 404, { error: `Unknown API route: ${method} ${pathname}` });
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message || "Unexpected API error" });
  }
}

function readSheet(state, sheet) {
  if (sheet === "Content Tracker") return { sheet, rows: state.posts };
  if (sheet === "Settings") return { sheet, rows: state.settings };
  if (sheet === "Activity Log") return { sheet, rows: state.activities };
  if (sheet === "Newsletter") return { sheet, rows: [] };
  if (sheet === "Scoring Log") {
    return {
      sheet,
      rows: state.posts.flatMap((post) =>
        post.assets.map((asset) => ({
          postId: post.id,
          title: post.title,
          assetId: asset.id,
          type: asset.type,
          score: asset.score,
          breakdown: asset.breakdown,
        })),
      ),
    };
  }
  return { sheet, rows: [] };
}

async function writeSheet(activeStore, body) {
  const state = await activeStore.readState();
  if (body.sheet !== "Content Tracker") return state;

  const posts = state.posts.map((post) =>
    post.id === body.rowId
      ? {
          ...post,
          ...body.values,
        }
      : post,
  );

  return activeStore.writeState({ ...state, posts });
}

function sendJson(res, status, payload) {
  res.status(status).json(payload);
}
