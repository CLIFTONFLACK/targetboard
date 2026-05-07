# TargetBoard Content Manager Agent

React/Vite prototype for the TargetBoard content operations app. The UI reads and writes through local `/api/*` endpoints. By default those endpoints use a local JSON file in `.local-data/`; when Google Sheets credentials are configured, the same API switches to Google Sheets.

## Run Locally

```bash
npm install
npm run dev -- --port 5174
```

Open `http://127.0.0.1:5174/dashboard`.

## Verification

```bash
npm test
npm run build
```

## Data Modes

### Local fallback

If Google Sheets env vars are missing, the API persists to:

```text
.local-data/content-agent-store.json
```

Use **Reset demo** in the app to restore seeded data.

### Google Sheets

Set these variables in `.env.local` or the hosting environment:

```bash
GOOGLE_SHEET_ID="..."
GOOGLE_SERVICE_ACCOUNT_EMAIL="content-agent-service@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

The Google Sheet must be shared with the service account email as **Editor**.

Required tab names:

- `Content Tracker`
- `Newsletter`
- `Scoring Log`
- `Carousel Log`
- `Settings`
- `Activity Log`

The current adapter writes nested app fields, such as assets, approvals, angles, links, snippets, and takeaways, as JSON strings inside the tracker columns. That keeps the app state lossless while preserving a Sheets-readable control center.

## Vercel Deployment

This Vite app includes a production catch-all serverless API route at `api/[...path].js`. In local Vite dev, `vite.config.js` serves the same API contract through middleware. In Vercel production, the serverless route handles those same `/api/*` calls.

Production should be connected to:

- GitHub repo: `https://github.com/CLIFTONFLACK/targetboard`
- Vercel production project: `https://vercel.com/cliftonflacks-projects/targetboard`

For persistent production data, configure the Google Sheets environment variables before promoting the deployment. Without them, Vercel falls back to `/tmp/content-agent-store.json`, which is useful for smoke testing but not durable across serverless instances.

## API Shape

- `GET /api/app-state`
- `POST /api/app-state/reset`
- `POST /api/posts/manual`
- `POST /api/posts/:id/run-agent`
- `POST /api/posts/:id/approval`
- `POST /api/posts/:id/assets/:assetId`
- `POST /api/posts/:id/assets/:assetId/regenerate`
- `POST /api/posts/:id/schedule`
- `GET /api/sheets/read?sheet=Content%20Tracker`
- `POST /api/sheets/write`
- `POST /api/sheets/append`
