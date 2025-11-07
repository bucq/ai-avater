"""
Chat endpoint for AI conversation
"""
from fastapi import APIRouter, HTTPException
import logging

from app.models.schemas import ChatRequest, ChatResponse, LipSyncData
from app.services.ai_service import AIService

router = APIRouter(tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint - Generate AI response

    Args:
        request: ChatRequest with message and conversation history

    Returns:
        ChatResponse with AI text, emotion, and metadata

    Raises:
        HTTPException: If chat generation fails
    """
    try:
        # Validate request
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        # Initialize AI service
        ai_service = AIService()

        # Convert conversation history to dict format
        history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.conversation_history
        ]

        # Generate AI response
        logger.info(f"Generating response for message: {request.message[:50]}...")
        result = await ai_service.generate_response(request.message, history)

        # Build response
        # Phase 1: Audio and lip sync are not implemented yet
        response = ChatResponse(
            text=result["text"],
            emotion=result["emotion"],
            intensity=result["intensity"],
            keywords=result["keywords"],
            audio_url="",  # TODO: Implement TTS in Phase 2
            lip_sync_data=LipSyncData(
                duration=0.0, mouth_cues=[]  # TODO: Implement in Phase 2
            ),
        )

        logger.info(
            f"Response generated: emotion={result['emotion']}, "
            f"intensity={result['intensity']:.2f}"
        )

        return response

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail="Internal server error during chat generation"
        )
