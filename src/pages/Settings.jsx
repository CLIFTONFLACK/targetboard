import { CheckCircle2, KeyRound, Rss, Sheet } from "lucide-react";

export default function Settings({ reviewers, angles, ctas, settings }) {
  return (
    <div className="settings-grid">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">AI provider</p>
            <h2>OpenAI</h2>
          </div>
          <KeyRound size={20} />
        </div>
        <div className="settings-row">
          <span>Provider</span>
          <strong>{settings?.aiProvider || "Configured by Vercel env"}</strong>
        </div>
        <div className="settings-row">
          <span>Model</span>
          <strong>{settings?.model || "gpt-4o"}</strong>
        </div>
        <div className="settings-row success">
          <span>Key status</span>
          <strong>Ready for serverless route</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">Google Sheets</p>
            <h2>Control center</h2>
          </div>
          <Sheet size={20} />
        </div>
        {(settings?.sheets?.tabs || ["Content Tracker", "Newsletter", "Scoring Log", "Carousel Log", "Settings", "Activity Log"]).map((tab) => (
          <div className="settings-row" key={tab}>
            <span>{tab}</span>
            <CheckCircle2 size={17} />
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">Reviewer roles</p>
            <h2>Approval owners</h2>
          </div>
        </div>
        <div className="reviewer-table">
          {reviewers.map((reviewer, index) => (
            <div key={reviewer.email}>
              <strong>Stage {index + 1}</strong>
              <span>{reviewer.role}</span>
              <span>{reviewer.email}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">Approved angles</p>
            <h2>Agent constraints</h2>
          </div>
        </div>
        <div className="tag-list">
          {angles.map((angle) => (
            <span key={angle}>{angle}</span>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">CTA library</p>
            <h2>Approved CTAs</h2>
          </div>
        </div>
        <div className="tag-list">
          {ctas.map((cta) => (
            <span key={cta}>{cta}</span>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">RSS feed</p>
            <h2>Blog detection</h2>
          </div>
          <Rss size={20} />
        </div>
        <div className="settings-row">
          <span>Feed URL</span>
          <strong>https://targetboard.ai/blog/rss.xml</strong>
        </div>
        <div className="settings-row">
          <span>Polling</span>
          <strong>15 minutes</strong>
        </div>
      </section>
    </div>
  );
}
