from services.semantic_validation import calculate_semantic_similarity


source = "నమస్కారం, మీరు ఎలా ఉన్నారు?"
translation = "Hello, how are you?"

score = calculate_semantic_similarity(
    source,
    translation
)

print("\n===== SEMANTIC VALIDATION =====")
print(f"Source: {source}")
print(f"Translation: {translation}")
print(f"Similarity score: {score}")