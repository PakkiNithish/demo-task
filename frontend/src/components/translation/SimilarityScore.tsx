interface SimilarityScoreProps {
  score: number;
}

function getAlignmentMeta(score: number): {
  label: string;
  color: string;
  tip: string;
} {
  if (score >= 0.7) {
    return {
      label: "High Semantic Alignment",
      color: "var(--success)",
      tip: "The translation closely preserves the meaning of the source text.",
    };
  }
  if (score >= 0.4) {
    return {
      label: "Moderate Semantic Alignment",
      color: "var(--primary)",
      tip: "The translation captures the general meaning. Some nuance may differ.",
    };
  }
  return {
    label: "Low Semantic Alignment",
    color: "var(--warning)",
    tip: "Cross-language embeddings may score lower even for accurate translations. Consider reviewing.",
  };
}

export function SimilarityScore({ score }: SimilarityScoreProps) {
  const formattedScore = typeof score === "number" ? score.toFixed(4) : "0.0000";
  const percentage = Math.min(Math.max(Math.round((score || 0) * 100), 0), 100);
  const { label: alignmentLabel, color: alignmentColor, tip } = getAlignmentMeta(score);

  return (
    <div className="similarity-card">
      <div className="similarity-header">
        <span className="similarity-title">Semantic Similarity</span>
        <span className="similarity-score-value">{formattedScore}</span>
      </div>

      <div
        className="similarity-progress-track"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Semantic similarity score progress"
      >
        <div
          className="similarity-progress-fill"
          style={{ width: `${percentage}%`, background: alignmentColor }}
        />
      </div>

      <div className="similarity-footer" style={{ flexDirection: "column", gap: "0.35rem", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <span style={{ color: alignmentColor, fontWeight: 600 }}>
            {alignmentLabel}
          </span>
          <span>Score: {formattedScore} / 1.0</span>
        </div>
        <p className="similarity-tip">{tip}</p>
      </div>

      {/* Informational note about cross-lingual scoring */}
      <div className="similarity-info-note">
        <span>ℹ</span>
        <span>
          Scores are computed using multilingual embeddings across different language families.
          Cross-script translations (e.g. Telugu → English) naturally score lower due to
          embedding space differences — this does <strong>not</strong> indicate a poor translation.
        </span>
      </div>
    </div>
  );
}
