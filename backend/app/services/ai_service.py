"""
AI Service for chat response generation

Supports:
- Local development: LM Studio (OpenAI-compatible API)
- Lambda environment: AWS Bedrock
"""
import httpx
import json
import logging
from typing import Optional

from app.config import get_settings
from app.services.emotion_analyzer import EmotionAnalyzer

logger = logging.getLogger(__name__)


class AIService:
    """AI response generation service with environment-based backend selection"""

    def __init__(self):
        self.settings = get_settings()
        self.emotion_analyzer = EmotionAnalyzer()

    async def generate_response(
        self, message: str, history: list[dict]
    ) -> dict:
        """
        Generate AI response based on environment

        Args:
            message: User message
            history: Conversation history [{"role": "user/assistant", "content": "..."}]

        Returns:
            dict with keys: text, emotion, intensity, keywords
        """
        if self.settings.ai_backend == "lm_studio":
            return await self._generate_with_lm_studio(message, history)
        else:
            return await self._generate_with_bedrock(message, history)

    async def _generate_with_lm_studio(
        self, message: str, history: list[dict]
    ) -> dict:
        """
        Generate response using LM Studio (OpenAI-compatible API)

        Args:
            message: User message
            history: Conversation history

        Returns:
            Response dict
        """
        try:
            # Build messages for LM Studio
            messages = [
                {
                    "role": "system",
                    "content": "あなたは親しみやすく、明るいAIアシスタントです。ユーザーと楽しく会話してください。",
                }
            ]

            # Add conversation history
            messages.extend(history)

            # Add current user message
            messages.append({"role": "user", "content": message})

            # Call LM Studio API (OpenAI-compatible)
            async with httpx.AsyncClient(timeout=self.settings.lm_studio_timeout) as client:
                response = await client.post(
                    f"{self.settings.lm_studio_endpoint}/v1/chat/completions",
                    json={
                        "model": self.settings.lm_studio_model,
                        "messages": messages,
                        "temperature": 0.7,
                        "max_tokens": 500,
                        "stream": False,
                    },
                )

                response.raise_for_status()
                data = response.json()

                # Extract response text
                response_text = data["choices"][0]["message"]["content"]

                # Analyze emotion
                emotion, intensity = self.emotion_analyzer.analyze(response_text)

                # Extract keywords
                keywords = self.emotion_analyzer.extract_keywords(response_text)

                logger.info(
                    f"LM Studio response generated: {len(response_text)} chars, emotion: {emotion}"
                )

                return {
                    "text": response_text,
                    "emotion": emotion,
                    "intensity": intensity,
                    "keywords": keywords,
                }

        except httpx.TimeoutException:
            logger.error("LM Studio request timed out")
            return self._get_fallback_response(
                "申し訳ありません。応答に時間がかかりすぎています。"
            )
        except httpx.HTTPError as e:
            logger.error(f"LM Studio HTTP error: {e}")
            return self._get_fallback_response(
                "申し訳ありません。サーバーとの通信に問題が発生しました。"
            )
        except Exception as e:
            logger.error(f"LM Studio unexpected error: {e}")
            return self._get_fallback_response(
                "申し訳ありません。予期しないエラーが発生しました。"
            )

    async def _generate_with_bedrock(
        self, message: str, history: list[dict]
    ) -> dict:
        """
        Generate response using AWS Bedrock

        Args:
            message: User message
            history: Conversation history

        Returns:
            Response dict
        """
        try:
            import boto3

            # Initialize Bedrock client
            bedrock = boto3.client(
                service_name="bedrock-runtime", region_name=self.settings.bedrock_region
            )

            # Build conversation for Bedrock
            conversation = []

            # Add system message (if supported by model)
            system_prompt = "あなたは親しみやすく、明るいAIアシスタントです。ユーザーと楽しく会話してください。"

            # Add history
            for msg in history:
                conversation.append({"role": msg["role"], "content": msg["content"]})

            # Add current message
            conversation.append({"role": "user", "content": message})

            # Call Bedrock API (Nova model)
            # Note: Adjust based on actual Nova API format
            response = bedrock.invoke_model(
                modelId=self.settings.bedrock_model_id,
                contentType="application/json",
                accept="application/json",
                body=json.dumps(
                    {
                        "messages": conversation,
                        "system": system_prompt,
                        "max_tokens": 500,
                        "temperature": 0.7,
                    }
                ),
            )

            # Parse response
            response_body = json.loads(response["body"].read())
            response_text = response_body.get("content", [{}])[0].get("text", "")

            # Analyze emotion
            emotion, intensity = self.emotion_analyzer.analyze(response_text)

            # Extract keywords
            keywords = self.emotion_analyzer.extract_keywords(response_text)

            logger.info(
                f"Bedrock response generated: {len(response_text)} chars, emotion: {emotion}"
            )

            return {
                "text": response_text,
                "emotion": emotion,
                "intensity": intensity,
                "keywords": keywords,
            }

        except Exception as e:
            logger.error(f"Bedrock error: {e}")
            return self._get_fallback_response(
                "申し訳ありません。AI サービスに問題が発生しました。"
            )

    def _get_fallback_response(self, error_message: str) -> dict:
        """
        Get fallback response when AI service fails

        Args:
            error_message: Error message to return

        Returns:
            Fallback response dict
        """
        return {
            "text": error_message,
            "emotion": "neutral",
            "intensity": 0.5,
            "keywords": [],
        }
