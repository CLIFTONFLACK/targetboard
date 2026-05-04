# TargetBoard Content Manager Agent

Human-supervised content operations system for [TargetBoard](https://targetboard.ai).
Converts published blog posts into scored, recommended LinkedIn assets and a monthly newsletter.
Built per `Content_Manager_Agent_Spec_v1.3` §15 (webapp architecture).

**Status**: MVP build in progress. Open beta — no auth in v0.1.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS for styling
- TanStack Query for server state
- Google Sheets v4 (via `googleapis`) as source of truth
- OpenRouter (default) / OpenAI / Anthropic / Gemini for AI inference
- Deployed to Vercel

## Local development

```bash
npm install
cp .env.local.example .env.local
# fill in OPENROUTER_API_KEY, GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY
npm run dev
```

Open http://localhost:3000 → click "Open pipeline →".

Health check: http://localhost:3000/api/health — confirms env vars are wired.

## First-time setup

### 1. Google Cloud project

1. Create project `TargetBoard-ContentAgent` at console.cloud.google.com
2. Enable **Google Sheets API** and **Google Drive API**
3. APIs & Services → Credentials → Create Credentials → Service Account
   - Name: `content-agent-service`
   - Role: Editor
4. Click the service account → Keys → Add Key → Create new key → JSON → download
5. Open the JSON and copy `client_email` and `private_key` into `.env.local`

### 2. Bootstrap the Google Sheet

Once `.env.local` has the service account credentials, run:

```bash
npm run bootstrap-sheet
```

This creates a new spreadsheet `TargetBoard Content Manager Agent` with all 6 tabs
(Content Tracker, Newsletter, Carousel Log, Scoring Log, Settings, Activity Log)
and pre-seeded headers + the six approved content angles. Paste the printed Sheet ID
into `.env.local` as `GOOGLE_SHEET_ID`.

### 3. OpenRouter

Get an API key at https://openrouter.ai/keys. Set a low monthly spend cap. Paste into
`.env.local` as `OPENROUTER_API_KEY`. Default model is `anthropic/claude-sonnet-4.5`.

### 4. Vercel

The repo is already wired to https://vercel.com/cliftonflacks-projects/targetboard.
Set env vars in Vercel project settings (same keys as `.env.local`). Push to `main` triggers
auto-deploy.

## Repo layout

```
app/
  page.tsx                       Landing
  pipeline/page.tsx              Kanban (Phase 4)
  review/[id]/page.tsx           Review surface (Phase 4)
  api/
    health/route.ts              Env wiring check
    agent/{extract,generate,score,regenerate}/route.ts   (Phase 3)
    sheets/{read,write,append}/route.ts                  (Phase 2)
components/                      Shared UI
lib/
  ai/{provider,prompts}.ts       (Phase 3)
  sheets/{client,schema,tracker}.ts                      (Phase 2)
  utils.ts                       cn() helper
scripts/
  bootstrap-sheet.ts             One-shot Sheet creator (Phase 0)
```

## License

Proprietary — TargetBoard internal.
