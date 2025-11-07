"""
Simple keyword-based emotion analyzer

This is a Phase 1 implementation using keyword matching.
Future versions can use more sophisticated NLP or AI-based analysis.
"""


class EmotionAnalyzer:
    """Analyze emotion from text using keyword matching"""

    # Emotion keywords (Japanese)
    EMOTION_KEYWORDS = {
        "happy": [
            "嬉しい",
            "楽しい",
            "ありがとう",
            "良い",
            "素晴らしい",
            "最高",
            "幸せ",
            "よかった",
            "!",
        ],
        "sad": ["悲しい", "残念", "辛い", "苦しい", "泣", "寂しい"],
        "angry": ["怒", "腹立", "ムカ", "イライラ"],
        "surprised": ["驚", "びっくり", "えっ", "!?", "まさか"],
        "excited": ["わくわく", "ドキドキ", "楽しみ", "待ち遠しい"],
        "worried": ["心配", "不安", "大丈夫", "どうしよう"],
    }

    @staticmethod
    def analyze(text: str) -> tuple[str, float]:
        """
        Analyze emotion from text

        Args:
            text: Text to analyze

        Returns:
            tuple of (emotion, intensity)
            - emotion: One of happy/sad/angry/surprised/excited/worried/neutral
            - intensity: 0.0 to 1.0
        """
        if not text:
            return "neutral", 0.5

        text_lower = text.lower()
        emotion_scores = {}

        # Calculate scores for each emotion
        for emotion, keywords in EmotionAnalyzer.EMOTION_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                emotion_scores[emotion] = score

        # No keywords matched
        if not emotion_scores:
            return "neutral", 0.5

        # Get emotion with highest score
        dominant_emotion = max(emotion_scores, key=emotion_scores.get)
        max_score = emotion_scores[dominant_emotion]

        # Calculate intensity (normalize to 0.0-1.0)
        # More keywords = higher intensity
        intensity = min(0.5 + (max_score * 0.2), 1.0)

        return dominant_emotion, intensity

    @staticmethod
    def extract_keywords(text: str, max_keywords: int = 5) -> list[str]:
        """
        Extract keywords from text (simple implementation)

        Args:
            text: Text to extract keywords from
            max_keywords: Maximum number of keywords to return

        Returns:
            List of keywords
        """
        # Simple approach: Split by common Japanese particles and take longest words
        # This is a Phase 1 implementation

        # Remove common particles
        particles = ["は", "が", "を", "に", "で", "と", "の", "も", "や", "か"]
        for particle in particles:
            text = text.replace(particle, " ")

        # Split and filter
        words = [
            word.strip()
            for word in text.split()
            if word.strip() and len(word.strip()) > 1
        ]

        # Return unique words, limited to max_keywords
        unique_words = list(dict.fromkeys(words))  # Preserve order
        return unique_words[:max_keywords]
