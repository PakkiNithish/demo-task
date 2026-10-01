from services.embeddings import create_embeddings


def calculate_semantic_similarity(
    source_text: str,
    translated_text: str
) -> float:
    """
    Calculate semantic similarity between the source text
    and its English translation.

    The score is a similarity signal, not a guarantee of
    translation correctness.
    """

    embeddings = create_embeddings([
        source_text,
        translated_text
    ])

    source_embedding = embeddings[0]
    translated_embedding = embeddings[1]

    similarity = sum(
        a * b
        for a, b in zip(source_embedding, translated_embedding)
    )

    return round(float(similarity), 4)