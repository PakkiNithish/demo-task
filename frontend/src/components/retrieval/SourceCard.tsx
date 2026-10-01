import { useState } from "react";
import { CopyIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon } from "../Icons";

interface SourceCardProps {
  source: string;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isLong = source.length > 350;
  const displayText = isLong && !expanded ? `${source.slice(0, 350)}...` : source;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="source-card">
      <div className="source-header">
        <span className="source-label">Source {index + 1}</span>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="copy-btn"
              type="button"
              aria-label={expanded ? "Collapse text" : "Expand text"}
            >
              {expanded ? (
                <>
                  <ChevronUpIcon size={14} />
                  <span>Show Less</span>
                </>
              ) : (
                <>
                  <ChevronDownIcon size={14} />
                  <span>Read Full</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className={`copy-btn ${copied ? "copied" : ""}`}
            type="button"
            aria-label={`Copy source ${index + 1}`}
          >
            {copied ? (
              <>
                <CheckIcon size={14} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon size={14} />
                <span>Copy Source</span>
              </>
            )}
          </button>
        </div>
      </div>

      <p className="source-snippet">{displayText}</p>
    </div>
  );
}

interface SourcesListProps {
  sources: string[];
}

export function SourcesList({ sources }: SourcesListProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <section className="result-section" aria-labelledby="retrieved-context-heading">
      <div className="section-heading-row">
        <h2 id="retrieved-context-heading" className="section-heading">
          <span>Retrieved Context</span>
          <span className="brand-badge" style={{ textTransform: "none", fontWeight: 500 }}>
            {sources.length} {sources.length === 1 ? "Chunk" : "Chunks"}
          </span>
        </h2>
      </div>

      <div className="sources-list">
        {sources.map((source, index) => (
          <SourceCard key={index} source={source} index={index} />
        ))}
      </div>
    </section>
  );
}
