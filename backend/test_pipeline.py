from services.document_parser import extract_text_from_pdf
from services.chunking import chunk_text
from services.embeddings import create_embeddings


pdf_path = "sample.pdf"

# 1. Extract text
text = extract_text_from_pdf(pdf_path)

# 2. Create chunks
chunks = chunk_text(text)

# 3. Create embeddings
embeddings = create_embeddings(chunks)

print("Extracted characters:", len(text))
print("Number of chunks:", len(chunks))
print("Number of embeddings:", len(embeddings))
print("Embedding dimension:", len(embeddings[0]))

print("\nFirst chunk:")
print(chunks[0][:500])

print("\nFirst embedding values:")
print(embeddings[0][:5])