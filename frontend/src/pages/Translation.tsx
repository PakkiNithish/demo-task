import { useState } from "react";
import { BackButton } from "../components/BackButton";
import { TranslationInput } from "../components/translation/TranslationInput";
import { TranslationResult } from "../components/translation/TranslationResult";
import { ErrorAlert } from "../components/ErrorAlert";
import { LoadingState } from "../components/LoadingState";
import { submitTranslation } from "../services/api";

interface TranslationProps {
  onBack: () => void;
}

const TRANSLATION_STAGES = [
  "Detecting language...",
  "Translating...",
  "Finalizing translation...",
];

export function Translation({ onBack }: TranslationProps) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!text.trim() && !file) {
      setError("Please enter some text or upload a document (.pdf, .doc, .docx) to translate.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await submitTranslation(text, file);
      setDetectedLanguage(data.detected_language);
      setTranslation(data.translation);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to translate the text. Please check your network connection and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="translation-container">
      <div style={{ marginBottom: "1.5rem" }}>
        <BackButton onClick={onBack} label="Back to Dashboard" />
      </div>

      <header className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">Translation</h1>
          <p className="page-description">
            Translate Indian regional-language text or uploaded documents into English.
          </p>
        </div>
      </header>

      {error && (
        <ErrorAlert
          title="Translation Error"
          message={error}
          onDismiss={() => setError("")}
        />
      )}

      <div className="workspace-grid">
        <TranslationInput
          text={text}
          onChangeText={(val) => {
            setText(val);
            if (error) setError("");
          }}
          file={file}
          onChangeFile={(selectedFile) => {
            setFile(selectedFile);
            if (error) setError("");
          }}
          onSubmit={handleTranslate}
          loading={loading}
        />

        <div>
          {loading ? (
            <div className="card">
              <LoadingState stages={TRANSLATION_STAGES} stageIntervalMs={1600} />
            </div>
          ) : (
            <TranslationResult
              detectedLanguage={detectedLanguage}
              translation={translation}
            />
          )}
        </div>
      </div>
    </div>
  );
}
