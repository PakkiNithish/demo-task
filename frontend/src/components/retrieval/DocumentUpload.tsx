import React, { useRef, useState } from "react";
import { UploadCloudIcon, FilePdfIcon, FileWordIcon, CloseIcon, PlusIcon } from "../Icons";

interface DocumentUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ACCEPT_STRING = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function DocumentUpload({
  files,
  onFilesChange,
  disabled = false,
}: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isFileAccepted = (file: File): boolean => {
    const name = file.name.toLowerCase();
    return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
  };

  const addFiles = (newFiles: FileList | File[]) => {
    const validFiles: File[] = [];
    let hasInvalid = false;

    Array.from(newFiles).forEach((f) => {
      if (isFileAccepted(f)) {
        // Prevent exact duplicates
        const exists = files.some(
          (existing) => existing.name === f.name && existing.size === f.size
        );
        if (!exists) {
          validFiles.push(f);
        }
      } else {
        hasInvalid = true;
      }
    });

    if (hasInvalid) {
      setErrorMessage("Only PDF, DOC, and DOCX documents are supported.");
    } else {
      setErrorMessage("");
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset input so same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    if (disabled) return;
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    onFilesChange(updated);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onFilesChange([]);
    setErrorMessage("");
  };

  const getFileIcon = (filename: string) => {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".doc") || lower.endsWith(".docx")) {
      return <FileWordIcon size={18} />;
    }
    return <FilePdfIcon size={18} />;
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 className="card-title">
            <UploadCloudIcon size={20} className="text-primary" />
            <span>Documents ({files.length})</span>
          </h2>
          <p className="card-subtitle">
            Upload multiple PDF, DOC, or DOCX documents to query.
          </p>
        </div>

        {files.length > 1 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="btn btn-secondary btn-sm"
            disabled={disabled}
            style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
          >
            Clear All
          </button>
        )}
      </div>

      <div
        className={`file-dropzone ${isDragOver ? "drag-active" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload PDF or DOC documents dropzone"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_STRING}
          multiple
          className="sr-only"
          onChange={handleInputChange}
          disabled={disabled}
          id="doc-upload-input"
        />

        <div className="dropzone-icon" aria-hidden="true">
          {files.length > 0 ? <PlusIcon size={22} /> : <UploadCloudIcon size={24} />}
        </div>

        <div className="dropzone-text">
          {files.length > 0 ? "Add more documents" : "Choose documents to upload"}
        </div>
        <div className="dropzone-subtext">
          Drag & drop multiple files • Supports PDF, DOC, and DOCX
        </div>
      </div>

      {errorMessage && (
        <div style={{ color: "var(--danger)", fontSize: "0.8125rem", marginTop: "0.5rem" }}>
          {errorMessage}
        </div>
      )}

      {files.length > 0 && (
        <div className="uploaded-files-list" style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {files.map((f, idx) => (
            <div key={`${f.name}-${idx}`} className="selected-file-card" style={{ margin: 0 }}>
              <div className="selected-file-info">
                <div className="file-badge-icon">
                  {getFileIcon(f.name)}
                </div>
                <div>
                  <div className="selected-file-name" title={f.name}>
                    {f.name}
                  </div>
                  <div className="selected-file-size">
                    {formatFileSize(f.size)} • Ready for Retrieval
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(idx);
                }}
                className="copy-btn"
                title="Remove this document"
                aria-label={`Remove ${f.name}`}
                disabled={disabled}
              >
                <CloseIcon size={14} />
                <span>Remove</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
