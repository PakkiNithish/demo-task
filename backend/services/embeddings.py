_model = None


def get_model():
    """Lazy load embedding model. Uses FastEmbed (ONNX) for ultra-low memory, fallback to SentenceTransformer."""
    global _model
    if _model is None:
        try:
            from fastembed import TextEmbedding
            _model = ("fastembed", TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2"))
        except ImportError:
            from sentence_transformers import SentenceTransformer
            _model = ("st", SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2"))
    return _model


def create_embeddings(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []

    model_type, model = get_model()
    if model_type == "fastembed":
        embeddings = list(model.embed(texts))
        return [e.tolist() for e in embeddings]
    else:
        embeddings = model.encode(texts, normalize_embeddings=True)
        return embeddings.tolist()