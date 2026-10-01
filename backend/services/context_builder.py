from collections import defaultdict
from typing import List, Any


def build_context(results: List[Any]) -> str:
    """
    Build clean context grouped by document title/filename.
    Avoids arbitrary '[Source 1]', '[Source 2]' tags which confuse the LLM
    into thinking chunks are separate documents.
    """
    if not results:
        return ""

    docs_chunks = defaultdict(list)
    for result in results:
        payload = getattr(result, "payload", {}) or {}
        text = payload.get("text", "").strip()
        doc_title = payload.get("title") or payload.get("filename") or "Uploaded Document"
        if text and text not in docs_chunks[doc_title]:
            docs_chunks[doc_title].append(text)

    context_parts = []
    for doc_title, chunks in docs_chunks.items():
        doc_content = "\n\n".join(chunks)
        context_parts.append(
            f"=== DOCUMENT: {doc_title} ===\n{doc_content}"
        )

    return "\n\n".join(context_parts)