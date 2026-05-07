import { useState } from "react";
import { Copy, Pencil, RefreshCw, Save } from "lucide-react";
import ScoreBar from "./ScoreBar.jsx";

const criteriaLabels = {
  hook: "Hook",
  problem_clarity: "Problem",
  system_insight: "System",
  tb_positioning: "Positioning",
  icp_relevance: "ICP",
  distinctiveness: "Distinctive",
};

export default function AssetCard({ asset, onSave, onRegenerate }) {
  const [editing, setEditing] = useState(false);
  const [copy, setCopy] = useState(asset.copy);
  const [notes, setNotes] = useState("");

  function save() {
    onSave(asset.id, copy);
    setEditing(false);
  }

  async function copyText() {
    await navigator.clipboard?.writeText(asset.copy);
  }

  return (
    <article className="asset-card">
      <div className="asset-header">
        <div>
          <p className="section-label">{asset.type}</p>
          <h3>{asset.recommendation ? "Recommended to publish" : "Secondary asset"}</h3>
        </div>
        <ScoreBar score={asset.score} />
      </div>

      <div className="asset-copy">
        {editing ? (
          <textarea value={copy} onChange={(event) => setCopy(event.target.value)} rows={10} />
        ) : (
          <pre>{asset.copy}</pre>
        )}
      </div>

      <div className="score-grid">
        {Object.entries(asset.breakdown).map(([key, value]) => (
          <div key={key}>
            <span>{criteriaLabels[key]}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <p className="recommendation">{asset.recommendationReason}</p>

      <div className="asset-actions">
        {editing ? (
          <button type="button" className="primary-button" onClick={save}>
            <Save size={16} />
            Save
          </button>
        ) : (
          <button type="button" className="secondary-button" onClick={() => setEditing(true)}>
            <Pencil size={16} />
            Edit
          </button>
        )}
        <button type="button" className="secondary-button" onClick={copyText}>
          <Copy size={16} />
          Copy
        </button>
      </div>

      <div className="regenerate-row">
        <input
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Revision note for this asset"
        />
        <button type="button" className="secondary-button" onClick={() => onRegenerate(asset.id, notes)}>
          <RefreshCw size={16} />
          Regenerate
        </button>
      </div>
    </article>
  );
}
