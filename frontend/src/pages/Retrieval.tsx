import { useState } from "react";
import { BackButton } from "../components/BackButton";
import { DocumentUpload } from "../components/retrieval/DocumentUpload";
import { RetrievalChat, type ChatMessage } from "../components/retrieval/RetrievalChat";
import { ErrorAlert } from "../components/ErrorAlert";
import { submitRetrieval } from "../services/api";

interface RetrievalProps {
  onBack: () => void;
}

export function Retrieval({ onBack }: RetrievalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = async (question: string) => {
    if (files.length === 0) {
      setError("Please upload at least one document before asking a question.");
      return;
    }

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `ai-${Date.now() + 1}`;
    const timestamp = formatTime();

    // 1. Immediately append user question and pending AI response
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: question,
      timestamp,
    };

    const newPendingAiMsg: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp,
      loading: true,
    };

    setMessages((prev) => [...prev, newUserMsg, newPendingAiMsg]);
    setLoading(true);
    setError("");

    try {
      const data = await submitRetrieval(files, question);

      // 2. Update the pending AI response with real answer and mark loading false
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: data.answer || "No response received.",
                loading: false,
              }
            : msg
        )
      );
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Unable to process the document. Please verify the backend service is running and try again.";
      setError(errorMsg);

      // Remove the pending loading message on failure or show failure message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Error: ${errorMsg}`,
                loading: false,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="retrieval-container">
      <div style={{ marginBottom: "1.5rem" }}>
        <BackButton onClick={onBack} label="Back to Dashboard" />
      </div>

      <header className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">Retrieval & Ask Questions</h1>
          <p className="page-description">
            Upload PDF or Word documents and ask multiple questions using semantic retrieval and AI.
          </p>
        </div>
      </header>

      {error && (
        <ErrorAlert
          title="Retrieval Notice"
          message={error}
          onDismiss={() => setError("")}
        />
      )}

      <div className="workspace-grid" style={{ alignItems: "stretch" }}>
        {/* Left Column: Multi-Document Upload */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <DocumentUpload
            files={files}
            onFilesChange={(newFiles) => {
              setFiles(newFiles);
              if (error) setError("");
            }}
            disabled={loading}
          />
        </div>

        {/* Right Column: Interactive Chat Thread */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <RetrievalChat
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={loading}
            disabled={files.length === 0}
            onClearChat={handleClearChat}
          />
        </div>
      </div>
    </div>
  );
}
