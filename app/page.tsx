import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">TargetBoard Content Manager</h1>
        <p className="text-tb-muted max-w-2xl">
          Human-supervised content operations. Submit a blog URL, the agent extracts a brief,
          generates LinkedIn assets, scores them, and flags the best for review.
        </p>
      </header>

      <nav className="flex gap-3">
        <Link
          href="/pipeline"
          className="rounded-md bg-tb-accent px-4 py-2 text-white text-sm font-medium hover:opacity-90"
        >
          Open pipeline →
        </Link>
      </nav>

      <section className="rounded-lg border border-tb-border bg-tb-surface p-4 text-sm text-tb-muted">
        <p className="font-medium text-tb-ink mb-1">MVP — open beta</p>
        <p>
          No login required. Submit a blog URL on the pipeline page to test the agent.
          Results write to a shared Google Sheet. Don't paste anything sensitive.
        </p>
      </section>
    </div>
  );
}
