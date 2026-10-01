from lingua import LanguageDetectorBuilder, Language

_detector = None


def get_detector():
    global _detector
    if _detector is None:
        try:
            _detector = LanguageDetectorBuilder.from_languages(
                Language.HINDI,
                Language.TELUGU,
                Language.TAMIL,
                Language.KANNADA,
                Language.MARATHI,
                Language.BENGALI,
                Language.GUJARATI,
                Language.MALAYALAM,
                Language.PUNJABI,
                Language.URDU,
                Language.ENGLISH,
            ).build()
        except Exception as e:
            print(f"Lingua init error: {e}")
            _detector = None
    return _detector


def detect_language(text: str) -> str:
    if not text or not text.strip():
        return "Unknown"

    try:
        detector = get_detector()
        if detector:
            # Detect using first 500 characters for high speed and accuracy
            sample = text[:500]
            language = detector.detect_language_of(sample)
            if language:
                return language.name
    except Exception as e:
        print(f"Language detection error: {e}")

    # Fallback script-based detection
    if any("\u0900" <= c <= "\u097F" for c in text[:200]):
        return "HINDI"
    if any("\u0C00" <= c <= "\u0C7F" for c in text[:200]):
        return "TELUGU"
    if any("\u0B80" <= c <= "\u0BFF" for c in text[:200]):
        return "TAMIL"
    if any("\u0C80" <= c <= "\u0CFF" for c in text[:200]):
        return "KANNADA"

    return "ENGLISH"