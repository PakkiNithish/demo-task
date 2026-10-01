from services.document_parser import extract_text_from_pdf
from services.chunking import chunk_text
from services.embeddings import create_embeddings
from services.vector_store import (
    create_collection,
    store_embeddings,
    search_similar,
)


pdf_path = "sample.pdf"

# 1. Extract PDF text
text = extract_text_from_pdf(pdf_path)

# 2. Create chunks
chunks = chunk_text(text)

# 3. Create embeddings
embeddings = create_embeddings(chunks)

# 4. Create Qdrant collection
create_collection()

# 5. Store chunks and embeddings
store_embeddings(chunks, embeddings)

print("Stored", len(embeddings), "embeddings in Qdrant.")

# 6. Create a query embedding
query = "What is the content of this document?"
query_embedding = create_embeddings([query])[0]

# 7. Search for similar chunks
results = search_similar(query_embedding, limit=3)

print("\nRetrieved chunks:", len(results))

for i, result in enumerate(results, start=1):
    print(f"\n--- Result {i} ---")
    print("Score:", result.score)
    print("Text:")
    print(result.payload["text"][:500])