import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "targetboard-content-agent",
    env: {
      ai_provider: process.env.AI_PROVIDER ?? "unset",
      sheet_configured: Boolean(process.env.GOOGLE_SHEET_ID),
      provider_key_present: Boolean(
        process.env.OPENROUTER_API_KEY ||
          process.env.OPENAI_API_KEY ||
          process.env.ANTHROPIC_API_KEY ||
          process.env.GEMINI_API_KEY
      ),
    },
    ts: new Date().toISOString(),
  });
}
