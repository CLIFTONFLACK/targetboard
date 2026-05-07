import { createStoreFromEnv } from "./storeFactory.js";

export function createApiMiddleware(options = {}) {
  const store = options.store || createStoreFromEnv();

  return async function apiMiddleware(req, res, next) {
    if (!req.url?.startsWith("/api/")) {
      next();
      return;
    }

    try {
      const url = new URL(req.url, "http://127.0.0.1");
      const method = req.method || "GET";

      if (method === "GET" && url.pathname === "/api/app-state") {
        return sendJson(res, 200, await store.readState());
      }

      if (method === "POST" && url.pathname === "/api/app-state/reset") {
        return sendJson(res, 200, await store.resetState());
      }

      if (method === "POST" && url.pathname === "/api/posts/manual") {
        const body = await readJson(req);
        return sendJson(res, 200, await store.addManualPost(body.url));
      }

      const postMatch = url.pathname.match(/^\/api\/posts\/([^/]+)(?:\/(.+))?$/);
      if (postMatch && method === "POST") {
        const postId = decodeURIComponent(postMatch[1]);
        const action = postMatch[2] || "";
        const body = await readJson(req);

        if (action === "run-agent") return sendJson(res, 200, await store.runAgent(postId));
        if (action === "approval") return sendJson(res, 200, await store.approvePost(postId, body));
        if (action === "schedule") return sendJson(res, 200, await store.schedulePost(postId, body));

        const assetMatch = action.match(/^assets\/([^/]+)(?:\/(.+))?$/);
        if (assetMatch) {
          const assetId = decodeURIComponent(assetMatch[1]);
          const assetAction = assetMatch[2] || "";
          if (assetAction === "regenerate") {
            return sendJson(res, 200, await store.regenerateAsset(postId, { assetId, ...body }));
          }
          return sendJson(res, 200, await store.updateAsset(postId, { assetId, ...body }));
        }
      }

      if (method === "GET" && url.pathname === "/api/sheets/read") {
        const sheet = url.searchParams.get("sheet");
        return sendJson(res, 200, readSheet(await store.readState(), sheet));
      }

      if (method === "POST" && url.pathname === "/api/sheets/write") {
        const body = await readJson(req);
        return sendJson(res, 200, await writeSheet(store, body));
      }

      if (method === "POST" && url.pathname === "/api/sheets/append") {
        const body = await readJson(req);
        if (body.sheet === "Content Tracker") {
          return sendJson(res, 200, await store.addManualPost(body.values?.url || body.values?.URL || ""));
        }
      }

      return sendJson(res, 404, { error: `Unknown API route: ${method} ${url.pathname}` });
    } catch (error) {
      return sendJson(res, error.status || 500, { error: error.message || "Unexpected API error" });
    }
  };
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

async function writeSheet(store, body) {
  const state = await store.readState();
  if (body.sheet !== "Content Tracker") return state;

  const posts = state.posts.map((post) =>
    post.id === body.rowId
      ? {
          ...post,
          ...body.values,
        }
      : post,
  );

  return store.writeState({ ...state, posts });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}
