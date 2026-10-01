export type Feature = "home" | "retrieval" | "translation";

export interface RetrievalResponse {
  question: string;
  answer: string;
  sources: string[];
}

export interface TranslationResponse {
  source_text: string;
  detected_language: string;
  translation: string;
  semantic_similarity: number;
}
