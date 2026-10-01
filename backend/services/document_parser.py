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


_easyocr_reader = None


def _get_ocr_reader():
    """Lazy initialize EasyOCR reader with Devanagari and Latin script support."""
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
            _easyocr_reader = easyocr.Reader(['hi', 'en'], gpu=False, verbose=False)
        except Exception as e:
            print(f"Failed to initialize EasyOCR: {e}")
            _easyocr_reader = None
    return _easyocr_reader


def _is_quality_text(text: str) -> bool:
    """
    Check if the extracted text contains meaningful readable characters
    rather than just punctuation, numbers, spaces, or watermark artifacts.
    """
    if not text or not text.strip():
        return False

    # Find all alphabetic and regional script letters (Devanagari, Bengali, Telugu, Tamil, Kannada, etc.)
    letters = re.findall(r'[\u0900-\u0D7F\w]', text)
    clean_letters = [c for c in letters if not c.isdigit() and c != '_']

    # If fewer than 25 real alphabetic letters
    if len(clean_letters) < 25:
        return False

    # Ratio of real letters to non-whitespace characters
    non_space_chars = len(re.sub(r'\s+', '', text))
    if non_space_chars > 0 and (len(clean_letters) / non_space_chars) < 0.25:
        return False

    return True


def _ocr_page(page) -> str:
    """Render PDF page to image and perform OCR extraction."""
    reader = _get_ocr_reader()
    if not reader:
        return ""
    try:
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        lines = reader.readtext(img_bytes, detail=0)
        return "\n".join(lines).strip()
    except Exception as e:
        print(f"OCR error on page: {e}")
        return ""


def _extract_from_pdf(file_path: str) -> str:
    """Extract text from PDF using PyMuPDF, falling back to OCR if text is corrupted or scanned."""
    document = pymupdf.open(file_path)
    if document.is_encrypted:
        try:
            document.authenticate("")
        except Exception:
            pass

    pages_text = []
    for page in document:
        # 1. Try reading-order sorted text
        text = page.get_text("text", sort=True)
        # 2. Fallback to block extraction if standard text is empty
        if not text.strip():
            blocks = page.get_text("blocks")
            block_texts = [b[4].strip() for b in blocks if len(b) > 4 and b[4].strip()]
            text = "\n".join(block_texts)

        # Clean null characters and excessive whitespace
        text = text.replace("\x00", "").strip()

        # 3. Fallback to OCR if extracted text is missing or corrupted
        if not _is_quality_text(text):
            ocr_text = _ocr_page(page)
            if ocr_text:
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
            text = _extract_from_pdf(file_path)
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