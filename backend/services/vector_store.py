from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct


COLLECTION_NAME = "legal_documents"
VECTOR_SIZE = 384


client = QdrantClient(":memory:")


def create_collection():
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=VECTOR_SIZE,
            distance=Distance.COSINE,
        ),
    )


def store_embeddings(
    chunks: list[str],
    embeddings: list[list[float]],
    payloads: list[dict] = None
):
    points = [
        PointStruct(
            id=index,
            vector=embedding,
            payload=payloads[index] if payloads and index < len(payloads) else {"text": chunk},
        )
        for index, (chunk, embedding) in enumerate(zip(chunks, embeddings))
    ]

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
    )


def search_similar(query_embedding: list[float], limit: int = 6):
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=limit,
    )

    return results.points