import React, { useRef } from "react";
import { TranslateIcon, UploadCloudIcon, FilePdfIcon, FileWordIcon, CloseIcon } from "../Icons";

interface TranslationInputProps {
  text: string;
  onChangeText: (value: string) => void;
  file: File | null;
  onChangeFile: (file: File | null) => void;
  onSubmit: () => void;
  loading: boolean;
}

const REGIONAL_SAMPLES = [
  {
    lang: "Telugu",
    text: "నమస్కారం, ఈ ఒప్పందం ప్రకారం అన్ని నిబంధనలు వర్తిస్తాయి.",
  },
  {
    lang: "Hindi",
    text: "यह कानूनी अनुबंध दोनों पक्षों की सहमति से निष्पादित किया गया है।",
  },
  {
    lang: "Tamil",
    text: "இந்த சட்டப்பூர்வ ஒப்பந்தம் இரு தரப்பினராலும் ஏற்றுக்கொள்ளப்பட்டது.",
  },
  {
    lang: "Kannada",
    text: "ಈ ಕಾನೂನು ಒಪ್ಪಂದವನ್ನು ಎರಡೂ ಪಕ್ಷಗಳ ಒಪ್ಪಿಗೆಯೊಂದಿಗೆ ಮಾಡಲಾಗಿದೆ.",
  },
];

const ACCEPTED_FORMATS = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function TranslationInput({
  text,
  onChangeText,
  file,
  onChangeFile,
  onSubmit,
  loading,
}: TranslationInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!loading && (text.trim() || file)) {
        onSubmit();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    onChangeFile(selected);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (filename: string) => {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".doc") || lower.endsWith(".docx")) {
      return <FileWordIcon size={18} />;
    }
    return <FilePdfIcon size={18} />;
  };

  const canSubmit = Boolean(text.trim() || file);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <TranslateIcon size={20} className="text-primary" />
          <span>Source Input</span>
        </h2>
        <p className="card-subtitle">
          Enter regional language text or upload a PDF/Word document to translate.
        </p>
      </div>

      {/* Document Upload Area for Translation */}
      <div style={{ marginBottom: "1.25rem" }}>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FORMATS}
          className="sr-only"
          onChange={handleFileChange}
          disabled={loading}
          id="translation-file-input"
        />

        {!file ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="translation-upload-trigger"
          >
            <UploadCloudIcon size={18} className="text-primary" />
            <span>Upload Document (.pdf, .doc, .docx)</span>
          </button>
        ) : (
          <div className="selected-file-card" style={{ margin: 0 }}>
            <div className="selected-file-info">
              <div className="file-badge-icon">
                {getFileIcon(file.name)}
              </div>
              <div>
                <div className="selected-file-name" title={file.name}>
                  {file.name}
                </div>
                <div className="selected-file-size">
                  {formatFileSize(file.size)} • Document Attached
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onChangeFile(null)}
              className="copy-btn"
              title="Remove document"
              aria-label="Remove document"
              disabled={loading}
            >
              <CloseIcon size={14} />
              <span>Remove</span>
            </button>
          </div>
        )}
      </div>

      {/* Direct Text Input */}
      <div className="form-group">
        <label htmlFor="source-text-input" className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Or Enter Regional Text Directly:</span>
          {text.length > 0 && (
            <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: "0.75rem" }}>
              {text.length} chars
            </span>
          )}
        </label>
        <textarea
          id="source-text-input"
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter text in an Indian regional language (Telugu, Hindi, Tamil, Kannada, etc.)..."
          rows={6}
          disabled={loading}
          className="textarea-field"
        />
        <div className="form-helper">
          Press Ctrl + Enter to translate
        </div>
      </div>

      {/* Sample Chips */}
      {!loading && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div className="form-label" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
            Try Regional Samples:
          </div>
          <div className="chips-container" style={{ margin: 0 }}>
            {REGIONAL_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="chip-btn"
                onClick={() => onChangeText(sample.text)}
                title={`Load ${sample.lang} legal text`}
              >
                {sample.lang} Sample
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Translate Button */}
      <button
        onClick={onSubmit}
        disabled={loading || !canSubmit}
        className="btn btn-primary btn-full"
        type="button"
        id="translate-btn"
      >
        {loading ? (
          <>
            <span className="spinner spinner-sm" aria-hidden="true" />
            <span>Translating...</span>
          </>
        ) : (
          <span>Translate</span>
        )}
      </button>
    </div>
  );
}
