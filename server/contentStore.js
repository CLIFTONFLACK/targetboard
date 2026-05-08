import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { activityLog, approvedAngles, ctaTemplates, reviewers, seedPosts } from "../src/data/seedData.js";
import { getNextApprovalState } from "../src/utils/statusHelpers.js";
import { buildManualTitle, buildMockAgentOutput } from "./mockAgent.js";

const defaultFilePath = fileURLToPath(new URL("../.local-data/content-agent-store.json", import.meta.url));

export function createContentStore(options = {}) {
  const filePath = options.filePath || defaultFilePath;
  const now = options.now || (() => new Date());

  async function readState() {
    try {
      const raw = await readFile(filePath, "utf8");
      return JSON.parse(raw);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      const state = createDefaultState();
      await writeState(state);
      return state;
    }
  }

  async function writeState(state) {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(state, null, 2), "utf8");
    return state;
  }

  async function resetState() {
    return writeState(createDefaultState());
  }

  async function updatePost(postId, updater, activityBuilder) {
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

    const activity = activityBuilder?.(updatedPost);
    const nextState = {
      ...state,
      posts,
      activities: activity ? [activity, ...state.activities] : state.activities,
    };
    return writeState(nextState);
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

    return writeState({
      ...state,
      posts: [post, ...state.posts],
      activities: [
        buildActivity({
          action: "Manual blog row created",
          actor: "Operator",
          title,
          now,
        }),
        ...state.activities,
      ],
    });
  }

  async function runAgent(postId) {
    return updatePost(
      postId,
      (post) => buildMockAgentOutput(post),
      (post) =>
        buildActivity({
          action: "Ready for review",
          actor: "Content Agent",
          title: post.title,
          now,
        }),
    );
  }

  async function approvePost(postId, { decision, note = "" }) {
    return updatePost(
      postId,
      (post) => {
        const active = post.approvals.find((approval) => approval.status === "Pending");
        const next = getNextApprovalState(post, decision, note);
        return {
          ...post,
          approvals: next.approvals,
          status: next.status,
          daysInStatus: 0,
          lastActor: active?.role || "Reviewer",
        };
      },
      (post) => {
        const acted = [...post.approvals]
          .filter((approval) => approval.status === decision && approval.timestamp)
          .sort((a, b) => b.stage - a.stage)[0];
        const stage = acted?.stage ?? "";
        return buildActivity({
          action: decision === "Approved" ? `Stage ${stage} approved` : `Stage ${stage} ${decision.toLowerCase()}`,
          actor: acted?.role || post.lastActor || "Reviewer",
          title: post.title,
          now,
        });
      },
    );
  }

  async function updateAsset(postId, { assetId, copy }) {
    return updatePost(
      postId,
      (post) => ({
        ...post,
        assets: post.assets.map((asset) => (asset.id === assetId ? { ...asset, copy } : asset)),
      }),
      (post) =>
        buildActivity({
          action: "Asset edited",
          actor: "Reviewer",
          title: post.title,
          now,
        }),
    );
  }

  async function regenerateAsset(postId, { assetId, editNotes = "" }) {
    return updatePost(
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
      (post) =>
        buildActivity({
          action: "Asset regenerated",
          actor: "Content Agent",
          title: post.title,
          now,
        }),
    );
  }

  async function schedulePost(postId, payload) {
    return updatePost(
      postId,
      (post) => ({
        ...post,
        ...payload,
        status: "Scheduled",
        daysInStatus: 0,
      }),
      (post) =>
        buildActivity({
          action: `Scheduled for ${post.channel}`,
          actor: post.publishMode,
          title: post.title,
          now,
        }),
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

export function createDefaultState() {
  return {
    posts: deepClone(seedPosts),
    reviewers: deepClone(reviewers),
    settings: {
      approvedAngles: deepClone(approvedAngles),
      ctaTemplates: deepClone(ctaTemplates),
      aiProvider: "OpenAI",
      model: "gpt-4o",
      sheets: {
        tabs: ["Content Tracker", "Newsletter", "Scoring Log", "Carousel Log", "Settings", "Activity Log"],
        mode: "local-fallback",
      },
      rssUrl: "https://targetboard.ai/blog/rss.xml",
    },
    activities: deepClone(activityLog),
  };
}

function buildActivity({ action, actor, title, now }) {
  return {
    id: `act-${now().getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: now().toISOString(),
    title,
    action,
    actor,
  };
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}
