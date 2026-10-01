import { useState } from "react";
import { SparklesIcon, CopyIcon, CheckIcon } from "../Icons";

interface AnswerCardProps {
  answer: string;
}

export function AnswerCard({ answer }: AnswerCardProps) {
  const [copied, setCopied] = useState(false);

  if (!answer) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section className="result-section" aria-labelledby="generated-answer-heading">
      <div className="section-heading-row">
        <h2 id="generated-answer-heading" className="section-heading">
          <SparklesIcon size={20} className="text-primary" />
          <span>Generated Answer</span>
        </h2>
      </div>

      <div className="answer-card">
        <div className="answer-header">
          <span className="answer-badge">
            <SparklesIcon size={14} />
            <span>AI Synthesized Response</span>
          </span>

          <button
            onClick={handleCopy}
            className={`copy-btn ${copied ? "copied" : ""}`}
            type="button"
            aria-label="Copy answer to clipboard"
          >
            {copied ? (
              <>
                <CheckIcon size={14} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon size={14} />
                <span>Copy Answer</span>
              </>
            )}
          </button>
        </div>

        <div className="answer-text">{answer}</div>
      </div>
    </section>
  );
}
