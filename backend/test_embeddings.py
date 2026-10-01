from services.embeddings import create_embeddings


texts = [
    "The agreement can be terminated by either party.",
    "Either party may end the contract."
]

embeddings = create_embeddings(texts)

print("Number of embeddings:", len(embeddings))
print("Embedding dimension:", len(embeddings[0]))
print("First few values:", embeddings[0][:5])