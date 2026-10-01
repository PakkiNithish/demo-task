from services.llm import client


def translate_to_english(
    text: str,
    source_language: str
) -> str:

    if not text.strip():
        return ""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a professional legal translation assistant. "
                    "Translate the provided Indian regional-language text "
                    "into clear, natural, and accurately structured English while preserving the "
                    "official legal meaning, terminology, and context. "
                    "Organize the translated text into a clean legal structure with clear section headings, "
                    "chapters, and numbered/lettered clauses (e.g., (1), (2), (a), (b)) on separate lines. "
                    "Do not add information or conversational filler that is not present in the source text. "
                    "Return only the structured English translation."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Source language: {source_language}\n\n"
                    f"Text:\n{text}"
                ),
            },
        ],
    )

    return response.choices[0].message.content