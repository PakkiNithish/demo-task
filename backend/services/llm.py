import os

from dotenv import load_dotenv
from groq import Groq


load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


MODEL_NAME = "openai/gpt-oss-20b"


def generate_answer(question: str, context: str) -> str:
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Lawsutra AI, a professional legal document intelligence assistant. "
                    "Answer the user's question directly, accurately, and thoroughly using only the provided document context.\n\n"
                    "Instructions:\n"
                    "1. When answering questions regarding multiple uploaded documents (e.g., describing or summarizing each document):\n"
                    "   - Clearly separate and header your response using each document's actual title/name (e.g. '### [Document Name]').\n"
                    "   - NEVER refer to them as 'Source 1', 'Source 2', 'Source 3', or 'Source 4'. Always use the actual document names.\n"
                    "   - Strictly adhere to user formatting requests (such as 'in 3 points each separately').\n"
                    "2. Ensure each point or explanation is substantive, factual, and faithfully represents the provisions of that specific document.\n"
                    "3. If information is not available in the provided documents, state that clearly without guessing or fabricating details.\n"
                    "4. Format your output in clean, professional markdown."
                ),
            },
            {
                "role": "user",
                "content": f"""
Context:
{context}

Question:
{question}
""",
            },
        ],
    )

    return response.choices[0].message.content