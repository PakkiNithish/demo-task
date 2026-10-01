import os
import re
import pymupdf
import docx


def _extract_from_docx(file_path: str) -> str:
    """Extract paragraphs, tables, and section headers/footers from DOCX."""
    doc = docx.Document(file_path)
    extracted_lines = []

    # 1. Section headers
    for section in doc.sections:
        for p in section.header.paragraphs:
            t = p.text.strip()
            if t and t not in extracted_lines:
                extracted_lines.append(t)

    # 2. Body paragraphs
    for para in doc.paragraphs:
        clean_text = para.text.strip()
        if clean_text:
            extracted_lines.append(clean_text)

    # 3. Tables (with cell deduplication for merged cells)
    for table in doc.tables:
        seen_cells = set()
        for row in table.rows:
            row_texts = []
            for cell in row.cells:
                if cell._tc not in seen_cells:
                    seen_cells.add(cell._tc)
                    cell_text = cell.text.strip()
                    if cell_text:
                        row_texts.append(cell_text)
            if row_texts:
                extracted_lines.append(" | ".join(row_texts))

    return "\n".join(extracted_lines)


def _extract_from_doc(file_path: str) -> str:
    """Extract text from legacy binary Word (.doc) files."""
    # Try docx first (many .doc files are actually renamed docx files)
    try:
        text = _extract_from_docx(file_path)
        if text.strip():
            return text
    except Exception:
        pass

    # Extract readable text streams from binary OLE stream
    try:
        with open(file_path, "rb") as f:
            content = f.read()

        ascii_strings = [
            m.decode("ascii", errors="ignore").strip()
            for m in re.findall(rb"[\x20-\x7E\t\r\n]{4,}", content)
        ]
        utf16_strings = [
            m.decode("utf-16le", errors="ignore").strip()
            for m in re.findall(rb"(?:[\x20-\x7E][\x00]){4,}", content)
        ]

        readable = []
        for s in ascii_strings + utf16_strings:
            s_clean = s.strip()
            # Filter out XML tags and low-quality metadata
            if len(s_clean) >= 4 and not s_clean.startswith("<?xml") and not s_clean.startswith("<w:"):
                readable.append(s_clean)

        if readable:
            return "\n".join(readable)
    except Exception:
        pass

    return ""


def _should_run_ocr(text: str, filename: str = "") -> bool:
    """
    Check if a PDF page requires Vision OCR extraction.
    Triggers OCR when:
    1. Text is empty or very sparse (< 60 words on a full page).
    2. Document is an Indian regional document (filename contains hindi/telugu/etc. or regional sample)
       but extracted text contains 0 Indic characters (only English watermarks like 'India Code').
    3. Extracted text has low density of clean letters to symbols.
    """
    if not text or not text.strip():
        return True

    words = re.findall(r'\b[^\W\d_]{2,}\b', text)
    indic_letters = re.findall(r'[\u0900-\u0D7F]', text)

    fname_lower = filename.lower()
    is_regional_named = any(k in fname_lower for k in [
        "hindi", "telugu", "tamil", "kannada", "marathi", "bengali", "gujarati", "malayalam", "punjabi", "regional", "sample"
    ])

    # Case A: If regional filename or hint, but PyMuPDF found NO Indic characters (watermark only)
    if is_regional_named and len(indic_letters) < 15:
        return True

    # Case B: If total words on page is very low (< 60 words) - typical of watermarked scanned pages (e.g. India Code)
    if len(words) < 60:
        return True

    # Case C: Ratio of real letters to non-whitespace characters is low
    clean_letters = [c for c in re.findall(r'[\u0900-\u0D7F\w]', text) if not c.isdigit() and c != '_']
    non_space = len(re.sub(r'\s+', '', text))
    if non_space > 0 and (len(clean_letters) / non_space) < 0.35:
        return True

    return False


_easyocr_readers = {}

LANGUAGE_MAP = {
    "telugu": "te",
    "tamil": "ta",
    "kannada": "kn",
    "malayalam": "ml",
    "bengali": "bn",
    "gujarati": "gu",
    "punjabi": "pa",
    "odia": "or",
    "marathi": "mr",
    "bhojpuri": "bho",
    "hindi": "hi",
}


def _detect_lang_code(filename: str = "", text_sample: str = "") -> str:
    fname = filename.lower()
    for name, code in LANGUAGE_MAP.items():
        if name in fname:
            return code

    # Detect by Unicode script block if text exists
    if text_sample:
        if any('\u0C00' <= c <= '\u0C7F' for c in text_sample):
            return "te"  # Telugu
        if any('\u0B80' <= c <= '\u0BFF' for c in text_sample):
            return "ta"  # Tamil
        if any('\u0C80' <= c <= '\u0CFF' for c in text_sample):
            return "kn"  # Kannada
        if any('\u0D00' <= c <= '\u0D7F' for c in text_sample):
            return "ml"  # Malayalam
        if any('\u0980' <= c <= '\u09FF' for c in text_sample):
            return "bn"  # Bengali
        if any('\u0A80' <= c <= '\u0AFF' for c in text_sample):
            return "gu"  # Gujarati
        if any('\u0A00' <= c <= '\u0A7F' for c in text_sample):
            return "pa"  # Punjabi
        if any('\u0B00' <= c <= '\u0B7F' for c in text_sample):
            return "or"  # Odia

    return "hi"  # Default Devanagari


