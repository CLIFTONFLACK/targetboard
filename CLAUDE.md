# SCF-TargetBoard — Project Memory

## Purpose

The TargetBoard **Content Manager Agent** webapp. A human-supervised content ops system
that converts published TargetBoard blog posts into scored, recommended LinkedIn assets
and monthly newsletter drafts. Three-stage approval workflow (VP Brand → VP Product → CEO).

The full build is specified in `Content_Manager_Agent_Spec_v1.3.docx` (lives on Clifton's
desktop; extracted text is at `~/.claude/plans/_tb_spec_extracted.txt`). The build plan is
at `~/.claude/plans/c-users-clift-desktop-content-manager-a-cryptic-rainbow.md`.

## Hard architectural constraints

1. **Google Sheets is the source of truth.** Every write the webapp does must land in the
   Sheet. The webapp is a UI; the Sheet is the database.
2. **No autonomous publishing.** The agent generates and scores; humans approve and publish.
   This is a non-negotiable per the spec's core principle.
3. **Knowledge base in §14 of the spec is non-negotiable.** Every prompt sent to the AI
   provider must embed §14 (what TB is/isn't, ICP, six approved angles, ten guardrails).
   Content that drifts from this gets regenerated, not surfaced.
4. **AI provider is switchable via `AI_PROVIDER` env var.** The provider abstraction lives
   at `lib/ai/provider.ts`. Default is OpenRouter.
5. **MVP has no auth.** Open beta. Auth.js gets layered in for v1, not now.
6. **Sheet column schema is frozen** per spec §6.2. Don't rename columns. `lib/sheets/schema.ts`
   is the canonical column→key mapping.

## Phase status

- [x] Phase 0: Sheet bootstrap script (deferred to Phase 2 alongside googleapis client)
- [x] Phase 1: Scaffold (this commit)
- [ ] Phase 2: Sheets plumbing + rate limiting
- [ ] Phase 3: Agent modules (extract, generate, score, regenerate)
- [ ] Phase 4: Pipeline + Review pages
- [ ] Phase 5: Dashboard, Calendar, Settings, Notifications (post-MVP)
- [ ] Phase 6: Deploy + verify

## Repo + deploy

- GitHub: https://github.com/CLIFTONFLACK/targetboard
- Vercel: https://vercel.com/cliftonflacks-projects/targetboard
- `main` auto-deploys.

## Conventions

- Path alias: `@/*` → repo root (set in `tsconfig.json`)
- All `/api/agent/*` routes return strict JSON, validated with `zod` against schemas in
  spec §15.12.
- All Sheets writes go through `lib/sheets/tracker.ts` helpers. Never hit `googleapis`
  directly from a route handler.
- Rate limit every agent endpoint (5 extracts/hr, 10 generations/hr per IP). MVP uses
  in-memory; swap to Upstash for v1.

## Known limitations (MVP)

- Last-write-wins on concurrent Sheet edits (no optimistic locking)
- No auth — anyone with the URL can use the agent (rate-limited + spend-capped)
- Activity Log attributes all writes to actor `mvp-tester`
- No RSS auto-detection — manual URL submission only
