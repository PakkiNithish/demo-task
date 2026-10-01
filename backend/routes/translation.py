from fastapi import APIRouter, Form, File, UploadFile, HTTPException
from typing import Optional
import tempfile
import os

from services.document_parser import extract_text_from_file
from services.language_detection import detect_language
from services.translation import translate_to_english
from services.semantic_validation import calculate_semantic_similarity


router = APIRouter(
    prefix="/api/translation",
    tags=["Translation"]
)


@router.get("/health")
def translation_health():
    return {
        "feature": "Translation",
        "status": "ready"
    }


@router.post("/translate")
async def translate_text(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    source_content = ""

    # 1. If document file is uploaded (PDF or DOC/DOCX)
    if file is not None and file.filename:
        filename = file.filename
        ext = os.path.splitext(filename)[1] or ".pdf"
        temp_path = None

        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
                content = await file.read()
                temp_file.write(content)
                temp_path = temp_file.name

            extracted_doc_text = extract_text_from_file(temp_path, filename)
            if extracted_doc_text.strip():
                source_content = extracted_doc_text.strip()
        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass

    # 2. If direct text is also or exclusively provided
    if text and text.strip():
        if source_content:
            source_content = f"{source_content}\n\n{text.strip()}"
        else:
            source_content = text.strip()

    if not source_content:
        raise HTTPException(
            status_code=400,
            detail="Please provide text or upload a document (.pdf, .doc, .docx) to translate."
        )

    try:
        # 3. Detect language
        detected_language = detect_language(source_content)
        print(f"[TRANSLATE] source_content length: {len(source_content)}")
        print(f"[TRANSLATE] source_content preview: {repr(source_content[:300])}")
        print(f"[TRANSLATE] detected_language: {detected_language}")

        # 4. Translate to English
        translation = translate_to_english(
            source_content,
            detected_language
        )
        print(f"[TRANSLATE] raw translation: {repr(translation)}")

        if not translation:
            translation = "Translation could not be generated for this input."

        # 5. Calculate semantic similarity
        similarity_score = calculate_semantic_similarity(
            source_content,
            translation
        )

        return {
            "source_text": source_content,
            "detected_language": detected_language,
            "translation": translation,
            "semantic_similarity": similarity_score
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Translation error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(e)}"
        )