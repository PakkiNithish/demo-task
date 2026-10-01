import type { RetrievalResponse, TranslationResponse } from "../types";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const RETRIEVAL_ENDPOINT = `${API_BASE_URL}/api/retrieval/ask`;
export const TRANSLATION_ENDPOINT = `${API_BASE_URL}/api/translation/translate`;

export async function submitRetrieval(
  files: File[],
  question: string
): Promise<RetrievalResponse> {
  const formData = new FormData();
  
  if (files.length === 1) {
    formData.append("file", files[0]);
  } else {
    for (const f of files) {
      formData.append("files", f);
      // Also append 'file' for maximum compatibility
      formData.append("file", f);
    }
  }
  
  formData.append("question", question);

  const response = await fetch(RETRIEVAL_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = "Failed to process the document(s).";
    try {
      const data = await response.json();
      if (data && data.detail) {
        errorDetail = data.detail;
      }
    } catch {
      // Use fallback error
    }
    throw new Error(errorDetail);
  }

  const data: RetrievalResponse = await response.json();
  return {
    question: data.question || question,
    answer: data.answer || "",
    sources: data.sources || [],
  };
}

export async function submitTranslation(
  text?: string,
  file?: File | null
): Promise<TranslationResponse> {
  const formData = new FormData();
  if (text && text.trim()) {
    formData.append("text", text.trim());
  }
  if (file) {
    formData.append("file", file);
  }

  const response = await fetch(TRANSLATION_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorDetail = "Translation request failed. Please check your input.";
    try {
      const data = await response.json();
      if (data && data.detail) {
        errorDetail = data.detail;
      }
    } catch {
      // Use fallback error
    }
    throw new Error(errorDetail);
  }

  const data: TranslationResponse = await response.json();
  return {
    source_text: data.source_text || text || "",
    detected_language: data.detected_language || "Unknown",
    translation: data.translation || "",
    semantic_similarity: typeof data.semantic_similarity === "number" ? data.semantic_similarity : 0,
  };
}
