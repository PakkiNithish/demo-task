from fastapi import APIRouter, File, UploadFile, Form, Request, HTTPException
from typing import Optional, List
import tempfile
import os

from services.document_parser import extract_text_from_file, extract_text_from_pdf
from services.chunking import chunk_text
from services.embeddings import create_embeddings
from services.vector_store import (
    create_collection,
    store_embeddings,
    search_similar,
)
from services.context_builder import build_context
from services.llm import generate_answer


router = APIRouter(
    prefix="/api/retrieval",
    tags=["Retrieval"]
)


@router.get("/health")
def retrieval_health():
    return {
        "feature": "Retrieval & Ask Questions",
        "status": "ready"
    }


@router.post("/ask")
async def ask_question(
    file: Optional[UploadFile] = File(None),
    files: Optional[List[UploadFile]] = File(None),
    question: str = Form(...)
):
    # Collect all uploaded files whether submitted as single 'file' or list 'files'
    raw_files: List[UploadFile] = []
    if files:
        raw_files.extend(files)
    if file is not None:
        raw_files.append(file)

    # Deduplicate files by filename so each document is parsed exactly once
    uploaded_files: List[UploadFile] = []
    seen_filenames = set()
    for f in raw_files:
        fname = f.filename or ""
        if fname and fname not in seen_filenames:
            seen_filenames.add(fname)
            uploaded_files.append(f)
        elif not fname and f not in uploaded_files:
            uploaded_files.append(f)

    if not uploaded_files:
        raise HTTPException(
            status_code=400,
            detail="Please upload at least one document (PDF, DOC, or DOCX)."
        )

    temp_paths: List[str] = []
    doc_records = []
    all_chunks: List[str] = []
    all_payloads: List[dict] = []

    try:
        for uploaded_file in uploaded_files:
            original_filename = uploaded_file.filename or "document.pdf"
            ext = os.path.splitext(original_filename)[1] or ".pdf"
            clean_title = os.path.splitext(original_filename)[0].replace("-", " ").replace("_", " ").strip()

            # Reset file pointer to beginning before reading
            await uploaded_file.seek(0)
            content = await uploaded_file.read()

            if not content:
                continue

            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
                temp_file.write(content)
                temp_file.flush()
                temp_path = temp_file.name
                temp_paths.append(temp_path)

            doc_text = extract_text_from_file(temp_path, original_filename)
            if doc_text and doc_text.strip():
                chunks_for_doc = chunk_text(doc_text.strip())
                if chunks_for_doc:
                    doc_records.append({
                        "filename": original_filename,
                        "title": clean_title,
                        "chunks": chunks_for_doc,
                    })
                    for chunk in chunks_for_doc:
                        all_chunks.append(chunk)
                        all_payloads.append({
                            "text": chunk,
                            "filename": original_filename,
                            "title": clean_title,
                        })

        if not all_chunks:
            raise HTTPException(
                status_code=400,
                detail="Unable to extract readable text from the uploaded document(s)."
            )

        # 1. Create embeddings for all document chunks
        embeddings = create_embeddings(all_chunks)

        # 2. Create Qdrant collection
        create_collection()

        # 3. Store embeddings with document metadata payloads
        store_embeddings(all_chunks, embeddings, payloads=all_payloads)

        # 4. Embed question
        query_embedding = create_embeddings([question])[0]

        # 5. Retrieve relevant chunks (scale retrieval limit with document count)
        retrieval_limit = max(6, len(doc_records) * 3)
        results = search_similar(
            query_embedding,
            limit=retrieval_limit
        )

        # 6. Ensure every uploaded document is represented in the retrieved context
        represented_docs = {
            r.payload.get("filename") for r in results if getattr(r, "payload", None)
        }
        final_results = list(results)

        for doc in doc_records:
            if doc["filename"] not in represented_docs and doc["chunks"]:
                # Add the primary overview chunk of the missing document
                first_chunk = doc["chunks"][0]
                # Create a lightweight dummy result object with payload
                class DummyPoint:
                    def __init__(self, p):
                        self.payload = p
                final_results.append(DummyPoint({
                    "text": first_chunk,
                    "filename": doc["filename"],
                    "title": doc["title"]
                }))

        # 7. Build structured context grouped by document name
        context = build_context(final_results)

        # 8. Generate answer
        answer = generate_answer(
            question,
            context
        )

        return {
            "question": question,
            "answer": answer,
            "sources": [
                result.payload.get("text", "")
                for result in final_results
                if getattr(result, "payload", None)
            ]
        }

    finally:
        for p in temp_paths:
            if os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass