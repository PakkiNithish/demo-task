from services.language_detection import detect_language


texts = [
    "నమస్కారం, మీరు ఎలా ఉన్నారు?",
    "नमस्ते, आप कैसे हैं?",
    "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?",
    "Hello, how are you?"
]


for text in texts:
    language = detect_language(text)

    print(f"\nText: {text}")
    print(f"Detected language: {language}")