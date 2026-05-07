import { activityLog, approvedAngles, ctaTemplates, reviewers, seedPosts } from "../data/seedData.js";

export async function readAppState() {
  return request("/api/app-state", {
    fallback: createFallbackState(),
  });
}

export async function resetAppState() {
  return request("/api/app-state/reset", {
    method: "POST",
    fallback: createFallbackState(),
  });
}

export async function addManualPost(url) {
  return request("/api/posts/manual", {
    method: "POST",
    body: { url },
    fallback: createFallbackState(),
  });
}

export async function runAgent(postId) {
  return request(`/api/posts/${encodeURIComponent(postId)}/run-agent`, {
    method: "POST",
  });
}

export async function updateApproval(postId, payload) {
  return request(`/api/posts/${encodeURIComponent(postId)}/approval`, {
    method: "POST",
    body: payload,
  });
}

export async function updateAsset(postId, assetId, payload) {
  return request(`/api/posts/${encodeURIComponent(postId)}/assets/${encodeURIComponent(assetId)}`, {
    method: "POST",
    body: payload,
  });
}

export async function regenerateAsset(postId, assetId, payload) {
  return request(`/api/posts/${encodeURIComponent(postId)}/assets/${encodeURIComponent(assetId)}/regenerate`, {
    method: "POST",
    body: payload,
  });
}

export async function schedulePost(postId, payload) {
  return request(`/api/posts/${encodeURIComponent(postId)}/schedule`, {
    method: "POST",
    body: payload,
  });
}

async function request(path, options = {}) {
  try {
    const response = await fetch(path, {
      method: options.method || "GET",
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || `Request failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (options.fallback) return options.fallback;
    throw error;
  }
}

function createFallbackState() {
  return {
    posts: JSON.parse(JSON.stringify(seedPosts)),
    reviewers: JSON.parse(JSON.stringify(reviewers)),
    settings: {
      approvedAngles: JSON.parse(JSON.stringify(approvedAngles)),
      ctaTemplates: JSON.parse(JSON.stringify(ctaTemplates)),
      aiProvider: "OpenAI",
      model: "gpt-4o",
      sheets: {
        tabs: ["Content Tracker", "Newsletter", "Scoring Log", "Carousel Log", "Settings", "Activity Log"],
        mode: "static-fallback",
      },
      rssUrl: "https://targetboard.ai/blog/rss.xml",
    },
    activities: JSON.parse(JSON.stringify(activityLog)),
  };
}