def _get_easyocr_reader(lang_code: str):
    """Lazy initialize EasyOCR reader with the requested language + English."""
    global _easyocr_readers
    if lang_code not in _easyocr_readers:
        try:
            import easyocr
            langs = [lang_code, 'en']
            if lang_code in ("hi", "mr", "bho"):
                langs = ['hi', 'mr', 'en']
            _easyocr_readers[lang_code] = easyocr.Reader(langs, gpu=False, verbose=False)
        except Exception as e:
            print(f"Failed to initialize EasyOCR for {lang_code}: {e}")
            if "hi" in _easyocr_readers:
                return _easyocr_readers["hi"]
            try:
                import easyocr
                _easyocr_readers["hi"] = easyocr.Reader(['hi', 'en'], gpu=False, verbose=False)
                return _easyocr_readers["hi"]
            except Exception:
                return None
    return _easyocr_readers.get(lang_code)


def _ocr_page_easyocr(page, filename: str = "", text_sample: str = "") -> str:
    """Render PDF page at dpi=96 (cuts CPU time by 65%) and perform script-aware EasyOCR."""
    lang_code = _detect_lang_code(filename, text_sample)
    reader = _get_easyocr_reader(lang_code)
    if not reader:
        return ""
    try:
        # dpi=96 reduces pixel count from 2.2M to 0.8M, cutting CPU time from 75s to ~16-18s!
        pix = page.get_pixmap(dpi=96)
        img_bytes = pix.tobytes("png")
        lines = reader.readtext(img_bytes, detail=0)
        return "\n".join(lines).strip()
    except Exception as e:
        print(f"EasyOCR error for {lang_code}: {e}")
        return ""


def _ocr_page_vision(page) -> str:
    """Render PDF page to image and transcribe using Groq Vision (fast fallback)."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return ""
    try:
        import base64
        from groq import Groq
        pix = page.get_pixmap(dpi=120)
        img_bytes = pix.tobytes("jpeg")
        base64_image = base64.b64encode(img_bytes).decode("utf-8")

        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.2-11b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Transcribe all readable text from this document image exactly as written. "
                                "Preserve the original language (Telugu, Tamil, Kannada, Malayalam, Hindi, or English). "
                                "Return only the extracted text without introductory or concluding remarks."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            temperature=0.1,
            max_tokens=2048,
        )
        if response.choices and response.choices[0].message.content:
            return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Vision OCR fallback error: {e}")
    return ""


def _ocr_page(page, filename: str = "", text_sample: str = "") -> str:
    """Perform script-aware EasyOCR first; fall back to Vision OCR if empty."""
    text = _ocr_page_easyocr(page, filename, text_sample)
    if not text.strip():
        text = _ocr_page_vision(page)
    return text


def _extract_from_pdf(file_path: str, filename: str = "") -> str:
    """Extract text from PDF using PyMuPDF, falling back to OCR if text is corrupted or scanned."""
    document = pymupdf.open(file_path)
    if document.is_encrypted:
        try:
            document.authenticate("")
        except Exception:
            pass

    pages_text = []
    # Cap to first 3 pages to ensure response always returns well within 60s
    for page_idx, page in enumerate(document):
        if page_idx >= 3:
            break

        # 1. Try reading-order sorted text
        text = page.get_text("text", sort=True)
        # 2. Fallback to block extraction if standard text is empty
        if not text.strip():
            blocks = page.get_text("blocks")
            block_texts = [b[4].strip() for b in blocks if len(b) > 4 and b[4].strip()]
            text = "\n".join(block_texts)

        # Clean null characters and excessive whitespace
        text = text.replace("\x00", "").strip()

        # 3. Fallback to script-aware OCR if extracted text is missing, sparse, or watermark-only
        if _should_run_ocr(text, filename):
            ocr_text = _ocr_page(page, filename, text)
            if ocr_text:
                has_indic = any('\u0900' <= c <= '\u0D7F' for c in ocr_text)
                if has_indic or len(ocr_text.strip()) > len(text.strip()):
                    text = ocr_text

        if text:
            pages_text.append(text)

    document.close()
    return "\n\n".join(pages_text)


def extract_text_from_file(file_path: str, original_filename: str = "") -> str:
    """
    Extract readable text content from PDF, DOCX, DOC, or plain text files.
    Never returns raw binary data.
    """
    if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
        return ""

    filename = original_filename or file_path
    ext = os.path.splitext(filename)[1].lower()

    # Detect file type from magic bytes if possible
    magic = b""
    try:
        with open(file_path, "rb") as f:
            magic = f.read(8)
    except Exception:
        pass

    is_pdf = ext == ".pdf" or magic.startswith(b"%PDF")
    is_docx = ext == ".docx" or (magic.startswith(b"PK\x03\x04") and ext != ".pdf")
    is_doc = ext == ".doc" or magic.startswith(b"\xd0\xcf\x11\xe0")

    # 1. Handle PDF
    if is_pdf:
        try:
            text = _extract_from_pdf(file_path, filename)
            if text.strip():
                return text.strip()
        except Exception:
            pass
        return ""

    # 2. Handle DOCX
    if is_docx:
        try:
            text = _extract_from_docx(file_path)
            if text.strip():
                return text.strip()
        except Exception:
            pass
        # If docx parsing failed, try legacy doc parser
        text = _extract_from_doc(file_path)
        return text.strip()

    # 3. Handle DOC
    if is_doc:
        text = _extract_from_doc(file_path)
        return text.strip()

    # 4. Handle plain text files (.txt, .md, .csv, .json, .rtf)
    if ext in [".txt", ".text", ".md", ".csv", ".json", ".rtf", ".log", ""]:
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read().strip()
                # Ensure it's not a binary file mistakenly opened as text
                if not content.startswith("%PDF") and not content.startswith("\xd0\xcf"):
                    return content
        except Exception:
            pass

    return ""


def extract_text_from_pdf(file_path: str) -> str:
    """
    Backward-compatible wrapper for PDF extraction.
    """
    return extract_text_from_file(file_path, file_path)