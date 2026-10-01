import { useState } from "react";
import { TranslateIcon, CopyIcon, CheckIcon } from "../Icons";
import { MarkdownRenderer } from "../MarkdownRenderer";

interface TranslationResultProps {
  detectedLanguage: string;
  translation: string;
}

export function TranslationResult({
  detectedLanguage,
  translation,
}: TranslationResultProps) {
  const [copied, setCopied] = useState(false);

  const hasResult = Boolean(detectedLanguage || translation);

  const handleCopy = async () => {
    if (!translation) return;
    try {
      // Strip asterisks so copied text is clean for pasting into documents/emails
      const cleanText = translation
        .replace(/\*\*\*/g, "")
        .replace(/\*\*/g, "")
        .replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, "$1$2$3");
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <TranslateIcon size={20} className="text-primary" />
          <span>Translation</span>
        </h2>
        <p className="card-subtitle">
          {hasResult
            ? "Automated legal translation."
            : "Your translated result will appear here."}
        </p>
      </div>

      {!hasResult ? (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            <TranslateIcon size={24} />
          </div>
          <h3 className="empty-state-title">No Translation Yet</h3>
          <p className="empty-state-text">
            Enter regional text on the left and click Translate to see the English translation.
          </p>
        </div>
      ) : (
        <div className="translation-result-box">
          {detectedLanguage && (
            <div className="meta-tag-card">
              <span className="meta-label">Detected Language</span>
              <span className="meta-value">{detectedLanguage.toUpperCase()}</span>
            </div>
          )}

          {translation && (
            <div className="translation-display-card">
              <div className="translation-display-header">
                <span className="translation-display-label">English Translation</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`copy-btn ${copied ? "copied" : ""}`}
                  aria-label="Copy translation to clipboard"
                >
                  {copied ? (
                    <>
                      <CheckIcon size={14} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={14} />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="translation-display-text">
                <MarkdownRenderer content={translation} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
