from services.translation import translate_to_english


text = "నమస్కారం, మీరు ఎలా ఉన్నారు?"

translation = translate_to_english(
    text,
    "TELUGU"
)

print("\n===== TRANSLATION =====\n")
print(translation)