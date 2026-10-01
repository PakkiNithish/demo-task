import React from "react";
import { DocumentSearchIcon } from "../Icons";

interface QuestionInputProps {
  question: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled?: boolean;
}

const SAMPLE_QUESTIONS = [
  "Summarize the key provisions and purpose of each document.",
  "What are the primary obligations and liabilities of the parties?",
  "What securities, assets, or guarantees are described?",
];

export function QuestionInput({
  question,
  onChange,
  onSubmit,
  loading,
  disabled = false,
}: QuestionInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!loading && question.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <DocumentSearchIcon size={20} className="text-primary" />
          <span>Ask a Question</span>
        </h2>
        <p className="card-subtitle">Ask something about the document.</p>
      </div>

      <div className="form-group">
        <label htmlFor="question-textarea" className="sr-only">
          Document Question
        </label>
        <textarea
          id="question-textarea"
          value={question}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the legal provisions, parties, obligations, or terms..."
          rows={5}
          disabled={loading || disabled}
          className="textarea-field"
        />
        <div className="form-helper">
          Press Ctrl + Enter to submit quickly
        </div>
      </div>

      {SAMPLE_QUESTIONS.length > 0 && !loading && (
        <div>
          <div className="form-label" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            Suggested Questions:
          </div>
          <div className="chips-container">
            {SAMPLE_QUESTIONS.map((sampleQ, idx) => (
              <button
                key={idx}
                type="button"
                className="chip-btn"
                onClick={() => onChange(sampleQ)}
                disabled={loading}
              >
                {sampleQ}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={loading || !question.trim()}
        className="btn btn-primary btn-full"
        type="button"
        id="ask-question-btn"
      >
        {loading ? (
          <>
            <span className="spinner spinner-sm" aria-hidden="true" />
            <span>Processing...</span>
          </>
        ) : (
          <span>Ask Question</span>
        )}
      </button>
    </div>
  );
}
