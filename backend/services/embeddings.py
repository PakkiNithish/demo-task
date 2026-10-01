from sentence_transformers import SentenceTransformer


MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

model = SentenceTransformer(MODEL_NAME)


def create_embeddings(texts: list[str]) -> list[list[float]]:
    embeddings = model.encode(
        texts,
        normalize_embeddings=True
    )

    return embeddings.tolist()