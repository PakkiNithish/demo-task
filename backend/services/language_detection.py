from lingua import LanguageDetectorBuilder


detector = LanguageDetectorBuilder.from_all_languages().build()


def detect_language(text: str) -> str:
    if not text.strip():
        return "Unknown"

    language = detector.detect_language_of(text)

    if language is None:
        return "Unknown"

    return language.name