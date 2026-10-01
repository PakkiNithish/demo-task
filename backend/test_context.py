from services.document_parser import extract_text_from_pdf
from services.chunking import chunk_text
from services.embeddings import create_embeddings
from services.vector_store import (
    create_collection,
    store_embeddings,
    search_similar,
)
from services.context_builder import build_context
from services.llm import generate_answer


pdf_path = "sample.pdf"


# 1. Extract text from PDF
text = extract_text_from_pdf(pdf_path)

# 2. Create chunks
chunks = chunk_text(text)

# 3. Create embeddings for document chunks
embeddings = create_embeddings(chunks)

# 4. Create Qdrant collection
create_collection()

# 5. Store document embeddings
store_embeddings(chunks, embeddings)


# 6. Get question from user
query = input("\nEnter your question: ")

# 7. Create embedding for the question
query_embedding = create_embeddings([query])[0]

# 8. Retrieve relevant chunks from Qdrant
results = search_similar(query_embedding, limit=3)

# 9. Build context from retrieved chunks
context = build_context(results)

# 10. Generate answer using Groq
answer = generate_answer(query, context)


print("\n===== RETRIEVED CONTEXT =====\n")
print(context)

print("\n===== GENERATED ANSWER =====\n")
print(answer)