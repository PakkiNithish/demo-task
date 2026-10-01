import React, { useState, useRef, useEffect } from "react";
import { SendIcon, SparklesIcon, UserIcon, CopyIcon, CheckIcon, TrashIcon } from "../Icons";
import { MarkdownRenderer } from "../MarkdownRenderer";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  loading?: boolean;
}

interface RetrievalChatProps {
  messages: ChatMessage[];
  onSendMessage: (question: string) => void;
  loading: boolean;
  disabled?: boolean;
  onClearChat?: () => void;
}

const SAMPLE_QUESTIONS = [
  "Summarize the key provisions and purpose of each document.",
  "Who are the parties involved and what are their primary rights and obligations?",
  "What are the terms of repayment, interest rate, or security pledged?",
  "What events of default, termination, or dispute resolution mechanisms are specified?",
];

export function RetrievalChat({
  messages,
  onSendMessage,
  loading,
  disabled = false,
  onClearChat,
}: RetrievalChatProps) {
  const [inputQuestion, setInputQuestion] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat on new messages or loading change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    const trimmed = inputQuestion.trim();
    if (!trimmed || loading || disabled) return;
    onSendMessage(trimmed);
    setInputQuestion("");
    // Re-focus textarea
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="card chat-workspace-card">
      <div className="card-header chat-header-row">
        <div>
          <h2 className="card-title">
            <SparklesIcon size={20} className="text-primary" />
            <span>Document Q&A Chat</span>
          </h2>
          <p className="card-subtitle">
            Ask questions one after another — answers appear in your conversation thread.
          </p>
        </div>

        {messages.length > 0 && onClearChat && (
          <button
            type="button"
            onClick={onClearChat}
            className="btn btn-secondary btn-sm"
            title="Clear chat conversation"
            disabled={loading}
          >
            <TrashIcon size={14} />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages-container" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon" aria-hidden="true">
              <SparklesIcon size={28} />
            </div>
            <h3 className="chat-empty-title">Ready for Your Questions</h3>
            <p className="chat-empty-text">
              {disabled
                ? "Please upload at least one document on the left to start asking questions."
                : "Ask anything about the uploaded documents. Suggested questions:"}
            </p>

            {!disabled && (
              <div className="chips-container" style={{ justifyContent: "center", marginTop: "1rem" }}>
                {SAMPLE_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="chip-btn"
                    onClick={() => {
                      setInputQuestion(q);
                      textareaRef.current?.focus();
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="chat-thread">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-wrapper ${
                  msg.role === "user" ? "chat-user-row" : "chat-assistant-row"
                }`}
              >
                <div
                  className={`chat-avatar ${
                    msg.role === "user" ? "avatar-user" : "avatar-assistant"
                  }`}
                  aria-hidden="true"
                >
                  {msg.role === "user" ? <UserIcon size={16} /> : <SparklesIcon size={16} />}
                </div>

                <div className={`chat-bubble ${msg.role === "user" ? "bubble-user" : "bubble-assistant"}`}>
                  <div className="bubble-meta">
                    <span className="bubble-author">
                      {msg.role === "user" ? "You" : "Lawsutra AI"}
                    </span>
                    <span className="bubble-timestamp">{msg.timestamp}</span>

                    {msg.role === "assistant" && !msg.loading && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className={`copy-btn bubble-copy-btn ${copiedId === msg.id ? "copied" : ""}`}
                        title="Copy answer"
                        aria-label="Copy answer to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <CheckIcon size={12} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {msg.loading ? (
                    <div className="chat-loading-indicator">
                      <span className="spinner spinner-sm" aria-hidden="true" />
                      <span>Synthesizing answer from documents...</span>
                    </div>
                  ) : (
                    <div className="bubble-content">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="chat-input-bar">
        <label htmlFor="chat-question-input" className="sr-only">
          Ask a question about the uploaded documents
        </label>
        <textarea
          ref={textareaRef}
          id="chat-question-input"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? "Upload a document to begin asking questions..."
              : "Ask a question about your documents (Press Enter to send)..."
          }
          rows={2}
          disabled={disabled || loading}
          className="textarea-field chat-textarea"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || loading || !inputQuestion.trim()}
          className="btn btn-primary chat-send-btn"
          id="chat-send-btn"
          title="Send Question"
          aria-label="Send Question"
        >
          {loading ? (
            <span className="spinner spinner-sm" aria-hidden="true" />
          ) : (
            <SendIcon size={18} />
          )}
          <span className="send-btn-label">Send</span>
        </button>
      </div>
    </div>
  );
}
