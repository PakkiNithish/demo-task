from services.document_parser import extract_text_from_pdf
from services.chunking import chunk_text


pdf_path = "sample.pdf"

text = extract_text_from_pdf(pdf_path)

print("Extracted characters:", len(text))

chunks = chunk_text(text)

print("Number of chunks:", len(chunks))

if chunks:
    print("\nFirst chunk:\n")
    print(chunks[0])